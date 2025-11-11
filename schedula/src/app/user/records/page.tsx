"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Calendar, FileText, Stethoscope, User, Clock } from "lucide-react";
import { getPrescriptionByPatient } from "@/app/services/prescription.api";
import { getAppointmentsByPatient } from "@/app/services/appointments.api";
import type { PrescriptionResponse } from "@/lib/types/prescription";
import type { Appointment } from "@/lib/types/appointment";

export default function PrescriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const patientId = user?.id ?? "";

  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [followUps, setFollowUps] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !patientId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const [rxData, appts] = await Promise.all([
          getPrescriptionByPatient(patientId),
          getAppointmentsByPatient(patientId),
        ]);

        const prescriptionList: PrescriptionResponse[] = Array.isArray(rxData)
          ? rxData.filter(Boolean)
          : [];

        const followUpList = (Array.isArray(appts) ? appts : []).filter(
          (a) => a.visitType === "Follow-up" && a.status === "Upcoming"
        );

        setPrescriptions(prescriptionList);
        setFollowUps(followUpList);
      } catch (e) {
        console.error("Load failed:", e);
        setErr("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [authLoading, patientId]);

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user…</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 px-6 py-8 max-w-7xl mx-auto border-l-0 lg:divide-x lg:divide-gray-200">
        {/* LEFT: Prescription list */}
         <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
            <p className="text-gray-600 mt-1">View your prescription history</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          ) : err ? (
            <Card className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Error</h3>
              <p className="text-gray-500">{err}</p>
            </Card>
          ) : prescriptions.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-cyan-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No prescriptions found
              </h3>
              <p className="text-gray-500">
                You don’t have any prescriptions yet.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col mr-2 gap-6 mb-16">
              {prescriptions.map((p) => (
                <Link key={p.id} href={`/user/prescription/${p.id}`}>
                  <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 w-full p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Prescription</h2>
                      <span className="text-sm text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {p.doctor && (
                        <div className="flex items-center gap-3">
                          <Stethoscope className="w-5 h-5 text-cyan-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Dr. {p.doctor.firstName} {p.doctor.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {p.doctor.specialty || "General Physician"}
                            </p>
                          </div>
                        </div>
                      )}
                      {p.patient && (
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-cyan-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {p.patient.fullName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {p.patient.age} years • {p.patient.gender}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-500" />
                        <p className="text-sm text-gray-500">
                          Created on {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                          {(p.medicines?.length ?? 0)} medications •{" "}
                          {(p.tests?.length ?? 0)} tests
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

       {/* RIGHT: Follow-Up Reminders */}
      <div className="space-y-4 lg:sticky lg:top-24 h-fit self-start">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Follow-Up Reminders
        </h2>

        {followUps.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="p-4 shadow-sm border mb-3 border-gray-200 hover:shadow-md transition">No upcoming follow-ups yet.</p>
          </Card>
        ) : (
          followUps.map((f) => (
            <Link key={f.id} href={`/user/appointment/${f.id}`}>
            <Card
              key={f.id}
              className="p-4 shadow-sm border mb-3 border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  Dr. {f.doctor?.firstName} {f.doctor?.lastName}
                </h3>
                <span className="text-xs text-cyan-600 font-medium">{f.day}</span>
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4 text-cyan-500" /> {f.time}
              </p>
              <p className="text-xs flex items-center gap-1 text-gray-500 mt-1">
                <Calendar className="w-4 h-4 text-cyan-500" /> {f.date} • {f.type}
              </p>
            </Card>
          </Link>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
