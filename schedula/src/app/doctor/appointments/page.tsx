"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  User,
  Video,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Appointment {
  id: number;
  patientName: string;
  type: "In-person" | "Online";
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  problem: string;
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<
    "Upcoming" | "Completed" | "Cancelled"
  >("Upcoming");

  // Fetch appointment data from localStorage (simulating backend)
  useEffect(() => {
    const stored = localStorage.getItem("doctorAppointments");
    if (stored) {
      setAppointments(JSON.parse(stored));
    } else {
      // Example static data (temporary) - with proper type annotations
      const sample: Appointment[] = [
        {
          id: 1,
          patientName: "Ananya Sharma",
          type: "Online",
          date: "Oct 30, 2025",
          time: "10:00 AM",
          status: "Upcoming",
          problem: "Skin allergy consultation",
        },
        {
          id: 2,
          patientName: "Ravi Kumar",
          type: "In-person",
          date: "Oct 25, 2025",
          time: "2:30 PM",
          status: "Completed",
          problem: "Migraine headache check-up",
        },
        {
          id: 3,
          patientName: "Priya Verma",
          type: "Online",
          date: "Oct 27, 2025",
          time: "11:45 AM",
          status: "Upcoming",
          problem: "Anxiety and stress management",
        },
        {
          id: 4,
          patientName: "Rahul Menon",
          type: "In-person",
          date: "Oct 22, 2025",
          time: "3:00 PM",
          status: "Cancelled",
          problem: "Follow-up for back pain",
        },
        {
          id: 5,
          patientName: "Divya Patel",
          type: "Online",
          date: "Oct 31, 2025",
          time: "5:30 PM",
          status: "Upcoming",
          problem: "Diet consultation for PCOS",
        },
        {
          id: 6,
          patientName: "Mohit Sinha",
          type: "In-person",
          date: "Oct 19, 2025",
          time: "9:00 AM",
          status: "Completed",
          problem: "Routine general check-up",
        },
        {
          id: 7,
          patientName: "Sanya Gupta",
          type: "Online",
          date: "Nov 1, 2025",
          time: "1:15 PM",
          status: "Upcoming",
          problem: "Sleep pattern analysis",
        },
        {
          id: 8,
          patientName: "Neeraj Bansal",
          type: "In-person",
          date: "Oct 24, 2025",
          time: "4:00 PM",
          status: "Cancelled",
          problem: "Physiotherapy follow-up",
        },
      ];
      setAppointments(sample);
      localStorage.setItem("doctorAppointments", JSON.stringify(sample));
    }
  }, []);

  const filteredAppointments = appointments.filter(
    (a) => a.status === activeTab
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/doctor/dashboard`}
              className="p-2 -ml-2 rounded-full hover:bg-cyan-600/30 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              My Appointments
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          {(["Upcoming", "Completed", "Cancelled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium transition-colors ${
                activeTab === tab
                  ? "text-[#46C2DE] border-b-2 border-[#46C2DE]"
                  : "text-gray-600 hover:text-[#46C2DE]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Appointment Cards */}
        {filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAppointments.map((a) => (
              <div
                key={a.id}
                className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 space-y-3 transition hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-[#46C2DE]" />
                      {a.patientName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{a.problem}</p>
                  </div>
                  <span
                    className={`text-sm px-3 py-1 rounded-full font-medium ${
                      a.status === "Upcoming"
                        ? "bg-cyan-50 text-cyan-600"
                        : a.status === "Completed"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 mt-3">
                  <CalendarDays className="w-4 h-4" />
                  {a.date}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {a.time}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  {a.type === "Online" ? (
                    <Video className="w-4 h-4 text-cyan-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {a.type}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-4">
                  {a.status === "Upcoming" && (
                    <Button
                      variant="outline"
                      className="border-[#46C2DE] text-[#46C2DE] hover:bg-[#E6F7FA]"
                      onClick={() =>
                        alert(`Viewing details for ${a.patientName}`)
                      }
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-16">
            No {activeTab.toLowerCase()} appointments.
          </div>
        )}
      </div>
    </div>
  );
}
