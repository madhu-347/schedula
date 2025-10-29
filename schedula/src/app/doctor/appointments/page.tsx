"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  User,
  Video,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/useToast";

interface AppointmentUI {
  id: number | string;
  patientName: string;
  type: "In-person" | "Online";
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  problem?: string;
  raw?: any;
}

type TabStatus = "Upcoming" | "Completed" | "Cancelled";

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentUI[]>([]);
  const [activeTab, setActiveTab] = useState<TabStatus>("Upcoming");
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentUI | null>(null);
  const STORAGE_KEY = "appointments";

  // Transform data from your localStorage JSON
  const transformStoredToUI = (item: any): AppointmentUI => {
    const patientName = item?.patientDetails?.fullName || "Patient";
    const type: "In-person" | "Online" =
      item?.type === "Online" ? "Online" : "In-person";

    const date = item?.date ?? "";
    const time = item?.timeSlot ?? item?.time ?? "";

    // Normalize status to match our type
    let status: TabStatus = "Upcoming";
    const rawStatus = String(item?.status ?? "Upcoming").trim();
    if (rawStatus === "Completed") {
      status = "Completed";
    } else if (rawStatus === "Cancelled") {
      status = "Cancelled";
    } else if (rawStatus === "Waiting") {
      status = "Upcoming";
    } else {
      status = "Upcoming";
    }

    const problem = item?.patientDetails?.problem ?? item?.problem ?? "";

    return {
      id: item?.id ?? `${item?.doctorName}-${item?.tokenNo ?? Math.random()}`,
      patientName,
      type,
      date,
      time,
      status,
      problem,
      raw: item,
    };
  };

  // Load and filter for logged-in doctor
  const loadAppointments = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setAppointments([]);
        return;
      }

      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      processAndSet(arr);
    } catch (e) {
      console.error("Error loading appointments:", e);
      setAppointments([]);
    }
  };

  const completeAppointment = () => {
    if (!selectedAppointment) return;

    try {
      // Get all appointments from localStorage
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];

      // Find and update the appointment status
      const updatedAppointments = arr.map((apt: any) => {
        if (apt.id === selectedAppointment.raw.id) {
          return { ...apt, status: "Completed" };
        }
        return apt;
      });

      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAppointments));

      // Also update currentAppointment if it's the same appointment
      const currentAppointmentStr = localStorage.getItem("currentAppointment");
      if (currentAppointmentStr) {
        const currentAppointment = JSON.parse(currentAppointmentStr);
        if (currentAppointment.id === selectedAppointment.raw.id) {
          localStorage.setItem(
            "currentAppointment",
            JSON.stringify({ ...currentAppointment, status: "Completed" })
          );
        }
      }

      toast({
        title: "Appointment Completed",
        description: "The appointment has been marked as completed.",
      });

      // Reload appointments to reflect changes
      loadAppointments();

      // Close modal
      closeModal();
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast({
        title: "Error",
        description: "Failed to complete appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const processAndSet = (arr: any[]) => {
    try {
      const userStr = localStorage.getItem("user");
      const expiryStr = localStorage.getItem("userExpiry");
      const expiry = expiryStr ? Number(expiryStr) : 0;

      if (!userStr || !expiry || Date.now() >= expiry) {
        setDoctorName(null);
        setAppointments([]);
        return;
      }

      const user = JSON.parse(userStr);
      if (!user || user.type !== "doctor") {
        setDoctorName(null);
        setAppointments([]);
        return;
      }

      const name = user.name?.trim().toLowerCase();
      setDoctorName(user.name);

      // Match doctorName case-insensitively
      const filtered = arr.filter(
        (a) =>
          a?.doctorName && a.doctorName.trim().toLowerCase() === String(name)
      );

      const transformed = filtered.map(transformStoredToUI);

      // Optional: sort by date/time if needed
      transformed.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`).getTime();
        const dateB = new Date(`${b.date} ${b.time}`).getTime();
        return dateA - dateB;
      });

      setAppointments(transformed);
    } catch (err) {
      console.error("Error processing appointments", err);
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadAppointments();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) loadAppointments();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filteredAppointments = useMemo(
    () => appointments.filter((a) => a.status === activeTab),
    [appointments, activeTab]
  );

  const closeModal = () => setSelectedAppointment(null);

  // ESC key closes modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const tabs: TabStatus[] = ["Upcoming", "Completed", "Cancelled"];

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/doctor/dashboard"
              className="p-2 -ml-2 rounded-full hover:bg-cyan-600/30 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                My Appointments
              </h1>
              {doctorName && (
                <p className="text-sm text-gray-500 mt-1">
                  Doctor: {doctorName}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
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
                className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-[#46C2DE]" />
                      {a.patientName}
                    </h2>
                    {a.problem && (
                      <p className="text-sm text-gray-500 mt-1">{a.problem}</p>
                    )}
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
                  {a.raw?.day && `${a.raw.day}, `}
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

                <div className="flex justify-end gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="border-[#46C2DE] text-[#46C2DE] hover:bg-[#E6F7FA]"
                    onClick={() => setSelectedAppointment(a)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <svg
              className="w-48 h-48 mb-6 opacity-50"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Clipboard illustration */}
              <g transform="translate(120, 140) rotate(-15)">
                <rect
                  x="0"
                  y="20"
                  width="120"
                  height="160"
                  rx="8"
                  fill="#E5E7EB"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                />
                <rect
                  x="30"
                  y="0"
                  width="60"
                  height="30"
                  rx="6"
                  fill="#46C2DE"
                />
                <circle cx="50" cy="10" r="4" fill="white" />
                <circle cx="70" cy="10" r="4" fill="white" />
              </g>

              <g transform="translate(180, 150) rotate(10)">
                <rect
                  x="0"
                  y="20"
                  width="140"
                  height="180"
                  rx="8"
                  fill="#F3F4F6"
                  stroke="#6B7280"
                  strokeWidth="2"
                />
                <rect
                  x="35"
                  y="0"
                  width="70"
                  height="35"
                  rx="8"
                  fill="#46C2DE"
                />
                <circle cx="60" cy="12" r="5" fill="white" />
                <circle cx="85" cy="12" r="5" fill="white" />
              </g>
            </svg>

            <p className="text-lg font-medium text-gray-700 mb-2">
              No {activeTab.toLowerCase()} appointments
            </p>
            <p className="text-sm text-gray-500 text-center">
              Your {activeTab.toLowerCase()} appointments will appear here
            </p>
          </div>
        )}
      </div>

      {/* Modal for Patient Details */}
      {selectedAppointment && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
            onClick={closeModal}
          ></div>

          <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Appointment Details
              </h2>

              <div className="space-y-3 text-sm text-gray-700">
                {selectedAppointment.raw?.tokenNo && (
                  <p>
                    <span className="font-medium">Token No:</span>{" "}
                    {selectedAppointment.raw.tokenNo}
                  </p>
                )}
                <p>
                  <span className="font-medium">Patient Name:</span>{" "}
                  {selectedAppointment.patientName}
                </p>
                {selectedAppointment.raw?.patientDetails?.age && (
                  <p>
                    <span className="font-medium">Age:</span>{" "}
                    {selectedAppointment.raw.patientDetails.age}
                  </p>
                )}
                {selectedAppointment.raw?.patientDetails?.gender && (
                  <p>
                    <span className="font-medium">Gender:</span>{" "}
                    {selectedAppointment.raw.patientDetails.gender}
                  </p>
                )}
                {selectedAppointment.raw?.patientDetails?.phone && (
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedAppointment.raw.patientDetails.phone}
                  </p>
                )}
                {selectedAppointment.problem && (
                  <p>
                    <span className="font-medium">Problem:</span>{" "}
                    {selectedAppointment.problem}
                  </p>
                )}
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {selectedAppointment.raw?.day &&
                    `${selectedAppointment.raw.day}, `}
                  {selectedAppointment.date}
                </p>
                <p>
                  <span className="font-medium">Time Slot:</span>{" "}
                  {selectedAppointment.time}
                </p>
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {selectedAppointment.type}
                </p>
                {selectedAppointment.raw?.paymentStatus && (
                  <p>
                    <span className="font-medium">Payment Status:</span>{" "}
                    {selectedAppointment.raw.paymentStatus}
                  </p>
                )}
              </div>

              <div className="flex justify-around mt-6 gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={closeModal}
                >
                  Close
                </Button>
                {selectedAppointment.status === "Upcoming" && (
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    onClick={completeAppointment}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
