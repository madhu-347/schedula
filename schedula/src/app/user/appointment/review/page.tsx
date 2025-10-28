"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DoctorInfoCard } from "@/components/cards/DoctorReview";
import { AppointmentDetailsCard } from "@/components/cards/AppointmentDetails";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import Link from "next/link";
import { Appointment } from "@/lib/types/appointment";
import Heading from "@/components/ui/Heading";

const AppointmentReviewPage = () => {
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    try {
      const appointmentsStr = localStorage.getItem("appointments");
      if (!appointmentsStr) {
        toast({
          title: "No Appointment Found",
          description: "Please book an appointment first.",
          variant: "destructive",
        });
        router.push("/user/dashboard");
        return;
      }

      const appointments: Appointment[] = JSON.parse(appointmentsStr);

      // Get the most recent appointment (last one in array)
      const latestAppointment = appointments[appointments.length - 1];

      if (!latestAppointment) {
        toast({
          title: "No Appointment Found",
          description: "Please book an appointment first.",
          variant: "destructive",
        });
        router.push("/user/dashboard");
        return;
      }

      setAppointment(latestAppointment);
    } catch (error) {
      console.error("Error reading appointment data:", error);
      toast({
        title: "Error",
        description: "Failed to load appointment details.",
        variant: "destructive",
      });
      router.push("/user/dashboard");
    }
  }, [router]);

  const handleAddToCalendar = () => {
    toast({
      title: "Added to Calendar",
      description: "Appointment has been added to your calendar.",
      variant: "default",
    });
  };

  const handleAddPatientDetails = () => {
    router.push("/user/appointment/patient-details");
  };

  const handleViewAppointments = () => {
    router.push("/user/appointment");
  };

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-15">
      {/* Header */}
      <div className="pt-4">
        <Heading heading={"Appointment Scheduled"} />
      </div>

      {/* Main Content */}
      <main className="px-4 py-4 md:px-6 md:py-4">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Doctor Info */}
          <DoctorInfoCard
            name={appointment.doctorName}
            specialty={appointment.specialty}
            location="Available today"
            qualification="MBBS, MD"
            imageUrl={appointment.doctorImage || "/male-doctor.png"}
          />

          {/* Appointment Details */}
          <AppointmentDetailsCard
            appointmentNumber={`#${appointment.tokenNo}`}
            status={appointment.status}
            reportingTime={`${appointment.date}, ${appointment.timeSlot}`}
            onAddToCalendar={handleAddToCalendar}
            type="In-person"
            duration="30 minutes"
            fee="₹1000"
            clinicAddress="Wellora Health Center, Chennai"
          />

          {/* Add Patient Details Section - Only show if no patient details yet */}
          {!appointment.patientDetails && (
            <div className="space-y-3 m-2">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                Add Patient Details
              </h2>
              <Button
                variant="outline"
                onClick={handleAddPatientDetails}
                className="w-full md:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Patient Details
              </Button>
            </div>
          )}

          {/* Patient Details Summary - Show if details exist */}
          {appointment.patientDetails && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
                Patient Details
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">
                    {appointment.patientDetails.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium text-gray-900">
                    {appointment.patientDetails.age} years
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium text-gray-900">
                    {appointment.patientDetails.gender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">
                    {appointment.patientDetails.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Relationship:</span>
                  <span className="font-medium text-gray-900">
                    {appointment.patientDetails.relationship}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* View My Appointment Button */}
          <div className="mt-3 md:mt-8 flex justify-around">
            <Button
              onClick={() => router.push("/user/chat/1")}
              className="cursor-pointer w-full rounded-lg py-6 text-base font-semibold md:w-auto md:px-12"
            >
              Chat Now
            </Button>
            <Button
              onClick={handleViewAppointments}
              className="cursor-pointer w-full rounded-lg py-6 text-base font-semibold md:w-auto md:px-12"
            >
              View My Appointments
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppointmentReviewPage;
