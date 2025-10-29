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

interface AppointmentUI {
  id: number | string;
  patientName: string;
  type: "In-person" | "Online";
  date: string;
  time: string;
  status: string;
  problem?: string;
  raw?: any;
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentUI[]>([]);
  const [activeTab, setActiveTab] = useState<
    "Upcoming" | "Completed" | "Cancelled"
  >("Upcoming");
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentUI | null>(null);
  const STORAGE_KEY = "appointments";

  // Transform data from your localStorage JSON
  const transformStoredToUI = (item: any): AppointmentUI => {
    const patientName = item?.patientDetails?.fullName || "Patient";
    const type = item?.type === "Online" ? "Online" : "In-person";

    let status = item?.status ?? "Upcoming";
    if (status === "Waiting") status = "Upcoming";
    if (status.toLowerCase() === "cancelled") status = "Cancelled";

    const problem = item?.patientDetails?.problem ?? "";

    return {
      id: item?.id ?? `${item?.doctorName}-${item?.tokenNo ?? Math.random()}`,
      patientName,
      type,
      date: item?.date ?? "",
      time: item?.timeSlot ?? "",
      status,
      problem,
      raw: item,
    };
  };

  //  Load and filter for logged-in doctor
  const loadAppointments = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return setAppointments([]);

      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      processAndSet(arr);
    } catch (e) {
      console.error("Error loading appointments:", e);
      setAppointments([]);
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

      //  Match doctorName case-insensitively
      const filtered = arr.filter(
        (a) =>
          a?.doctorName &&
          a.doctorName.trim().toLowerCase() === String(name)
      );

      const transformed = filtered.map(transformStoredToUI);
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
    () =>
      appointments.filter(
        (a) => a.status.toLowerCase() === activeTab.toLowerCase()
      ),
    [appointments, activeTab]
  );

  const closeModal = () => setSelectedAppointment(null);

  // ESC key closes modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

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
          {["Upcoming", "Completed", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
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
                className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 space-y-3 hover:shadow-md"
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
                  {a.raw?.day}, {a.date}
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
                  {a.status === "Upcoming" && (
                    <Button
                      variant="outline"
                      className="border-[#46C2DE] text-[#46C2DE] hover:bg-[#E6F7FA]"
                      onClick={() => setSelectedAppointment(a)}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-16">
            No {activeTab.toLowerCase()} appointments.
          </p>
        )}
      </div>

      {/* Modal for Patient Details */}
      {selectedAppointment && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
            onClick={closeModal}
          ></div>

          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Appointment Details
              </h2>

              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Token No:</span>{" "}
                  {selectedAppointment.raw?.tokenNo}
                </p>
                <p>
                  <span className="font-medium">Patient Name:</span>{" "}
                  {selectedAppointment.raw?.patientDetails?.fullName}
                </p>
                <p>
                  <span className="font-medium">Age:</span>{" "}
                  {selectedAppointment.raw?.patientDetails?.age}
                </p>
                <p>
                  <span className="font-medium">Gender:</span>{" "}
                  {selectedAppointment.raw?.patientDetails?.gender}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {selectedAppointment.raw?.patientDetails?.phone}
                </p>
                <p>
                  <span className="font-medium">Problem:</span>{" "}
                  {selectedAppointment.raw?.patientDetails?.problem}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {selectedAppointment.raw?.day}, {selectedAppointment.date}
                </p>
                <p>
                  <span className="font-medium">Time Slot:</span>{" "}
                  {selectedAppointment.raw?.timeSlot}
                </p>
                <p>
                  <span className="font-medium">Payment Status:</span>{" "}
                  {selectedAppointment.raw?.paymentStatus}
                </p>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  className="bg-[#46C2DE] hover:bg-[#36A9C6] text-white"
                  onClick={closeModal}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
