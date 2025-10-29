"use client";

import React, { useEffect, useMemo, useState } from "react";
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

interface AppointmentUI {
  id: number | string;
  patientName: string;
  type: "In-person" | "Online";
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Canceled";
  problem?: string;
  raw?: any; // original object if you need it later
}

type TabStatus = "Upcoming" | "Completed" | "Canceled";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentUI[]>([]);
  const [activeTab, setActiveTab] = useState<TabStatus>("Upcoming");
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const STORAGE_KEY = "appointments";

  // Transform a stored appointment object (your JSON) into AppointmentUI
  const transformStoredToUI = (item: any): AppointmentUI => {
    const patientName =
      item?.patientDetails?.fullName ||
      item?.patientDetails?.name ||
      item?.tokenNo ||
      item?.patientName ||
      "Patient";

    const type: "In-person" | "Online" =
      item?.type === "Online" ? "Online" : "In-person";

    const date = item?.date ?? item?.appointmentDate ?? "";
    const time = item?.timeSlot ?? item?.time ?? "";

    // Normalize status to match our type
    let status: TabStatus = "Upcoming";
    const rawStatus = String(item?.status ?? "Upcoming").trim();
    if (rawStatus === "Completed") status = "Completed";
    else if (rawStatus === "Canceled" || rawStatus === "Cancelled")
      status = "Canceled";
    else status = "Upcoming";

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

  // Read and filter appointments from localStorage -> only for logged-in doctor
  const loadAppointments = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setAppointments([]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        // if single object stored
        const arr = parsed ? [parsed] : [];
        processAndSet(arr);
      } else {
        processAndSet(parsed);
      }
    } catch (e) {
      console.error("Failed to read/parse appointments from localStorage", e);
      setAppointments([]);
    }
  };

  // Filters for current logged-in doctor (match by doctorName === user.name)
  const processAndSet = (arr: any[]) => {
    // read user (doctor) from localStorage
    try {
      const userStr = localStorage.getItem("user");
      const expiryStr = localStorage.getItem("userExpiry");
      const expiry = expiryStr ? Number(expiryStr) : 0;
      if (!userStr || !expiry || Date.now() >= expiry) {
        // not logged in or expired — clear doctorName and appointments
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
      const name = user.name;
      setDoctorName(name);

      // filter by doctorName match
      const filtered = arr.filter(
        (a) => String(a?.doctorName ?? "").trim() === String(name).trim()
      );

      // transform
      const transformed = filtered.map(transformStoredToUI);

      // optional: sort by date/time if needed
      setAppointments(transformed);
    } catch (err) {
      console.error("Error processing appointments", err);
      setAppointments([]);
    }
  };

  // load on mount
  useEffect(() => {
    loadAppointments();

    // same-tab event: dispatch when you update appointments in the scheduling flow
    const onAppointmentUpdated = () => {
      loadAppointments();
    };

    // cross-tab storage event
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === STORAGE_KEY) {
        loadAppointments();
      }
    };

    window.addEventListener("appointment:updated", onAppointmentUpdated);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("appointment:updated", onAppointmentUpdated);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filtered appointments for active tab
  const filteredAppointments = useMemo(
    () =>
      appointments.filter((a) => {
        return a.status === activeTab;
      }),
    [appointments, activeTab]
  );

  const tabs: TabStatus[] = ["Upcoming", "Completed", "Canceled"];

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

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
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
