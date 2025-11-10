"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Appointment } from "@/lib/types/appointment";
import { Doctor } from "@/lib/types/doctor";
import Heading from "@/components/ui/Heading";
import DoctorSummary from "@/components/cards/DoctorSummary";
import { getDoctorById } from "@/app/services/doctor.api";
import {
  createAppointment,
  getAppointmentById,
  updateAppointment,
} from "@/app/services/appointments.api";
import { useAuth } from "@/context/AuthContext";
import { filterAvailableTimeSlots } from "@/utils/timeslot";
import { isTimeSlotBooked } from "@/app/services/appointments.api";
import { createNotification } from "@/app/services/notifications.api";
interface DayInfo {
  fullDate: string;
  dayNumber: number;
  dayName: string;
  fullDayName: string;
  monthName: string;
}
export default function AppointmentPage() {
  const { user } = useAuth();
  const patientId = user?.id;
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableDays, setAvailableDays] = useState<DayInfo[]>([]);
  const [timeSlots, setTimeSlots] = useState<{
    morning: string[];
    evening: string[];
  }>({
    morning: [],
    evening: [],
  });
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] =
    useState<Appointment | null>(null);

  const fetchDoctor = async (id: string) => {
    try {
      const response: any = await getDoctorById(id);
      const doctor = response?.doctor || response?.data;
      setDoctor(doctor);
    } catch (error) {
      console.error("Failed to fetch doctor:", error);
    }
  };

  useEffect(() => {
    fetchDoctor(id);
  }, [id]);

  // Check if we're rescheduling an appointment
  useEffect(() => {
    const rescheduleId = searchParams?.get("rescheduleId");
    if (rescheduleId) {
      setIsRescheduling(true);
      // Fetch the appointment to reschedule
      getAppointmentById(rescheduleId).then((appointment) => {
        if (appointment) {
          setAppointmentToReschedule(appointment);
          // Pre-select the date and time from the existing appointment
          setSelectedDate(appointment.date);
          setSelectedSlot(appointment.time);
        }
      });
    }
  }, [searchParams]);

  // Generate time slots based on start and end time
  function generateTimeSlots(
    startTime: string,
    endTime: string,
    intervalMinutes: number = 30
  ): string[] {
    const slots: string[] = [];
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    while (start < end) {
      const next = new Date(start.getTime() + intervalMinutes * 60000);
      const formattedStart = start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const formattedEnd = next.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      slots.push(`${formattedStart} - ${formattedEnd}`);
      start.setTime(next.getTime());
    }
    return slots;
  }
  // Filter time slots based on current time if selected date is today
  function filterSlotsForToday(
    slots: string[],
    selectedDate: string
  ): string[] {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const selectedDateObj = new Date(selectedDate);
    // If selected date is not today, return all slots
    if (selectedDate !== todayStr) {
      return slots;
    }
    // Get current time in minutes since midnight
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    return slots.filter((slot) => {
      // Extract start time from slot (e.g., "10:00 AM - 10:30 AM")
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
      // Convert slot time to minutes since midnight
      const slotTimeInMinutes = hour * 60 + minute;
      // Only show slots that are at least 30 minutes in the future
      return slotTimeInMinutes >= currentTimeInMinutes + 30;
    });
  }

  // Generate next available days based on doctor's availability
  const generateAvailableDays = (doctor: Doctor): DayInfo[] => {
    const days: DayInfo[] = [];
    const today = new Date();
    let daysChecked = 0;
    let daysAdded = 0;
    // Get doctor's available days (convert to lowercase for comparison)
    const doctorAvailableDays =
      doctor.availableDays?.map((day) => day.toLowerCase()) || [];
    // If no available days specified, assume all days are available
    const checkAllDays = doctorAvailableDays.length === 0;
    // Keep looking until we find 5 available days or checked 30 days
    while (daysAdded < 5 && daysChecked < 30) {
      const date = new Date(today);
      date.setDate(today.getDate() + daysChecked);
      // Ensure we get the correct date without timezone issues
      const fullDate = date.toISOString().split("T")[0];
      const fullDayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const dayNumber = date.getDate();
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      // Check if this day is in doctor's available days
      if (
        checkAllDays ||
        doctorAvailableDays.includes(fullDayName.toLowerCase())
      ) {
        days.push({
          fullDate,
          dayNumber,
          dayName,
          fullDayName,
          monthName,
        });
        daysAdded++;
      }
      daysChecked++;
    }
    return days;
  };

  // Update available days when doctor data is loaded
  useEffect(() => {
    if (!doctor) return;
    // Generate available days based on doctor's schedule
    const days = generateAvailableDays(doctor);
    setAvailableDays(days);
    // Set first available day as selected by default
    if (days.length > 0 && !selectedDate) {
      setSelectedDate(days[0].fullDate);
    }
  }, [doctor]);

  // Update time slots when doctor or selected date changes
  useEffect(() => {
    if (!doctor || !selectedDate) return;
    // Generate time slots based on doctor's available time
    const morningSlots =
      doctor.availableTime?.morning.from && doctor.availableTime?.morning.to
        ? generateTimeSlots(
            doctor.availableTime.morning.from,
            doctor.availableTime.morning.to,
            30
          )
        : generateTimeSlots("09:00", "13:00", 30); // Default morning slots
    const eveningSlots =
      doctor.availableTime?.evening.from && doctor.availableTime?.evening.to
        ? generateTimeSlots(
            doctor.availableTime.evening.from,
            doctor.availableTime.evening.to,
            30
          )
        : generateTimeSlots("14:00", "18:00", 30); // Default evening slots
    // Filter slots if today is selected
    const filteredMorning = filterSlotsForToday(morningSlots, selectedDate);
    const filteredEvening = filterSlotsForToday(eveningSlots, selectedDate);
    // Filter out already booked slots
    const filterBookedSlots = async () => {
      try {
        // Get all appointments for this doctor on the selected date
        const response = await fetch(
          `/api/appointment?doctorId=${doctor.id}&date=${selectedDate}`
        );
        const result = await response.json();
        // Get booked time slots (excluding cancelled appointments)
        const bookedSlots = result.success
          ? result.data
              .filter((apt: any) => apt.status !== "Cancelled")
              .map((apt: any) => apt.time)
          : [];
        // Filter out booked slots from available slots
        const availableMorning = filteredMorning.filter(
          (slot) => !bookedSlots.includes(slot)
        );
        const availableEvening = filteredEvening.filter(
          (slot) => !bookedSlots.includes(slot)
        );
        setTimeSlots({
          morning: availableMorning,
          evening: availableEvening,
        });
      } catch (error) {
        console.error("Failed to filter booked slots:", error);
        // Fallback to filtered slots without booking check
        setTimeSlots({
          morning: filteredMorning,
          evening: filteredEvening,
        });
      }
    };
    filterBookedSlots();
    // Reset selected slot when date changes
    setSelectedSlot(null);
  }, [doctor, selectedDate]);

  const handleBookAppointment = async () => {
    if (!doctor) {
      console.log("No doctor, returning");
      return;
    }
    if (!selectedSlot) {
      alert("Please select a time slot before booking!");
      return;
    }
    const userString = localStorage.getItem("userId");
    const user = userString ? JSON.parse(userString) : null;
    if (!user) {
      alert("Please login to book an appointment");
      router.push("/user/login");
      return;
    }
    const selectedDay = availableDays.find((d) => d.fullDate === selectedDate);
    if (!selectedDay) {
      alert("Please select a valid date");
      return;
    }
    if (isRescheduling && appointmentToReschedule) {
      // Update existing appointment (rescheduling)
      try {
        const updatedData = {
          day: selectedDay.fullDayName,
          date: selectedDate,
          time: selectedSlot,
        };
        const response = await updateAppointment(
          appointmentToReschedule.id,
          updatedData
        );
        if (response?.success) {
          // Navigate to the updated appointment details
          router.push(`/user/appointment/${appointmentToReschedule.id}`);
        } else {
          throw new Error("Failed to update appointment");
        }
      } catch (error) {
        console.error("Failed to reschedule appointment:", error);
        alert("Failed to reschedule appointment. Please try again.");
      }
    } else {
      // Create new appointment
      // Create appointment data
      const appointmentData: any = {
        patientId: patientId,
        doctorId: doctor.id,
        day: selectedDay.fullDayName,
        date: selectedDate,
        time: selectedSlot,
        status: "Upcoming",
        paid: false,
        visitType: "First",
      };
      try {
        // Call API to create appointment
        const response = await createAppointment(appointmentData);
        console.log("Create appointment repsonse: ", response);
        if (response) {
          console.log("Creating notification");
          await createNotification({
            recipientId: appointmentData.doctorId,
            recipientRole: "doctor",
            title: "New Appointment",
            message: `You have a new appointment with ${response.patient?.firstName} ${response.patient?.lastName}`,
            type: "appointment",
            targetUrl: `/doctor/appointment`,
            relatedId: appointmentData.id,
            createdAt: new Date().toISOString(),
            read: false,
          });
        }
        // Navigate to review page
        router.push(`/user/appointment/${response?.id}/review`);
      } catch (error) {
        console.error("Failed to create appointment:", error);
        alert("Failed to book appointment. Please try again.");
      }
    }
  };
  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor details...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 pb-15">
      {/* Header */}
      <header className="bg-cyan-500 text-white pt-3 pb-4 rounded-b-3xl shadow-lg">
        <Heading
          heading={
            isRescheduling ? "Reschedule Appointment" : "Schedule Appointment"
          }
        />
        {/* Doctor Summary Card */}
        <DoctorSummary doctor={doctor} />
      </header>
      {/* Main Content */}
      <main className="px-4 py-6 sm:px-6 max-w-3xl mx-auto">
        {/* Appointment Selection Section */}
        <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-5">
            {isRescheduling ? "Select New Date & Time" : "Select Date & Time"}
          </h3>
          {/* Available Days Info */}
          {doctor.availableDays && doctor.availableDays.length > 0 && (
            <div className="mb-4 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
              <p className="text-sm text-cyan-800">
                <strong>Available Days:</strong>{" "}
                {doctor.availableDays.join(", ")}
              </p>
            </div>
          )}
          {/* Date Row */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {availableDays.map((day) => (
              <button
                key={day.fullDate}
                onClick={() => {
                  setSelectedDate(day.fullDate);
                  setSelectedSlot(null); // Reset slot when date changes
                }}
                className={`shrink-0 px-4 py-3 rounded-xl border-2 transition-all ${
                  selectedDate === day.fullDate
                    ? "bg-cyan-500 text-white border-cyan-500 shadow-md scale-105"
                    : "bg-white border-gray-200 text-gray-700 hover:border-cyan-300 hover:shadow-sm"
                }`}
              >
                <div className="text-lg font-bold">{day.dayNumber}</div>
                <div className="text-xs uppercase mt-1 font-medium">
                  {day.dayName}
                </div>
              </button>
            ))}
          </div>
          {/* Current Month Display */}
          {availableDays.length > 0 && (
            <div className="flex items-center gap-2 text-gray-700 mb-6 text-base">
              <Calendar className="w-5 h-5 text-cyan-500" />
              <span className="font-semibold">
                {availableDays[0]?.monthName}, {new Date().getFullYear()}
              </span>
            </div>
          )}
          {/* Morning Slots */}
          {timeSlots.morning.length > 0 && (
            <div className="mb-6">
              <h4 className="text-gray-900 font-bold mb-3 text-base">
                Morning Slots
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeSlots.morning.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all font-semibold ${
                      selectedSlot === slot
                        ? "bg-cyan-500 text-white border-cyan-500 shadow-md scale-105"
                        : "bg-white border-gray-200 text-gray-700 hover:border-cyan-300 hover:shadow-sm"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Evening Slots */}
          {timeSlots.evening.length > 0 && (
            <div className="mb-6">
              <h4 className="text-gray-900 font-bold mb-3 text-base">
                Evening Slots
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeSlots.evening.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all font-semibold ${
                      selectedSlot === slot
                        ? "bg-cyan-500 text-white border-cyan-500 shadow-md scale-105"
                        : "bg-white border-gray-200 text-gray-700 hover:border-cyan-300 hover:shadow-sm"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* No slots available message */}
          {timeSlots.morning.length === 0 && timeSlots.evening.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {selectedDate === new Date().toISOString().split("T")[0]
                  ? "No more slots available today. Please select a future date."
                  : "No time slots available. Please contact the clinic."}
              </p>
            </div>
          )}
          {/* Confirm Button */}
          <Button
            onClick={handleBookAppointment}
            disabled={!selectedSlot}
            className={`cursor-pointer w-full py-6 rounded-xl font-bold shadow-lg transition-all text-base ${
              !selectedSlot && "opacity-50 cursor-not-allowed"
            }`}
          >
            {selectedSlot
              ? isRescheduling
                ? "Confirm Rescheduling"
                : "View Appointment Details"
              : "Select a Time Slot"}
          </Button>
        </div>
      </main>
    </div>
  );
}
