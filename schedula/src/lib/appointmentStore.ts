// src/lib/appointmentStore.ts

export type Appointment = {
  id: number | string; // Allow string IDs from your UI logic
  doctorId: number;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled'; // Match your tab names
  // Add other raw fields if needed, matching your localStorage structure
  type?: "In-person" | "Online";
  tokenNo?: string;
  paymentStatus?: string;
  day?: string;
  patientDetails?: any; // To hold the raw patientDetails
  raw?: any; // To hold the full raw object
};

// Initial data (This will load ONCE when the server starts)
let appointments: Appointment[] = [
  // Example data, adjust to match your structure
  { id: 1, doctorId: 1, doctorName: "Dr. Prakash das", patientName: "Sudharkar Murti", date: "2025-10-30", time: "12:30 pm - 01:00 pm", reason: "Follow-up", status: "Upcoming", tokenNo: "#TKN-443", paymentStatus: "Paid", day: "Oct 30, 2025" },
  { id: 2, doctorId: 1, doctorName: "Dr. Prakash das", patientName: "Test Patient", date: "2025-10-29", time: "09:30 am - 10:00 am", reason: "Headache", status: "Upcoming", tokenNo: "#TKN-4372", paymentStatus: "Not paid", day: "Today" },
];

// --- In-Memory Store Functions ---

export function getAllAppointments(): Appointment[] {
  // In a real app, read from localStorage on client, or DB on server
  // For this simulation, we just return the in-memory array
  return appointments;
}

export function getAppointmentById(id: number | string): Appointment | undefined {
  // Convert both to string for safe comparison
  return appointments.find(appt => appt.id.toString() === id.toString());
}

export function updateAppointment(id: number | string, updatedData: Partial<Omit<Appointment, 'id'>>): Appointment | null {
  const index = appointments.findIndex(appt => appt.id.toString() === id.toString());
  if (index === -1) {
    return null; // Not found
  }
  
  // Merge existing data with updated data
  appointments[index] = { ...appointments[index], ...updatedData };
  
  console.log("Updated Appointment (In-Memory):", appointments[index]);
  // In your app, you also update localStorage here
  if (typeof window !== 'undefined') {
      // Find and update the item in the full localStorage array
      const stored = localStorage.getItem("appointments");
      let storedAppts = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(storedAppts)) storedAppts = [];
      const storeIndex = storedAppts.findIndex((a: any) => a.id.toString() === id.toString());
      if(storeIndex > -1) {
           storedAppts[storeIndex] = { ...storedAppts[storeIndex], ...updatedData };
           localStorage.setItem("appointments", JSON.stringify(storedAppts));
           window.dispatchEvent(new Event("appointment:updated")); // Trigger update
      }
  }

  return appointments[index];
}