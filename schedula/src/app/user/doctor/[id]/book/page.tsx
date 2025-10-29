"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import mockData from "@/lib/mockData.json";
import Image from "next/image";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Appointment } from "@/lib/types/appointment";
import { Doctor } from "@/lib/types/doctor";
import Heading from "@/components/ui/Heading";

interface DayInfo {
  fullDate: string;
  dayNumber: number;
  dayName: string;
  monthName: string;
}

export default function AppointmentPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  function generateTimeSlots(
    startTime: string,
    endTime: string,
    intervalMinutes: number
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

  const timeSlots = {
    morning: generateTimeSlots("09:00", "13:00", 30),
    evening: generateTimeSlots("14:00", "18:00", 30),
  };

  const generateNextFiveDays = (): DayInfo[] => {
    const days: DayInfo[] = [];
    const today = new Date();

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayNumber = date.getDate();
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      days.push({
        fullDate: date.toISOString().split("T")[0],
        dayNumber,
        dayName,
        monthName,
      });
    }

    return days;
  };

  const days = generateNextFiveDays();

  const saveAppointment = (
    appointment: Omit<Appointment, "id" | "patientDetails">
  ) => {
    const existing = localStorage.getItem("appointments");
    const appointments: Appointment[] = existing ? JSON.parse(existing) : [];

    const newAppointment = {
      id: Date.now(), // Generate unique ID
      ...appointment,
    };

    // Convert to unknown first to satisfy TypeScript when casting to Appointment
    appointments.push(newAppointment as Appointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));
  };

  useEffect(() => {
    if (id && mockData.doctors) {
      const found = mockData.doctors.find(
        (doc: any) => doc.id.toString() === id
      );
      setDoctor(found || null);
    }
  }, [id]);

  useEffect(() => {
    if (days.length > 0 && !selectedDate) {
      setSelectedDate(days[0].fullDate);
    }
  }, [days, selectedDate]);

  const handleBookAppointment = async () => {
    if (!doctor) {
      console.log("No doctor, returning");
      return;
    }

    if (!selectedSlot) {
      alert("Please select a time slot before booking!");
      return;
    }

    const selectedDay = days.find((d) => d.fullDate === selectedDate);

    // Create appointment with doctor image included
    const appointment: Omit<Appointment, "id" | "patientDetails"> = {
      tokenNo: `TKN-${Math.floor(Math.random() * 10000)}`,
      doctorName: doctor.name,
      doctorImage:
        doctor.profilePicture || doctor.imageUrl || "/male-doctor-avatar.png",
      specialty: doctor.specialty,
      day: selectedDay?.dayName || "",
      date: `${selectedDay?.monthName} ${
        selectedDay?.dayNumber
      }, ${new Date().getFullYear()}`,
      timeSlot: selectedSlot,
      status: "Upcoming",
      paymentStatus: "Not paid",
    };

    // Send notification to doctor
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorName: appointment.doctorName,
          message: `New appointment booked on ${appointment.date} at ${appointment.timeSlot}.`,
        }),
      });
    } catch (err) {
      console.error("Failed to send notification:", err);
    }

    saveAppointment(appointment);

    router.push("/user/appointment/review");
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
        <Heading heading="Schedule Appointment" />

        {/* Doctor Summary Card */}
        <div className="max-w-3xl mx-auto px-5 mt-3">
          <div className="bg-white text-gray-900 rounded-2xl p-5 flex items-center gap-4 shadow-md">
            <div className="flex-1">
              <h2 className="text-lg font-bold leading-tight text-gray-900">
                {doctor.name}
              </h2>
              <p className="text-sm text-gray-600 font-medium mt-0.5">
                {doctor.specialty}
              </p>
              <p className="text-sm text-cyan-600 font-semibold mt-2">
                {doctor.qualification || "MBBS, MS (Surgeon)"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {doctor.fellowship || "Fellow of Sanskara netralaya, chennai"}
              </p>
            </div>
            <Image
              src={
                doctor.profilePicture ||
                doctor.imageUrl ||
                "/male-doctor-avatar.png"
              }
              alt={doctor.name}
              width={80}
              height={80}
              className="rounded-xl w-20 h-20 object-cover ring-2 ring-cyan-100"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 sm:px-6 max-w-3xl mx-auto">
        {/* Appointment Selection Section */}
        <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-5">
            Select Date & Time
          </h3>

          {/* Date Row */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {days.map((day) => (
              <button
                key={day.fullDate}
                onClick={() => setSelectedDate(day.fullDate)}
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
          <div className="flex items-center gap-2 text-gray-700 mb-6 text-base">
            <Calendar className="w-5 h-5 text-cyan-500" />
            <span className="font-semibold">
              {days[0]?.monthName}, {new Date().getFullYear()}
            </span>
          </div>

          {/* Morning Slots */}
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

          {/* Evening Slots */}
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

          {/* Confirm Button */}
          <Button
            onClick={handleBookAppointment}
            disabled={!selectedSlot}
            className={`cursor-pointer w-full py-6 rounded-xl font-bold shadow-lg transition-all text-base ${
              !selectedSlot && "opacity-50 cursor-not-allowed"
            }`}
          >
            {selectedSlot ? "View Appointment Details" : "Select a Time Slot"}
          </Button>
        </div>
      </main>
    </div>
  );
}
