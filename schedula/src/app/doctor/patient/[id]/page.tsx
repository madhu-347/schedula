"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, Calendar, HeartPulse } from "lucide-react";
import { getAppointmentsByPatient } from "@/app/services/appointments.api";

export default function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  // ✅ unwrap params
  const { id } = React.use(params) ?? { id: "" };

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all appointments of this patient
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getAppointmentsByPatient(id);
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading patient appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ✅ Sort and get latest + full history
  const { latest, history } = useMemo(() => {
    if (!appointments.length) return { latest: null, history: [] };

    const sorted = [...appointments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      latest: sorted[0],
      history: sorted,
    };
  }, [appointments]);

  // ✅ Merge patientDetails across history → complete profile
  const mergedDetails = useMemo(() => {
    const details: any = {};

    history.forEach((apt) => {
      const pd = apt.patientDetails;
      if (!pd) return;

      Object.keys(pd).forEach((key) => {
        if (pd[key] !== undefined && pd[key] !== null) {
          details[key] = pd[key];
        }
      });
    });

    return details;
  }, [history]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="min-h-screen px-6 py-10">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition mb-4"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <p className="text-gray-500">Patient not found.</p>
      </div>
    );
  }

  const p = mergedDetails;

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 flex gap-6">
          <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center">
            <User className="w-6 h-6 text-cyan-600" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {p.fullName}
            </h2>

            <p className="text-sm text-gray-700 mt-1">
              {p.age} yrs • {p.gender}
            </p>

            {p.phone && (
              <p className="text-sm text-gray-700 mt-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-500" />
                {p.phone}
              </p>
            )}

            {latest.date && (
              <p className="text-sm text-gray-700 mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-500" />
                Last Visit: {new Date(latest.date).toDateString()}
              </p>
            )}

            {p.problem && (
              <p className="text-sm text-gray-700 mt-2 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-red-500" />
                {p.problem}
              </p>
            )}

            {p.weight && (
              <p className="text-sm text-gray-700 mt-2">
                Weight: {p.weight} kg
              </p>
            )}

            {p.relationship && (
              <p className="text-sm text-gray-700 mt-2">
                Relationship: {p.relationship}
              </p>
            )}

            <p className="text-sm text-gray-700 mt-2">
              Total Visits: {history.length}
            </p>

            <button
              onClick={() => router.push(`/doctor/patient/${id}/history`)}
              className="text-sm text-cyan-600 font-medium mt-4 hover:underline flex items-center gap-1"
            >
              View Full Medical History →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
