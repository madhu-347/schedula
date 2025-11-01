// Add this utility function to filter time slots based on current date/time
export function filterAvailableTimeSlots(
  slots: string[],
  selectedDate: Date
): string[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selected = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  );

  // If selected date is not today, return all slots
  if (selected.getTime() !== today.getTime()) {
    return slots;
  }

  // If selected date is today, filter out past time slots
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  return slots.filter((slot) => {
    // Parse time slot (e.g., "10:00 AM", "02:30 PM")
    const timeMatch = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return true;

    let hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    // Compare with current time (add 30-minute buffer for booking)
    const slotTime = hour * 60 + minute;
    const currentTime = currentHour * 60 + currentMinute + 30;

    return slotTime >= currentTime;
  });
}
