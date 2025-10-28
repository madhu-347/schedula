"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import { Appointment } from "@/lib/types/appointment";
import Heading from "@/components/ui/Heading"
import { PatientDetails } from "@/lib/types/patientDetails";

const PatientDetailsPage = () => {
  const router = useRouter();
  const [currentAppointment, setCurrentAppointment] =
    useState<Appointment | null>(null);
  const [showVisitTypeDropdown, setShowVisitTypeDropdown] = useState(false);
  const [selectedVisitType, setSelectedVisitType] = useState("First");

  const visitTypeOptions = ["First", "Report", "Follow-up"];

  useEffect(() => {
    // Get the current appointment from localStorage
    try {
      const currentAppointmentStr = localStorage.getItem("currentAppointment");

      if (currentAppointmentStr) {
        const appointment: Appointment = JSON.parse(currentAppointmentStr);
        console.log("current appointment : ", appointment);
        // Check if appointment has patient details
        if (!appointment.patientDetails) {
          toast({
            title: "No Patient Details",
            description: "Please add patient details first.",
            variant: "destructive",
          });
          router.push("/user/appointment/add-patient-details");
          return;
        }

        setCurrentAppointment(appointment);
      } else {
        toast({
          title: "No Appointment Found",
          description: "Please book an appointment first.",
          variant: "destructive",
        });
        router.push("/user/dashboard");
      }
    } catch (error) {
      console.error("Error loading appointment:", error);
      toast({
        title: "Error",
        description: "Failed to load appointment details.",
        variant: "destructive",
      });
      router.push("/user/dashboard");
    }
  }, [router]);

  const handlePayment = () => {
    if (!currentAppointment) return;

    try {
      // Update current appointment
      const updatedCurrentAppointment = {
        ...currentAppointment,
        paymentStatus: "Paid" as const,
      };

      localStorage.setItem(
        "currentAppointment",
        JSON.stringify(updatedCurrentAppointment)
      );

      // Also update in appointments array
      const appointmentsStr = localStorage.getItem("appointments");
      if (appointmentsStr) {
        const appointments: Appointment[] = JSON.parse(appointmentsStr);

        // Find and update the matching appointment by id
        const updatedAppointments = appointments.map((apt) =>
          apt.id === currentAppointment.id
            ? { ...apt, paymentStatus: "Paid" as const }
            : apt
        );

        localStorage.setItem(
          "appointments",
          JSON.stringify(updatedAppointments)
        );
      }

      setCurrentAppointment(updatedCurrentAppointment);

      toast({
        title: "Payment Successful",
        description: "Your consulting fee has been paid successfully.",
      });

      // Navigate back to review page after a short delay
      setTimeout(() => {
        router.push("/user/appointment/review");
      }, 1000);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickQuery = () => {
    // Navigate to chat with doctor
    const chatId = currentAppointment?.tokenNo || "default";
    router.push(`/user/chat/${chatId}`);
  };

  if (!currentAppointment || !currentAppointment.patientDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }

  const { patientDetails } = currentAppointment;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="pt-2">
        <Heading heading="Patient Details" />
      </div>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-3xl mx-auto">
        {/* Patient Information Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-5 border border-gray-100">
          {/* Full Name */}
          <div className="mb-6 font-medium">
            <p className="text-sm text-gray-500 mb-1">Full name</p>
            <p className="text-lg text-gray-900">{patientDetails.fullName}</p>
          </div>

          {/* Age, Weight, Gender */}
          <div className="grid grid-cols-3 gap-4 mb-6 font-medium">
            <div>
              <p className="text-sm text-gray-500 mb-1">Age</p>
              <p className="text-lg text-gray-900">{patientDetails.age}</p>
            </div>
            <div className="font-medium">
              <p className="text-sm text-gray-500 mb-1">Weight</p>
              <p className="text-lg text-gray-900">
                {patientDetails.weight} kg
              </p>
            </div>
            <div className="font-medium">
              <p className="text-sm text-gray-500 mb-1">Gender</p>
              <p className="text-lg text-gray-900">{patientDetails.gender}</p>
            </div>
          </div>

          {/* Relationship */}
          <div className="mb-6 font-medium">
            <p className="text-sm text-gray-500 mb-1">Relationship</p>
            <p className="text-lg text-gray-900">
              {patientDetails.relationship}
            </p>
          </div>

          {/* Problem */}
          <div className="mb-6 font-medium">
            <p className="text-sm text-gray-500 mb-1">Problem</p>
            <p className="text-base text-gray-900 leading-relaxed">
              {patientDetails.problem}
            </p>
          </div>

          {/* Mobile */}
          <div className="font-medium">
            <p className="text-sm text-gray-500 mb-1">Mobile</p>
            <p className="text-lg text-gray-900">{patientDetails.phone}</p>
          </div>
        </div>

        {/* Appointment Details Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-5 border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            Appointment Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Token Number</span>
              <span className="text-sm font-semibold text-gray-900">
                {currentAppointment.tokenNo}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Doctor</span>
              <span className="text-sm font-semibold text-gray-900">
                {currentAppointment.doctorName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Specialty</span>
              <span className="text-sm font-semibold text-gray-900">
                {currentAppointment.specialty}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Date & Time</span>
              <span className="text-sm font-semibold text-cyan-600">
                {currentAppointment.date}, {currentAppointment.timeSlot}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={`text-sm font-semibold ${
                  currentAppointment.status === "Upcoming"
                    ? "text-green-600"
                    : currentAppointment.status === "Canceled"
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {currentAppointment.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payment</span>
              <span
                className={`text-sm font-semibold ${
                  currentAppointment.paymentStatus === "Paid"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {currentAppointment.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Visit Type Dropdown */}
        <div className="mb-6">
          <button
            onClick={() => setShowVisitTypeDropdown(!showVisitTypeDropdown)}
            className="w-full bg-white rounded-2xl shadow-md p-5 border border-gray-200 flex items-center justify-between hover:border-cyan-300 transition-colors"
          >
            <span className="text-base font-medium text-gray-00">
              Visit Type - {selectedVisitType}
            </span>
            {showVisitTypeDropdown ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {showVisitTypeDropdown && (
            <div className="mt-2 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
              {visitTypeOptions.map((option, index) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedVisitType(option);
                    setShowVisitTypeDropdown(false);
                  }}
                  className={`w-full px-5 py-4 text-left text-base font-medium hover:bg-gray-50 transition-colors ${
                    selectedVisitType === option
                      ? "text-cyan-600 bg-cyan-50"
                      : "text-gray-700"
                  } ${
                    index !== visitTypeOptions.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Pay Consulting Fee Button */}
          <Button
            onClick={handlePayment}
            disabled={currentAppointment.paymentStatus === "Paid"}
            className="w-full py-6 rounded-xl font-bold text-base"
          >
            {currentAppointment.paymentStatus === "Paid"
              ? "Payment Completed ✓"
              : "Pay Consulting Fee"}
          </Button>

          {/* Quick Query Button */}
          <Button
            variant="outline"
            onClick={handleQuickQuery}
            className="w-full py-6 rounded-xl font-bold text-base"
          >
            Quick query
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PatientDetailsPage;
