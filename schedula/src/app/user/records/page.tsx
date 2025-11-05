"use client";
import React, { useState, useEffect } from "react";
import { getPrescriptionByPatient } from "@/app/services/prescription.api";
import { Prescription } from "@/lib/types/prescription";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Calendar, FileText, User, Stethoscope } from "lucide-react";
import Link from "next/link";

export default function PrescriptionPage() {
  const { user, loading } = useAuth();
  const patientId = user?.id as string;
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!patientId) return;

      try {
        const prescriptionsResult = await getPrescriptionByPatient(patientId);
        if (prescriptionsResult && Array.isArray(prescriptionsResult)) {
          // Filter out null prescriptions
          const validPrescriptions = prescriptionsResult.filter(
            (prescription) => prescription !== null
          ) as Prescription[];
          setPrescriptions(validPrescriptions);
        }
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && patientId) {
      fetchPrescriptions();
    }
  }, [patientId, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (

      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 md:px-8 lg:px-12 pb-24">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Medical Records
              </h1>
              <p className="text-gray-600 mt-1">
                View your prescription history
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              </div>
            ) : prescriptions.length === 0 ? (
              <Card className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-cyan-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No prescriptions found
                </h3>
                <p className="text-gray-500">
                  You don't have any prescriptions yet.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prescriptions.map((prescription, index) => (
                    <Link
                      key={index}
                      href={`/user/records/${index}`}
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
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-cyan-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {prescription.doctorDetails?.name || "Doctor"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {prescription.doctorDetails?.specialty ||
                                    "Specialist"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-cyan-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {prescription.patientDetails?.fullName ||
                                    "Patient"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {prescription.patientDetails?.age
                                    ? `${prescription.patientDetails.age} years`
                                    : "Age not specified"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-cyan-500" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Created on{" "}
                                  {new Date(
                                    prescription.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="pt-2">
                              <p className="text-xs text-gray-500">
                                {prescription.medicines?.length || 0}{" "}
                                medications prescribed
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
