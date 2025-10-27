"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import mockData from "@/lib/mockData.json";
import Image from "next/image";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default function AppointmentPage() {
  const params = useParams();
  const id = params?.doctorId as string;
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
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

  useEffect(() => {
    if (id && mockData.doctors) {
      const found = mockData.doctors.find(
        (doc: any) => doc.id.toString() === id
      );
      setDoctor(found);
    }
  }, [id]);

  const generateNextFiveDays = () => {
    const days = [];
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

  // Auto-select first date
  useEffect(() => {
    if (days.length > 0 && !selectedDate) {
      setSelectedDate(days[0].fullDate);
    }
  }, [days, selectedDate]);

  const handleBookAppointment = () => {
      localStorage.setItem("selectedDoctor", JSON.stringify(doctor));
    if (!selectedSlot) {
      alert("Please select a time slot before booking!");
      return;
    }

    const selectedDay = days.find((d) => d.fullDate === selectedDate);
    const appointment = {
      doctorName: doctor?.name,
      specialty: doctor?.specialty,
      date: `${selectedDay?.monthName} ${
        selectedDay?.dayNumber
      }, ${new Date().getFullYear()}`,
      timeSlot: selectedSlot,
    };

    localStorage.setItem("appointment", JSON.stringify(appointment));
    router.push("/user/appointment/review");
  };

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-500">Loading doctor details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-cyan-500 text-white pt-6 pb-5 rounded-b-3xl md:rounded-b-md shadow-md">
        <div className="max-w-3xl mx-auto px-5 flex items-center gap-3">
          <Link
            href={`/user/doctor/${doctor.id}`}
            className="p-2 -ml-2 rounded-full hover:bg-cyan-600/30 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">Book Appointment</h1>
        </div>

        {/* Doctor Summary Card */}
        <div className="max-w-3xl mx-auto px-5 mt-4">
          <div className="bg-white text-gray-900 rounded-2xl p-4 flex items-center justify-between shadow">
            <div>
              <h2 className="text-lg font-bold leading-tight">{doctor.name}</h2>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
              <p className="text-sm text-cyan-600 font-medium mt-1">
                MBBS ,MS (Surgeon)
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Fellow of Sanskara netralaya, chennai
              </p>
            </div>
            <Image
              src={doctor.profilePicture || "/male-doctor.png"}
              alt={doctor.name}
              width={64}
              height={64}
              className="rounded-lg w-25 h-25 object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 sm:px-6 max-w-3xl mx-auto">
        {/* Appointment Selection Section */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-4">
            Select Date & Time
          </h3>

          {/* Date Row */}
          <div className="flex gap-2 sm:gap-3 mb-5 overflow-x-auto pb-2 scrollbar-hide">
            {days.map((day) => (
              <button
                key={day.fullDate}
                onClick={() => setSelectedDate(day.fullDate)}
                className={`shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all ${
                  selectedDate === day.fullDate
                    ? "bg-cyan-500 text-white border-cyan-500 shadow-md"
                    : "bg-white border-gray-200 text-gray-700 hover:border-cyan-300"
                }`}
              >
                <div className="text-base sm:text-lg font-bold">
                  {day.dayNumber}
                </div>
                <div className="text-xs uppercase mt-0.5">{day.dayName}</div>
              </button>
            ))}
          </div>

          {/* Current Month Display */}
          <div className="flex items-center gap-2 text-gray-600 mb-5 text-sm sm:text-base">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
            <span className="font-medium">
              {days[0]?.monthName}, {new Date().getFullYear()}
            </span>
          </div>

          {/* Morning Slots */}
          <div className="mb-6">
            <h4 className="text-gray-900 font-semibold mb-3 text-sm sm:text-base">
              Morning Slots
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {timeSlots.morning.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2.5 sm:p-3 text-xs sm:text-sm rounded-lg border-2 transition-all font-medium ${
                    selectedSlot === slot
                      ? "bg-cyan-500 text-white border-cyan-500 shadow-md"
                      : "bg-white border-gray-200 text-gray-700 hover:border-cyan-300"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Evening Slots */}
          <div className="mb-6">
            <h4 className="text-gray-900 font-semibold mb-3 text-sm sm:text-base">
              Evening Slots
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {timeSlots.evening.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2.5 sm:p-3 text-xs sm:text-sm rounded-lg border-2 transition-all font-medium ${
                    selectedSlot === slot
                      ? "bg-cyan-500 text-white border-cyan-500 shadow-md"
                      : "bg-white border-gray-200 text-gray-700 hover:border-cyan-300"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleBookAppointment}
            disabled={!selectedSlot}
            className={`w-full py-3 sm:py-4 rounded-xl font-semibold shadow-lg transition-all text-sm sm:text-base ${
              selectedSlot
                ? "bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {selectedSlot ? "Book Appointment" : "Select a Time Slot"}
          </button>
        </div>
      </main>
    </div>
  );
}
