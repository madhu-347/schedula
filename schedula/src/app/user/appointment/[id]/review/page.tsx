"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, CalendarPlus, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { DoctorInfoCard } from "@/components/cards/DoctorReview";
import { AppointmentDetailsCard } from "@/components/cards/AppointmentDetails";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import { Appointment } from "@/lib/types/appointment";
import Heading from "@/components/ui/Heading";
import { getAppointmentById } from "@/app/services/appointments.api";
import { useParams } from "next/navigation";
import { Doctor } from "@/lib/types/doctor";
import { User } from "@/lib/types/user";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";

const AppointmentReviewPage = () => {
  const params = useParams();
  const appointmentId = params?.id as string;
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment>(
    {} as Appointment
  );
  const [doctor, setDoctor] = useState<Doctor>({} as Doctor);
  const [patient, setPatient] = useState<User>({} as User);

  const { isLoading, isAdded, eventLink, addToCalendar, initiateAuth } =
    useGoogleCalendar({
      appointment,
      doctor,
      patient,
    });

  const fetchAppointment = async () => {
    try {
      const appointmentData = await getAppointmentById(appointmentId);
      // console.log("response : ", appointmentData);
      setAppointment(appointmentData);
      setDoctor(appointmentData.doctor);
      setPatient(appointmentData.patient);
    } catch (error) {
      console.error("Error fetching appointment:", error);
    }
  };
  useEffect(() => {
    fetchAppointment();
  }, []);

  const handleAddToCalendar = async () => {
    const result = await addToCalendar();

    if (result.success) {
      toast({
        title: "Added to Calendar",
        description: "Appointment has been added to your Google Calendar.",
        variant: "default",
      });
    } else {
      // If unauthorized, initiate auth flow
      if (result.requiresAuth) {
        toast({
          title: "Authentication Required",
          description:
            "Please sign in with Google to add appointments to your calendar.",
          variant: "default",
        });
        // Give user time to read the toast before redirecting
        setTimeout(() => {
          initiateAuth();
        }, 2000);
      } else {
        toast({
          title: "Error",
          description:
            result.message ||
            "Failed to add appointment to calendar. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewCalendarEvent = () => {
    if (eventLink) {
      window.open(eventLink, "_blank");
    }
  };

  const handleAddPatientDetails = () => {
    router.push(`/user/appointment/${appointmentId}/patient-details`);
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
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="pt-4">
        <Heading heading={"Appointment Scheduled"} />
      </div>

      {/* Main Content */}
      <main className="px-4 py-4 md:px-6 md:py-4">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Doctor Info */}
          <DoctorInfoCard
            firstName={doctor?.firstName}
            lastName={doctor?.lastName}
            specialty={doctor?.specialty}
            qualifications={doctor?.qualifications}
            imageUrl={doctor.image}
          />

          {/* Appointment Details */}
          <AppointmentDetailsCard
            appointmentNumber={`#${appointment.tokenNo}`}
            status={appointment.status}
            date={appointment.date}
            day={appointment.day}
            time={appointment.time}
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
                <Plus className="cursor-pointer w-4 h-4 mr-2" />
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

          {/* View My Appointment and Calendar Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {/* Add to Google Calendar Button */}
            {isAdded ? (
              <>
                <Button
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2"
                  onClick={handleViewCalendarEvent}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm md:text-base">
                    View in Google Calendar
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddToCalendar}
                  disabled={isLoading}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span className="text-sm md:text-base">
                    {isLoading ? "Adding..." : "Add Again"}
                  </span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleAddToCalendar}
                  disabled={isLoading}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span className="text-sm md:text-base">
                    {isLoading
                      ? "Adding to Calendar..."
                      : "Add to Google Calendar"}
                  </span>
                </Button>
                <Button
                  onClick={handleViewAppointments}
                  className="cursor-pointer w-full sm:w-1/2 rounded-lg text-base font-semibold"
                >
                  View My Appointments
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppointmentReviewPage;
