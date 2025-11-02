"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Appointment } from "@/lib/types/appointment";
import {
  getAppointmentById,
  updateAppointment,
} from "@/app/services/appointments.api";
import Heading from "@/components/ui/Heading";

export default function EditAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getAppointmentById(id);
      if (!data) {
        setError("Appointment not found");
        return;
      }
      // Ensure patientDetails exists with defaults
      const appointmentWithDefaults = {
        ...data,
        patientDetails: data.patientDetails || {
          fullName: "",
          age: 0,
          gender: "Male" as const,
          phone: "",
          relationship: "Self" as const,
        },
      };
      setAppointment(appointmentWithDefaults as Appointment);
    };
    load();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (!appointment) return;
    const { name, value } = e.target;
    if (name.startsWith("patientDetails.")) {
      const key = name.replace(
        "patientDetails.",
        ""
      ) as keyof Appointment["patientDetails"];
      setAppointment({
        ...appointment,
        patientDetails: {
          ...(appointment.patientDetails || {
            fullName: "",
            age: 0,
            gender: "Male" as const,
            phone: "",
            relationship: "Self" as const,
          }),
          [key]: key === "age" || key === "weight" ? Number(value) : value,
        },
      });
    } else {
      setAppointment({ ...appointment, [name]: value } as Appointment);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;
    setSaving(true);
    setError(null);
    try {
      const result = await updateAppointment(appointment.id, appointment);
      if (result?.success) {
        // Keep localStorage in sync because the list page reads from it
        try {
          const stored = localStorage.getItem("appointments");
          if (stored) {
            const list = JSON.parse(stored) as Appointment[];
            const updatedList = list.map((a) =>
              a.id === appointment.id ? (result.data as Appointment) : a
            );
            localStorage.setItem("appointments", JSON.stringify(updatedList));
          }
        } catch {}
        // Inform other pages
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("appointment:updated"));
        }
        router.push(`/user/appointment/${appointment.id}`);
      } else {
        setError("Failed to update appointment");
      }
    } catch (err) {
      setError("Failed to update appointment");
    } finally {
      setSaving(false);
    }
  };

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{error || "Loading appointment..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 pb-28">
      {/* Banner */}
      <div className="bg-linear-to-br from-cyan-500 to-cyan-600 rounded-b-3xl shadow-lg text-white">
        <div className="max-w-3xl mx-auto p-6">
          <h2 className="text-2xl font-bold">Edit Appointment</h2>
          <p className="text-cyan-50 text-sm">Update your booking details</p>
        </div>
      </div>

      <div className="p-5 max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-6 bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-16"
        >
          {error ? (
            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          ) : null}

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={appointment.date}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Day
                </label>
                <input
                  type="text"
                  name="day"
                  value={appointment.day}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="text"
                  name="time"
                  value={appointment.time}
                  onChange={handleChange}
                  placeholder="e.g. 10:00 AM - 10:30 AM"
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  name="type"
                  value={appointment.type || "In-person"}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                >
                  <option value="In-person">In-person</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>
              {/* don't display these fields */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={appointment.status}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Waiting">Waiting</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div> */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Token No
                </label>
                <input
                  type="text"
                  name="tokenNo"
                  value={appointment.tokenNo}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                  readOnly
                />
              </div> */}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Patient Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="patientDetails.fullName"
                  value={appointment.patientDetails?.fullName || ""}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  name="patientDetails.age"
                  value={appointment.patientDetails?.age || ""}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="patientDetails.gender"
                  value={appointment.patientDetails?.gender || "Male"}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="patientDetails.phone"
                  value={appointment.patientDetails?.phone || ""}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Relationship
                </label>
                <select
                  name="patientDetails.relationship"
                  value={appointment.patientDetails?.relationship || "Self"}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                >
                  <option value="Self">Self</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="patientDetails.weight"
                  value={appointment.patientDetails?.weight || ""}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Problem Description
                </label>
                <textarea
                  name="patientDetails.problem"
                  value={appointment.patientDetails?.problem || ""}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                  placeholder="Briefly describe your problem"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Visit Type
                </label>
                <select
                  name="visitType"
                  value={appointment.visitType || "First"}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all"
                >
                  <option value="First">First Visit</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Report">Report Review</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-cyan-600 text-white font-semibold shadow-md hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
