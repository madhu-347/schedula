"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import {
  getPrescriptionsByAppointmentId,
  deletePrescription,
} from "@/app/services/prescription.api";
import generatePrescriptionPDF from "@/utils/generatePrescriptionPDF";
import type { Doctor } from "@/lib/types/doctor";
import {
  Stethoscope,
  User as UserIcon,
  Heart,
  Pill,
  TestTubeDiagonal,
  NotebookPen,
  Paperclip,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

export default function DoctorPrescriptionViewPage() {
  const { id } = useParams() as { id: string }; // appointment id
  const router = useRouter();

  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeletePrescription = async (pid: string) => {
    setDeleting(true);
    const success = await deletePrescription(pid);
    setDeleting(false);

    if (success) {
      toast({
        title: "Prescription Deleted ✅",
        description: "The prescription has been removed.",
      });

      router.push(`/doctor/appointment/${id}/prescription`);
    } else {
      toast({
        title: "Error",
        description: "Failed to delete prescription. Try again.",
        variant: "destructive",
      });
    }
  };

  const fetchPrescription = async () => {
    setLoading(true);
    try {
      const prescriptionData = await getPrescriptionsByAppointmentId(id);

      console.log("Prescription data:", prescriptionData);

      if (!prescriptionData) {
        toast({
          title: "No prescription",
          description: "No prescription found for this appointment.",
        });
        setLoading(false);
        return;
      }

      // Check if it's enriched data or plain prescription
      if (prescriptionData.doctor && prescriptionData.patient) {
        // Enriched data from API
        setPrescription(prescriptionData);
        setDoctorInfo(prescriptionData.doctor);
        setPatientInfo(prescriptionData.patient);
      } else {
        // Plain prescription data
        setPrescription(prescriptionData);
        // Doctor and patient info will be null
      }
    } catch (error) {
      console.error("Error fetching prescription:", error);
      toast({
        title: "Error",
        description: "Failed to load prescription.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            No prescription found for this appointment.
          </p>
          <Button onClick={() => router.push(`/doctor/appointment`)}>
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] w-full">
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push(`/doctor/appointment/`)}
            className="flex items-center gap-2 text-cyan-500 hover:text-cyan-600 text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Appointments
          </button>

          <Button
            onClick={() =>
              generatePrescriptionPDF({
                doctorInfo,
                patientInfo,
                rx: prescription,
              })
            }
            className="bg-cyan-500 hover:bg-cyan-600 text-white flex items-center gap-2"
          >
            <span>📄</span> Download PDF
          </Button>
        </div>

        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-900">
          Prescription Details
        </h1>
        <p className="text-sm text-gray-500 mb-5">
          Prescription issued on{" "}
          {new Date(prescription.createdAt).toLocaleDateString()}
        </p>

        {/* Doctor & Patient section */}
        <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Doctor */}
            <div className="bg-cyan-50 p-4 rounded-lg">
              <h2 className="flex items-center gap-2 font-semibold mb-2 text-cyan-700 text-sm">
                <Stethoscope className="w-4 h-4" />
                Doctor Information
              </h2>
              {doctorInfo ? (
                <>
                  <p className="text-sm">
                    <b>Name:</b> Dr. {doctorInfo.firstName}{" "}
                    {doctorInfo.lastName}
                  </p>
                  <p className="text-sm">
                    <b>Specialty:</b> {doctorInfo.specialty}
                  </p>
                  <p className="text-sm">
                    <b>Qualifications:</b> {doctorInfo.qualifications}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Doctor information not available
                </p>
              )}
            </div>

            {/* Patient */}
            <div className="bg-cyan-50 p-4 rounded-lg">
              <h2 className="flex items-center gap-2 font-semibold mb-2 text-cyan-700 text-sm">
                <UserIcon className="w-4 h-4" />
                Patient Information
              </h2>
              {patientInfo ? (
                <>
                  <p className="text-sm">
                    <b>Name:</b>{" "}
                    {patientInfo.fullName ||
                      `${patientInfo.firstName} ${patientInfo.lastName}`}
                  </p>
                  <p className="text-sm">
                    <b>Age:</b> {patientInfo.age} years
                  </p>
                  <p className="text-sm">
                    <b>Gender:</b> {patientInfo.gender}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Patient information not available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Vitals */}
        {prescription.vitals && (
          <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold mb-3 text-cyan-600 text-md">
              <Heart className="w-5 h-5" />
              Vitals
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-sm">
              {prescription.vitals.bp && (
                <div>
                  <p className="font-semibold">BP</p>
                  <p>{prescription.vitals.bp} mmHg</p>
                </div>
              )}
              {prescription.vitals.pulse && (
                <div>
                  <p className="font-semibold">Pulse</p>
                  <p>{prescription.vitals.pulse} bpm</p>
                </div>
              )}
              {prescription.vitals.temperature && (
                <div>
                  <p className="font-semibold">Temperature</p>
                  <p>{prescription.vitals.temperature} &deg;F</p>
                </div>
              )}
              {prescription.vitals.spo2 && (
                <div>
                  <p className="font-semibold">SpO₂</p>
                  <p>{prescription.vitals.spo2} %</p>
                </div>
              )}
              {prescription.vitals.weight && (
                <div>
                  <p className="font-semibold">Weight</p>
                  <p>{prescription.vitals.weight} kg</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medicines */}
        {prescription.medicines?.length > 0 && (
          <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold mb-3 text-cyan-600 text-md">
              <Pill className="w-5 h-5" />
              Medications
            </h2>

            <div className="space-y-4">
              {prescription.medicines.map((m: any, i: number) => (
                <div key={i} className="border-b pb-2 text-sm last:border-b-0">
                  <p className="font-semibold">{m.name}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                    {m.dosage && (
                      <p>
                        <b>Dosage:</b> {m.dosage}
                      </p>
                    )}
                    {m.frequency && (
                      <p>
                        <b>Frequency:</b> {m.frequency}
                      </p>
                    )}
                    {m.duration && (
                      <p>
                        <b>Duration:</b> {m.duration}
                      </p>
                    )}
                    {m.instructions && (
                      <p>
                        <b>Instructions:</b> {m.instructions}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tests */}
        {prescription.tests && prescription.tests.length > 0 && (
          <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold mb-3 text-cyan-600 text-md">
              <TestTubeDiagonal className="w-5 h-5" /> Investigations
            </h2>
            <ul className="list-disc ml-5 text-sm space-y-1">
              {prescription.tests.map((t: any, i: number) => (
                <li key={i}>{t.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {prescription.notes && (
          <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold mb-2 text-cyan-600 text-md">
              <NotebookPen className="w-5 h-5" /> Additional Information
            </h2>
            <p className="text-sm whitespace-pre-wrap">{prescription.notes}</p>
          </div>
        )}

        {/* Files */}
        {prescription.files && prescription.files.length > 0 && (
          <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold mb-2 text-cyan-600 text-md">
              <Paperclip className="w-5 h-5" /> Attachments
            </h2>
            <div className="space-y-2 text-sm">
              {prescription.files.map((file: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded border"
                >
                  <span className="truncate">{file.name}</span>
                  {file.dataUrl && (
                    <a
                      href={file.dataUrl}
                      download={file.name}
                      className="text-cyan-500 text-xs font-semibold underline ml-2"
                    >
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          {/* Edit */}
          <Button
            onClick={() =>
              router.push(`/doctor/appointment/${id}/prescription`)
            }
            className="bg-cyan-500 text-white hover:bg-cyan-600"
          >
            Edit Prescription
          </Button>

          {/* Delete */}
          <Button
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>

        <DeleteConfirmModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            handleDeletePrescription(prescription.id);
          }}
        />
      </div>
    </div>
  );
}
