"use client";

import React from "react";
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { DoctorInfoCard } from "@/components/cards/DoctorReview";
import { AppointmentDetailsCard } from "@/components/cards/AppointmentDetails";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast"; // or use your toast implementation

const AppointmentReviewPage = () => {
  const router = useRouter();

  const handleAddToCalendar = () => {
    // Here you would integrate with Google Calendar API
    const event = {
      title: "Appointment with Dr. Kumar Das",
      description: "Cardiology consultation",
      location: "Dombivali Clinic",
      startTime: "2023-10-27T19:30:00",
      duration: "30", // 30 minutes
    };

    // Show success toast
    toast({
      title: "Added to Calendar",
      description: "Appointment has been added to your calendar.",
      variant: "default",
    });
  };

  const handleAddPatientDetails = () => {
    // Navigate to patient details form
    router.push("/user/appointment/patient-details");
  };

  const handleViewAppointments = () => {
    // Navigate to appointments list
    router.push("/user/dashboard/appointments");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-card border border-gray-300 px-4 py-4 md:px-6 md:py-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
            Appointment Scheduled
          </h1>
        </div>
      </header>
      {/* Main Content */}
      <main className="px-4 py-6 md:px-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-5 md:space-y-6">
          {/* Doctor Info Card */}
          <DoctorInfoCard
            name="Dr. Kumar Das"
            specialty="Cardiologist"
            location="Dombivali"
            qualification="MBBS, MD (Internal Medicine)"
            imageUrl="/male-doctor.png"
          />

          {/* Appointment Details Card */}
          <AppointmentDetailsCard
            appointmentNumber="#34"
            status="Active"
            reportingTime="Oct 27, 2023 7:30 PM"
            onAddToCalendar={handleAddToCalendar}
            type="In-person"
            duration="30 minutes"
            fee="₹1000"
            clinicAddress="123 Healthcare Avenue, Dombivali East, Mumbai - 421201"
          />

          {/* Add Patient Details Section */}
          <div className="space-y-3 m-2">
            <h2 className="text-base md:text-lg font-semibold text-foreground">
              Add Patient Details
            </h2>
            <Button
              variant="outline"
              onClick={handleAddPatientDetails}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Patient Details
            </Button>
          </div>

          {/* View My Appointment Button */}
          <div className="md:mt-8 flex justify-center">
            <Button
              onClick={handleViewAppointments}
              className="w-full rounded-lg py-6 text-base font-semibold md:w-auto md:px-12"
            >
              View My Appointment
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppointmentReviewPage;
