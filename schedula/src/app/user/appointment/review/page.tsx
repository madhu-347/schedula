"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DoctorInfoCard } from "@/components/cards/DoctorReview";
import { AppointmentDetailsCard } from "@/components/cards/AppointmentDetails";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import Link from "next/link";

interface Appointment {
  doctorName: string;
  specialty: string;
  date: string;
  timeSlot: string;
  location?: string;
  qualification?: string;
  fee?: string;
}

const AppointmentReviewPage = () => {
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a short delay for smoother UX
    const timer = setTimeout(() => {
      const storedAppointment = localStorage.getItem("appointment");
      if (storedAppointment) {
        setAppointment(JSON.parse(storedAppointment));
      }
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const handleAddToCalendar = () => {
    if (!appointment) return;

    // Example event creation logic (can integrate with Google Calendar later)
    const event = {
      title: `Appointment with ${appointment.doctorName}`,
      description: `${appointment.specialty} consultation`,
      location: appointment.location || "Clinic",
      startTime: appointment.date,
      duration: "30", // in minutes
    };

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
    router.push("/user/dashboard/appointment");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#46C2DE] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        No appointment details found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-cyan-500 text-white px-4 py-6 rounded-b-3xl md:rounded-b-md shadow-md">
        <div className="max-w-3xl mx-auto px-5 flex items-center gap-3">
          <Link
            href="/user/dashboard"
            className="p-2 -ml-2 rounded-full hover:bg-cyan-600/30 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold">Appointment Scheduled</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 md:px-6 md:py-6">
        <div className="max-w-3xl mx-auto space-y-4 md:space-y-5">
          {/* Doctor Info Card */}
          <DoctorInfoCard
            name={appointment.doctorName}
            specialty={appointment.specialty}
            location={appointment.location || "Dombivli East"}
            qualification={appointment.qualification || "MBBS, MD (Psychology)"}
            imageUrl="/male-doctor.png"
          />

          {/* Appointment Details Card */}
          <AppointmentDetailsCard
            appointmentNumber="#34"
            status="Active"
            reportingTime={`${appointment.date} ${appointment.timeSlot}`}
            onAddToCalendar={handleAddToCalendar}
            type="In-person"
            duration="30 minutes"
            fee={appointment.fee || "₹1000"}
            clinicAddress={appointment.location || "123 Healthcare Avenue, Dombivli East, Mumbai - 421201"}
          />

          {/* Add Patient Details Section */}
          <div className="space-y-3 m-2">
            <h2 className="text-base md:text-lg font-semibold text-foreground">
              Add Patient Details
            </h2>
            <Link href="/user/appointment/patient-details">
              <Button
                variant="outline"
                onClick={handleAddPatientDetails}
                className="w-full md:w-auto"
              >
                <Plus className="w-4 h-4" />
                Add Patient Details
              </Button>
            </Link>
          </div>

          {/* View My Appointment Button */}
          {/* <div className="mt-3 md:mt-8 flex justify-center">
            <Button
              onClick={handleViewAppointments}
              className="w-full rounded-lg py-6 text-base font-semibold md:w-auto md:px-12"
            >
              View My Appointment
            </Button>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default AppointmentReviewPage;
