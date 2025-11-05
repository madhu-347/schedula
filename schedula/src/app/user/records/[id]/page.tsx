"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPrescriptionByPatient } from "@/app/services/prescription.api";
import { Prescription } from "@/lib/types/prescription";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Calendar,
  FileText,
  User,
  Stethoscope,
  Download,
  ArrowLeft,
} from "lucide-react";
import { downloadPrescriptionPDF } from "@/utils/pdfGenerator";

export default function PrescriptionDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { user, loading: authLoading } = useAuth();
  const patientId = user?.id as string;
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetchPrescription = async () => {
      if (!patientId || !id) return;

      try {
        setLoading(true);
        const prescriptionsResult = await getPrescriptionByPatient(patientId);
        console.log("Prescriptions Result:", prescriptionsResult);

        if (prescriptionsResult && Array.isArray(prescriptionsResult)) {
          // Filter out null prescriptions
          const validPrescriptions = prescriptionsResult.filter(
            (prescription) => prescription !== null
          ) as Prescription[];

          const index = parseInt(id);
          if (
            !isNaN(index) &&
            index >= 0 &&
            index < validPrescriptions.length
          ) {
            setPrescription(validPrescriptions[index]);
          } else {
            setError("Prescription not found");
          }
        } else {
          setError("No prescriptions found");
        }
      } catch (err) {
        console.error("Failed to fetch prescription:", err);
        setError("Failed to load prescription");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && patientId) {
      fetchPrescription();
    }
  }, [patientId, id, authLoading]);

  const handleDownloadPDF = () => {
    if (!prescription) return;

    setIsGeneratingPdf(true);
    const success = downloadPrescriptionPDF(prescription, id);
    setIsGeneratingPdf(false);

    if (!success) {
      alert("Failed to generate PDF. Please check the console for details.");
    }
  };

  if (authLoading) {
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Main Content */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 md:px-8 lg:px-12 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Records</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? "Generating..." : "Download PDF"}</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          ) : error ? (
            <Card className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Error</h3>
              <p className="text-gray-500">{error}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Back to Records
              </button>
            </Card>
          ) : prescription ? (
            <div className="space-y-6">
              {/* Prescription Header */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        Prescription Details
                      </CardTitle>
                      <p className="text-gray-600 mt-1">
                        Prescription issued on{" "}
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>ID: {id}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Doctor Information */}
                    <div className="bg-cyan-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Stethoscope className="w-5 h-5 text-cyan-600" />
                        <h3 className="font-semibold text-gray-900">
                          Doctor Information
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Name:</span>{" "}
                          {prescription.doctorDetails?.name || "Not specified"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Specialty:</span>{" "}
                          {prescription.doctorDetails?.specialty ||
                            "Not specified"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Qualifications:</span>{" "}
                          {prescription.doctorDetails?.qualifications ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* Patient Information */}
                    <div className="bg-cyan-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-cyan-600" />
                        <h3 className="font-semibold text-gray-900">
                          Patient Information
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Name:</span>{" "}
                          {prescription.patientDetails?.fullName ||
                            "Not specified"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Age:</span>{" "}
                          {prescription.patientDetails?.age
                            ? `${prescription.patientDetails.age} years`
                            : "Not specified"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Gender:</span>{" "}
                          {prescription.patientDetails?.gender ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vitals */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-cyan-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Vitals
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">BP</p>
                      <p className="font-medium text-gray-900">
                        {prescription.vitals?.bp || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Pulse</p>
                      <p className="font-medium text-gray-900">
                        {prescription.vitals?.pulse || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Temperature</p>
                      <p className="font-medium text-gray-900">
                        {prescription.vitals?.temperature || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">SpO₂</p>
                      <p className="font-medium text-gray-900">
                        {prescription.vitals?.spo2 || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="font-medium text-gray-900">
                        {prescription.vitals?.weight || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medicines */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                      <Pill className="w-4 h-4 text-cyan-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Medications
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {prescription.medicines &&
                  prescription.medicines.length > 0 ? (
                    <div className="space-y-4">
                      {prescription.medicines.map((medicine, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h3 className="font-medium text-gray-900">
                            {medicine.name}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            <div>
                              <p className="text-xs text-gray-500">Dosage</p>
                              <p className="text-sm">
                                {medicine.dosage || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Frequency</p>
                              <p className="text-sm">
                                {medicine.frequency || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Duration</p>
                              <p className="text-sm">
                                {medicine.duration || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Instructions
                              </p>
                              <p className="text-sm">
                                {medicine.instructions || "None"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No medications prescribed.</p>
                  )}
                </CardContent>
              </Card>

              {/* Tests */}
              {prescription.tests?.name && prescription.tests.length > 0 && (
                <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                        <TestTube className="w-4 h-4 text-cyan-600" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Test Suggestions
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {prescription.tests.map((testItem, index) => (
                        <li key={index} className="text-gray-700">
                          {testItem.name}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {(prescription.notes || prescription.files) && (
                <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-cyan-600" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Additional Information
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {prescription.notes && (
                      <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Doctor's Notes
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700">{prescription.notes}</p>
                        </div>
                      </div>
                    )}

                    {prescription.files && prescription.files.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Attachments
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {prescription.files.map((fileItem, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-3"
                            >
                              <div className="flex items-center gap-2">
                                <File className="w-4 h-4 text-cyan-600" />
                                <span className="text-sm text-gray-700 truncate">
                                  {fileItem.name}
                                </span>
                              </div>
                              <button className="mt-2 text-xs text-cyan-600 hover:text-cyan-700">
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Prescription Not Found
              </h3>
              <p className="text-gray-500">
                The requested prescription could not be found.
              </p>
              <button
                onClick={() => router.push("/user/records")}
                className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Back to Records
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Default export for missing icons
function Heart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}

function Pill(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 18.5 7-7" />
    </svg>
  );
}

function TestTube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2" />
      <path d="M8.5 2h7" />
      <path d="M14.5 16h-5" />
    </svg>
  );
}

function File(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
