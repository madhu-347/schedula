"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DoctorInfoCard } from "@/components/cards/DoctorReview";
import { AppointmentDetailsCard } from "@/components/cards/AppointmentDetails";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import Link from "next/link";
import DoctorCard from "@/components/cards/DoctorCard";

interface DoctorData {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  specialty: string;
  email: string;
  phone: string;
  status: string;
  time: string;
  bio: string;
  imageUrl?: string;
  profilePicture?: string;
}

const AppointmentReviewPage = () => {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorData | null>(null);

  useEffect(() => {
    try {
      const storedDoctor = localStorage.getItem("selectedDoctor");
      if (storedDoctor) {
        const parsedDoctor = JSON.parse(storedDoctor);
        setDoctor(parsedDoctor);
      } else {
        toast({
          title: "No Doctor Selected",
          description:
            "Please select a doctor before reviewing the appointment.",
          variant: "destructive",
        });
        router.push("/user/dashboard");
      }
    } catch (error) {
      console.error("Error reading doctor data:", error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-4">
          <div className="flex items-center gap-3">
            {doctor ? (
              <Link
                href={`/user/appointment/${doctor.id}`}
                className="p-2 -ml-2 rounded-full hover:bg-cyan-600/30 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            ) : null}
            <h1 className="text-xl font-semibold text-gray-900">
              Appointment Scheduled
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 md:px-6 md:py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Doctor Info */}
          {doctor ? (
            <DoctorInfoCard
              name={doctor.name || `${doctor.firstName} ${doctor.lastName}`}
              specialty={doctor.specialty}
              location={doctor.status} // using "Available today" field here
              qualification={doctor.phone}
              imageUrl={
                doctor.profilePicture || doctor.imageUrl || "/male-doctor.png"
              }
            />
          ) : (
            <div className="text-center text-gray-500 py-10">
              Loading doctor details...
            </div>
          )}

          {/* Appointment Details */}
          <AppointmentDetailsCard
            appointmentNumber="#34"
            status="Active"
            reportingTime="Oct 27, 2023 7:30 PM"
            onAddToCalendar={handleAddToCalendar}
            type="In-person"
            duration="30 minutes"
            fee="₹1000"
            clinicAddress="Wellora Health Center, Chennai"
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
          <div className="mt-3 md:mt-8 flex justify-center">
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
