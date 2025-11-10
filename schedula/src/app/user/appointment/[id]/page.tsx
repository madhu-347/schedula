"use client";
import React, { useState, useEffect } from "react";
import { Appointment } from "@/lib/types/appointment";
import { DoctorInfoCard } from "@/components/cards/DoctorReview";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { getAppointmentById } from "@/app/services/appointments.api";
import { Doctor } from "@/lib/types/doctor";
import { User } from "@/lib/types/user";

function AppointmentDetails() {
  const params = useParams();
  const appointmentId = params?.id as string;
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState<Doctor>({} as Doctor);
  const [patient, setPatient] = useState<User>({} as User);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointment = async () => {
    try {
      const appointmentData = await getAppointmentById(appointmentId);
      console.log("appointment data : ", appointmentData);
      setAppointment(appointmentData);
      setDoctor(appointmentData.doctor);
      setPatient(appointmentData.patient);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, []);

  const handleReschedule = () => {
    router.push(`/appointments/${appointmentId}/reschedule`);
  };

  const handleCancel = async () => {
  if (!confirm("Are you sure you want to cancel this appointment?")) return;

  try {
    const response = await fetch(`/api/appointment?id=${appointmentId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert("Appointment cancelled successfully");
        router.push("/user/appointment");
    } else {
      alert(result.error || "Failed to cancel appointment");
    }
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    alert("Failed to cancel appointment");
  }
};

  const handleMakePayment = () => {
    router.push(`/payment/${appointmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointment...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 text-lg">
            {error || "Appointment not found"}
          </p>
          <button
            onClick={() => router.push("/appointments")}
            className="mt-4 text-cyan-500 hover:text-cyan-600"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Waiting":
      case "Upcoming":
        return "text-cyan-500";
      case "Completed":
        return "text-green-500";
      case "Cancelled":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gray-50 border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 pt-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Appointments Details</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Doctor Info Card */}
        <DoctorInfoCard
          firstName={doctor.firstName}
          lastName={doctor.lastName}
          specialty={doctor.specialty}
          qualifications={doctor.qualifications}
          imageUrl={doctor?.image}
        />

        {/* Appointment Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">
              Appointment Status
            </span>
            <span
              className={`font-semibold ${getStatusColor(appointment.status)}`}
            >
              {appointment.status}
            </span>
          </div>
        </div>

        {/* Patient Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-gray-500 text-sm block mb-1">
              Full name
            </label>
            <p className="font-semibold text-lg">
              {appointment.patientDetails?.fullName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-500 text-sm block mb-1">Age</label>
              <p className="font-semibold">{appointment.patientDetails?.age} years</p>
            </div>
            <div>
              <label className="text-gray-500 text-sm block mb-1">Weight</label>
              <p className="font-semibold">
                {appointment.patientDetails?.weight + " kg" || "N/A"} 
              </p>
            </div>
          </div>

          {appointment.patientDetails?.problem && (
            <div>
              <label className="text-gray-500 text-sm block mb-1">
                Problem
              </label>
              <p className="text-gray-800">
                {appointment.patientDetails.problem}
              </p>
            </div>
          )}
        </div>

        {/* Live Tracking Card */}
        {appointment.status === "Upcoming" ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Live Tracking</h3>
            <p className="text-gray-700">
              <span className="font-semibold">
                {appointment.queuePosition || 15} Patient Consulting
              </span>{" "}
              consulting time {appointment.time}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleReschedule}
                className="py-3 px-4 border-2 border-cyan-500 text-cyan-500 rounded-lg font-medium hover:bg-cyan-50 transition"
              >
                Reschedule
              </button>
              <button
                onClick={handleCancel}
                className="py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {/* Payment Section */}
        {!appointment.paid && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Payment</h3>
            <p className="text-gray-600 text-sm">
              Reduce your waiting time by Paying the consulting fee upfront
            </p>
            <button
              onClick={handleMakePayment}
              className="w-full py-4 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition"
            >
              Make Payment
            </button>
          </div>
        )}

        {appointment.paid && (
          <div className="bg-green-50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-green-700 font-medium">Payment Status</span>
              <span className="text-green-600 font-semibold">✓ Paid</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentDetails;
