"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getAppointmentById , updateAppointment} from "@/app/services/appointments.api";
import type { Appointment } from "@/lib/types/appointment";
import { toast } from "@/hooks/useToast";;

export default function DoctorPrescriptionViewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const appt = await getAppointmentById(id as string);
      if (!appt || !(appt as any).prescription) {
        router.replace(`/doctor/appointments/${id}`);
        return;
      }
      setAppointment(appt);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <div className="p-6">Loading...</div>;

  // @ts-ignore
  const rx = appointment.prescription;
  const rd = appointment;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 mt-6 mb-10 border rounded-xl shadow-md">
      
      {/* Header */}
      <div className="border-b pb-4 mb-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Dr. {rx.doctorDetails?.name}
        </h1>
        <p className="text-gray-700 text-sm">
          {rd.doctor?.qualifications}
        </p>
        { rd.doctor && (
          <p className="text-gray-500 text-xs"> {rd.doctor?.specialty}
          </p>
        )}
      </div>

      {/* Patient Section */}
      <div className="mb-6 text-sm">
        <p>
          <span className="font-semibold">Patient:</span>{" "}
          {rx.patientDetails?.fullName}
        </p>
        <p>
          <span className="font-semibold">Age/Gender:</span>{" "}
          {rx.patientDetails?.age} yrs / {rx.patientDetails?.gender}
        </p>
        <p>
          <span className="font-semibold">Date:</span>{" "}
          {new Date(rx.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Vitals */}
      {(rx.vitals.bp ||
        rx.vitals.pulse ||
        rx.vitals.temperature ||
        rx.vitals.spo2 ||
        rx.vitals.weight) && (
        <div className="mb-6">
          <h2 className="font-semibold border-b pb-1 mb-2">Vitals</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            {rx.vitals.bp && <p>BP: {rx.vitals.bp}</p>}
            {rx.vitals.pulse && <p>Pulse: {rx.vitals.pulse}</p>}
            {rx.vitals.temperature && <p>Temp: {rx.vitals.temperature}</p>}
            {rx.vitals.spo2 && <p>SpO₂: {rx.vitals.spo2}</p>}
            {rx.vitals.weight && <p>Weight: {rx.vitals.weight}</p>}
          </div>
        </div>
      )}

      {/* Medicines */}
      <div className="mb-6">
        <h2 className="font-semibold border-b pb-1 mb-2">Prescription</h2>
        <ul className="space-y-3 text-sm">
          {rx.medicines.map((m: any, i: number) => (
            <li key={i}>
              <span className="font-semibold">{i + 1}. {m.name}</span>
              <p className="ml-5 text-gray-700">
                {m.dosage && `${m.dosage}, `}
                {m.frequency && `${m.frequency}, `}
                {m.duration && `${m.duration}`}
              </p>
              {m.instructions && (
                <p className="ml-5 text-gray-500 italic text-xs">Note: {m.instructions}</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Tests */}
      {rx.tests?.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold border-b pb-1 mb-2">Investigations</h2>
          <ul className="list-disc ml-6 text-sm">
            {rx.tests.map((t: any, i: number) => <li key={i}>{t.name}</li>)}
          </ul>
        </div>
      )}

      {/* Notes */}
      {rx.notes && (
        <div className="mb-6">
          <h2 className="font-semibold border-b pb-1 mb-2">Doctor Notes</h2>
          <p className="text-sm whitespace-pre-wrap">{rx.notes}</p>
        </div>
      )}

      {/* Attachments */}
      {rx.files?.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold border-b pb-1 mb-2">Attachments</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {rx.files.map((file: any, i: number) => (
              <div key={i} className="border rounded-lg p-2 text-center">
                {file.type?.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                ) : (
                  <div className="text-xs text-gray-600 h-32 flex items-center justify-center">
                    {file.name}
                  </div>
                )}
                <p className="text-xs mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between  mt-8">
        <Button className="mr-2" variant="outline" onClick={() => router.push("/doctor/appointments")}>
          Back to Appointments
        </Button>
        <Button className="mr-2" onClick={() => window.print()}>
          Print 
        </Button>
        <div className="flex ">
          <Button className="mr-2" onClick={() => router.push(`/doctor/appointments/${appointment.id}/prescription`)}>
            Edit
          </Button>

          <Button
            variant="destructive"
            className="mr-2"
            onClick={async () => {
              if (!confirm("Delete this prescription?")) return;

              await updateAppointment(String(appointment.id), { prescription: null } as unknown as Partial<Appointment>);

              toast({
                title: "Error",
                description: "Prescription deleted successfully.",
                variant: "destructive",
              });

              router.push("/doctor/appointments");
            }}
          >
            Delete
          </Button>
      </div>

      </div>
    </div>
  );
}
