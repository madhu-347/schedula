"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User2,
  HeartPulse,
  X,
  CheckCircle2,
  Edit,
  Trash2,
  FileText,
  PlusCircle,
  Stethoscope,
  BadgeIndianRupee
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import {
  getAppointmentsByDoctor,
  createFollowUpAppointment,
} from "@/app/services/appointments.api";
import { getPrescriptionsByAppointmentId } from "@/app/services/prescription.api";
import { createNotification } from "@/app/services/notifications.api";
import type { Appointment } from "@/lib/types/appointment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AppointmentDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { doctor } = useAuth();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [hasPrescription, setHasPrescription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
   
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [attemptedSave, setAttemptedSave] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!doctor?.id) return;
      try {
        setLoading(true);
        const data = await getAppointmentsByDoctor(doctor.id);
        const found = data.find((a: Appointment) => String(a.id) === String(id));
        setAppointment(found || null);
      } catch (err) {
        console.error("Error fetching appointment:", err);
      } finally {
        setLoading(false);
      }
    };

  
    fetchAppointment();
  }, [doctor?.id, id]);

    useEffect(() => {
     const fetchPrescription = async () => {
        if (!id) return;
        try {
        const prescriptions = await getPrescriptionsByAppointmentId(String(id));
        setHasPrescription(prescriptions);
        } catch (err) {
        console.error("Error fetching prescriptions:", err);
        }
    };
    fetchPrescription();
    }, [id]);
  const markCompleted = async () => {
    if (!appointment) return;
    setSaving(true);
    try {
      await fetch("/api/appointment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appointment.id, status: "Completed" }),
      });
      setAppointment({ ...appointment, status: "Completed" });
      setShowFollowUpModal(true)
    } finally {
      setSaving(false);
    }
  };
   const cancelAppointment = async () => {
  if (!confirm("Are you sure you want to cancel this appointment?")) return;

  try {
    const res = await fetch("/api/appointment", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "Cancelled" }),
    });

    if (!res.ok) throw new Error("Failed to cancel appointment");

    // Update local state immediately for instant UI feedback
    setAppointment((prev) => (prev ? { ...prev, status: "Cancelled" } : prev));

    // Send notification to patient
    if (appointment?.patientId) {
      try {
        const notification = {
          recipientId: appointment.patientId,
          recipientRole: "user",
          title: "Appointment Cancelled",
          message: "Your appointment has been cancelled by your doctor.",
          type: "appointment",
          targetUrl: `/user/appointment/${appointment.id}`,
          relatedId: appointment.id,
        };

        await createNotification(notification as any);
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
        // Don’t fail the main cancellation if notification fails
      }
    }

    //Redirect back to appointment list
    router.push("/doctor/appointment");
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    alert("Something went wrong while cancelling the appointment.");
  }
};

    const handleSaveFollowUp = async () => {
    if (!followUpDate || !followUpTime) return setAttemptedSave(true);
    if (!appointment || !doctor) return;

    try {
        const newAppointment: Appointment = {
        id: String(Date.now()),
        tokenNo: `TKN-${Math.floor(Math.random() * 9000 + 1000)}`,
        patientId: appointment.patientId,
        doctorId: doctor.id,
        doctor: {
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            specialty: doctor.specialty,
            qualifications: doctor.qualifications,
            image: doctor.image,
        },
        patientDetails: appointment.patientDetails,
        day: new Date(followUpDate).toLocaleDateString("en-US", { weekday: "long" }),
        date: followUpDate,
        time: followUpTime,
        type: appointment.type || "In-person",
        status: "Upcoming",
        visitType: "Follow-up",
        paid: false,
        paymentStatus: "Not paid",
        queuePosition: 0,
        followUpOf: appointment.id,
        };

        await createFollowUpAppointment(newAppointment);

        // Reset and close the modal
        setAttemptedSave(false);
        setShowFollowUpModal(false);
        setFollowUpDate("");
        setFollowUpTime("");
    } catch (err) {
        console.error("Follow-up creation failed:", err);
    }
    };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading appointment details...
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Appointment not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="max-w-3xl mx-auto">
            <button
            onClick={() => router.push("/doctor/appointment")}
            className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-900"
            >
            <ArrowLeft className="w-5 h-5" /> Back to Appointments
    </button>
        </div>
           
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {appointment.patientDetails?.fullName}
            </h1>
            <p className="text-sm text-gray-500">
              Token No:{" "}
              <span className="text-cyan-600 font-medium">
                #{appointment.tokenNo}
              </span>
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              appointment.status === "Upcoming"
                ? "bg-blue-100 text-blue-700"
                : appointment.status === "Completed"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {appointment.status}
          </span>
        </div>

        {/* Appointment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-700 text-sm mb-6">
          <p className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-500" />
            {appointment.day}, {appointment.date}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-500" /> {appointment.time}
          </p>
          <p className="flex items-center gap-2">
            <BadgeIndianRupee className="w-4 h-4 text-cyan-500" />
            {appointment.paid? "Paid" : "Not paid"}
          </p>
          <p className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-red-400" />{" "}
            {appointment.patientDetails?.problem}
          </p>
        </div>

        {/* Patient Info */}
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Patient Information
          </h2>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <p>Age: {appointment.patientDetails?.age + " years"}</p>
            <p>Gender: {appointment.patientDetails?.gender}</p>
            <p>Phone: {appointment.patientDetails?.phone}</p>
            <p>Relationship: {appointment.patientDetails?.relationship}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-end">
          {appointment.status === "Upcoming" && (
            <>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={markCompleted}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Completed
              </Button>

              <Button
                variant="outline"
                className="border-cyan-600 text-cyan-600 hover:bg-cyan-50"
                onClick={() =>
                  router.push(`/doctor/appointment/${id}/edit`)
                }
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Appointment
              </Button>

              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={cancelAppointment}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}

          {appointment.status === "Completed" && (
            <>
              {hasPrescription ? (
                <Button
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  onClick={() =>
                    router.push(`/doctor/appointment/${id}/prescription/view`)
                  }
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Prescription
                </Button>
              ) : (
                <Button
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  onClick={() =>
                    router.push(`/doctor/appointment/${id}/prescription`)
                  }
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Prescription
                </Button>
              )}
            </>
          )}
        </div>
      </div>

     {showFollowUpModal && (
             <>
               <div
                 className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                 onClick={() => setShowFollowUpModal(false)}
               />
     
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                 <div
                   className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative overflow-y-auto"
                   style={{
                     maxHeight: "90vh",
                     overflowY: "auto",
                     overflowX: "visible",
                   }}
                 >
                   <button
                     onClick={() => setShowFollowUpModal(false)}
                     className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                   >
                     <X className="w-5 h-5" />
                   </button>
     
                   <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                     Schedule Follow-up Appointment
                   </h2>
     
                   {/* ---- Date Picker ---- */}
                   <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-600 mb-1">
                       Choose Date
                     </label>
     
                     <div className="flex justify-center">
                       <DatePicker
                         selected={followUpDate ? new Date(followUpDate) : null}
                         onChange={(date) => {
                           if (!date) {
                             setFollowUpDate("");
                             return;
                           }
                           const localDate = new Date(
                             date.getTime() - date.getTimezoneOffset() * 60000
                           )
                             .toISOString()
                             .split("T")[0];
                           setFollowUpDate(localDate);
                         }}
                         minDate={new Date()}
                         filterDate={(date: Date) => {
                           if (!(date instanceof Date) || isNaN(date.getTime()))
                             return false;
     
                           const dayName = date.toLocaleDateString("en-US", {
                             weekday: "long",
                           });
                           return !!doctor?.availableDays?.includes(dayName);
                         }}
                         inline
                         calendarClassName="mx-auto rounded-lg shadow border border-gray-200"
                       />
                     </div>
                   </div>
     
                   {/* ---- Time Slots ---- */}
                   {followUpDate && (
                     <div className="mt-3">
                       <label className="block text-sm font-medium text-gray-600 mb-1">
                         Choose Time Slot
                       </label>
     
                       <select
                         className="w-full border rounded-md px-3 py-2 text-sm"
                         value={followUpTime}
                         onChange={(e) => setFollowUpTime(e.target.value)}
                       >
                         <option value="">Select a time slot</option>
     
                         {doctor?.availableTime?.morning && (
                           <optgroup label="Morning">
                             {generateTimeSlots(
                               doctor.availableTime.morning.from,
                               doctor.availableTime.morning.to
                             ).map((slot) => (
                               <option key={`m-${slot}`} value={slot}>
                                 {slot}
                               </option>
                             ))}
                           </optgroup>
                         )}
     
                         {doctor?.availableTime?.evening && (
                           <optgroup label="Evening">
                             {generateTimeSlots(
                               doctor.availableTime.evening.from,
                               doctor.availableTime.evening.to
                             ).map((slot) => (
                               <option key={`e-${slot}`} value={slot}>
                                 {slot}
                               </option>
                             ))}
                           </optgroup>
                         )}
                       </select>
                     </div>
                   )}
     
                   {/* ---- Buttons ---- */}
                   <div className="flex flex-col gap-2 mt-6">
                     {!followUpDate && attemptedSave && (
                       <p className="text-sm text-red-500">
                         Please select a follow-up date.
                       </p>
                     )}
                     {followUpDate && !followUpTime && attemptedSave && (
                       <p className="text-sm text-red-500">
                         Please select a time slot.
                       </p>
                     )}
     
                     <div className="flex gap-3">
                       <Button
                         className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                         onClick={handleSaveFollowUp}
                       >
                         Save Follow-up
                       </Button>
     
                       <Button
                         variant="outline"
                         className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                         onClick={() => {
                           setAttemptedSave(false);
                           setShowFollowUpModal(false);
                         }}
                       >
                         Skip
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
             </>
           )}
    </div>
  );
}

function generateTimeSlots(from: string, to: string): string[] {
  const slots: string[] = [];
  let [h, m] = from.split(":").map(Number);
  const [endH, endM] = to.split(":").map(Number);

  while (h < endH || (h === endH && m < endM)) {
    const hour = String(h).padStart(2, "0");
    const minute = String(m).padStart(2, "0");
    slots.push(`${hour}:${minute}`);
    m += 30;
    if (m >= 60) {
      m = 0;
      h++;
    }
  }
  return slots;
}