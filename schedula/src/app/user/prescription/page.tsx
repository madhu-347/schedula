"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Calendar, FileText, Stethoscope, User } from "lucide-react";
import { getPrescriptionByPatient } from "@/app/services/prescription.api";
import type { PrescriptionResponse } from "@/lib/types/prescription";

export default function PrescriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const patientId = user?.id ?? "";

  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // wait for auth to hydrate
    if (!patientId) {
      // user not logged in or id missing
      setIsLoading(false);
      setErr("No patient id. Please sign in again.");
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setErr(null);
      try {
        console.log("Fetching prescriptions for patientId:", patientId);
        const result = await getPrescriptionByPatient(patientId);
        console.log("Prescription data received:", result);

        // The API returns enriched data with doctor and patient info
        const prescriptionList: PrescriptionResponse[] = Array.isArray(result)
          ? result.filter(Boolean)
          : [];

        console.log("Processed prescriptions:", prescriptionList);
        setPrescriptions(prescriptionList);
      } catch (e) {
        console.error("Load prescriptions failed:", e);
        setErr("Failed to load prescriptions.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [authLoading, patientId]);

  // UI states
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-4 sm:px-6 sm:py-5 md:px-8 lg:px-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
            <p className="text-gray-600 mt-1">View your prescription history</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          ) : err ? (
            <Card className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Error</h3>
              <p className="text-gray-500">{err}</p>
            </Card>
          ) : prescriptions.length === 0 ? (
            <Card className="bg-white rounded-xl shadow-sm p-8 text-center">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prescriptions.map((prescription) => {
                const doctor = prescription.doctor;
                const patient = prescription.patient;

                return (
                  <Link
                    key={prescription.id}
                    href={`/user/prescription/${prescription.id}`}
                    className="block"
                  >
                    <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 h-full">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            Prescription
                          </CardTitle>
                          <span className="text-xs text-gray-500">
                            {new Date(
                              prescription.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {doctor && (
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-cyan-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Dr. {doctor.firstName} {doctor.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {doctor.specialty || "General Physician"}
                                </p>
                              </div>
                            </div>
                          )}

                          {patient && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-cyan-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {patient.fullName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {patient.age} years • {patient.gender}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-cyan-500" />
                            <p className="text-xs text-gray-500">
                              Created on{" "}
                              {new Date(
                                prescription.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              {prescription.medicines?.length ?? 0} medications
                              • {prescription.tests?.length ?? 0} tests
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
