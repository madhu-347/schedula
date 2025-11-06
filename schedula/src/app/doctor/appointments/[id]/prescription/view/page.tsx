"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import { getAppointmentById } from "@/app/services/appointments.api";
import {
  getPrescriptionsByAppointmentId,
  deletePrescription,
} from "@/app/services/prescription.api";
import generatePrescriptionPDF from "@/utils/generatePrescriptionPDF";
import type { Prescription } from "@/lib/types/prescription";
import {
  Stethoscope,
  User,
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

  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [patientInfo, setPatientInfo] = useState<any>(null);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const latestRx = prescriptions[prescriptions.length - 1];

  const handleDeletePrescription = async () => {
    if (!latestRx?.id) return;

    setDeleting(true);
    const success = await deletePrescription(latestRx.id);
    setDeleting(false);

    if (success) {
      toast({
        title: "Prescription Deleted ✅",
        description: "The prescription has been removed.",
      });

      router.push("/doctor/appointments");
    } else {
      toast({
        title: "Error",
        description: "Failed to delete prescription. Try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;

        const appt = await getAppointmentById(id);
        console.log("Fetched appointment:", appt);
        if (!appt) {
          toast({
            title: "Error",
            description: "Appointment not found",
            variant: "destructive",
          });
          router.push("/doctor/appointments");
          return;
        }
        setDoctorInfo(appt.doctor);

        // set patient info directly from appointment
        setPatientInfo({
          fullName:
            appt.patientDetails?.fullName ??
            `${appt.patient?.firstName} ${appt.patient?.lastName}`,
          age: appt.patientDetails?.age,
          gender: appt.patientDetails?.gender,
          phone: appt.patientDetails?.phone,
          weight: appt.patientDetails?.weight,
        });
        const rxList = await getPrescriptionsByAppointmentId(id);
        if (!rxList || rxList.length === 0) {
          toast({
            title: "No prescriptions",
            description: "No prescriptions found for this appointment.",
          });
          router.push(`/doctor/appointments`);
          return;
        }

        setPrescriptions(rxList);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to load prescriptions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (loading) return <div className="p-6">Loading...</div>;

  if (prescriptions.length === 0)
    return <div className="p-6">No prescriptions found.</div>;

  return (
    <div className="min-h-screen bg-[#F7FAFC] w-full">
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push(`/doctor/appointments/`)}
            className="flex items-center gap-2 text-sky-500 hover:text-sky-600 text-sm font-medium"
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
                rx: latestRx,
              })
            }
            className="bg-sky-500 hover:bg-sky-600 text-white flex items-center gap-2"
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
          {new Date(latestRx.createdAt).toLocaleDateString()}
        </p>

        {/* Doctor & Patient section */}
        <div className="bg-white rounded-xl  p-5 mb-6 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Doctor */}
            <div className="bg-sky-50 p-4 rounded-lg ">
              <h2 className="flex items-center gap-2 font-semibold mb-2 text-sky-700 text-sm">
                <span>
                  <Stethoscope />
                </span>{" "}
                Doctor Information
              </h2>
              <p className="text-sm">
                <b>Name:</b> Dr. {doctorInfo?.firstName} {doctorInfo?.lastName}
              </p>
              <p className="text-sm">
                <b>Specialty:</b> {doctorInfo?.specialty}
              </p>
              <p className="text-sm">
                <b>Qualifications:</b> {doctorInfo?.qualifications}
              </p>
            </div>

            {/* Patient */}
            <div className="bg-sky-50 p-4 rounded-lg ">
              <h2 className="flex items-center gap-2 font-semibold mb-2 text-sky-700 text-sm">
                <span>
                  <User />
                </span>{" "}
                Patient Information
              </h2>
              <p className="text-sm">
                <b>Name:</b> {patientInfo?.fullName}
              </p>
              <p className="text-sm">
                <b>Age:</b> {patientInfo?.age} years
              </p>
              <p className="text-sm">
                <b>Gender:</b> {patientInfo?.gender}
              </p>
            </div>
          </div>
        </div>

        {/* Vitals */}
        <div className="bg-white rounded-xl  p-5 mb-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold mb-3 text-sky-600 text-md">
            <span>
              <Heart />
            </span>{" "}
            Vitals
          </h2>
          <div className="grid grid-cols-5 text-center text-sm">
            <div>
              <p className="font-semibold">BP</p>
              {latestRx.vitals.bp} mmHg
            </div>
            <div>
              <p className="font-semibold">Pulse</p>
              {latestRx.vitals.pulse} bpm
            </div>
            <div>
              <p className="font-semibold">Temperature</p>
              {latestRx.vitals.temperature} &deg; F
            </div>
            <div>
              <p className="font-semibold">SpO₂</p>
              {latestRx.vitals.spo2} %
            </div>
            <div>
              <p className="font-semibold">Weight</p>
              {latestRx.vitals.weight} kg
            </div>
          </div>
        </div>

        {/* Medicines */}
        {latestRx.medicines?.length > 0 && (
          <div className="bg-white rounded-xl  p-5 mb-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold mb-3 text-sky-600 text-md">
              <span>
                <Pill />
              </span>{" "}
              Medications
            </h2>

            <div className="space-y-4">
              {latestRx.medicines.map((m, i) => (
                <div key={i} className="border-b pb-2 text-sm">
                  <p className="font-semibold">{m.name}</p>
                  <div className="grid grid-cols-4 gap-3 mt-1">
                    <p>
                      <b>Dosage:</b> {m.dosage}
                    </p>
                    <p>
                      <b>Frequency:</b> {m.frequency}
                    </p>
                    <p>
                      <b>Duration:</b> {m.duration}
                    </p>
                    <p>
                      <b>Instructions:</b> {m.instructions || "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tests */}
        {latestRx.tests && (
          <div className="bg-white rounded-xl  p-5 mb-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold mb-3 text-sky-600 text-md">
              <TestTubeDiagonal /> Investigations
            </h2>
            <ul className="list-disc ml-5 text-sm">
              {latestRx.tests.map((t, i) => (
                <li key={i}>{t.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {latestRx.notes && (
          <div className="bg-white rounded-xl  p-5 mb-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold mb-2 text-sky-600 text-md">
              <NotebookPen /> Additional Information
            </h2>
            <p className="text-sm">{latestRx.notes}</p>
          </div>
        )}

        {/* Files */}
        {latestRx.files && (
          <div className="bg-white rounded-xl  p-5 mb-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold mb-2 text-sky-600 text-md">
              <Paperclip /> Attachments
            </h2>
            <div className="space-y-2 text-sm">
              {latestRx.files.map((file, i) => (
                <div
                  key={i}
                  className="flex justify-between bg-gray-50 p-2 rounded border"
                >
                  <span>{file.name}</span>
                  <a
                    href="#"
                    className="text-sky-500 text-xs font-semibold underline"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-around mt-6">
          {/* Edit */}
          <Button
            onClick={() =>
              router.push(`/doctor/appointments/${id}/prescription`)
            }
            className="bg-sky-500 text-white hover:bg-sky-600"
          >
            Edit Prescription
          </Button>

          {/* Delete */}
          <Button
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
          <DeleteConfirmModal
            open={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => {
              setShowDeleteModal(false);
              handleDeletePrescription();
            }}
          />
        </div>
      </div>
    </div>
  );
}
