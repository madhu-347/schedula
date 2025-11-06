"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import { Appointment } from "@/lib/types/appointment";
import Heading from "@/components/ui/Heading";
import {
  getAppointmentById,
  updateAppointment,
} from "@/app/services/appointments.api";
import { Doctor } from "@/lib/types/doctor";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const PatientDetailsPage = () => {
  const params = useParams();
  const appointmentId = params?.id as string;
  const router = useRouter();
  const [doctorData, setDoctorData] = useState<Doctor>();
  const [currentAppointment, setCurrentAppointment] =
    useState<Appointment | null>(null);
  const [showVisitTypeDropdown, setShowVisitTypeDropdown] = useState(false);
  const [selectedVisitType, setSelectedVisitType] = useState<
    "First" | "Report" | "Follow-up"
  >("First");
  const [loading, setLoading] = useState(false);
  const [visitTypeLoading, setVisitTypeLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const visitTypeOptions: Array<"First" | "Report" | "Follow-up"> = [
    "First",
    "Report",
    "Follow-up",
  ];

  const fetchAppointment = async () => {
    try {
      const appointment = await getAppointmentById(appointmentId);
      console.log("response : ", appointment);
      if (appointment) {
        setCurrentAppointment(appointment);
        setDoctorData(appointment?.doctor);
        if (appointment?.visitType) {
          setSelectedVisitType(appointment.visitType);
        }
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      toast({
        title: "Error",
        description: "Failed to load appointment details.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const handleVisitTypeChange = async (
    visitType: "First" | "Report" | "Follow-up"
  ) => {
    if (!currentAppointment) return;

    setVisitTypeLoading(true);
    try {
      // Update appointment with visit type via API
      const updatedAppointment = await updateAppointment(appointmentId, {
        visitType: visitType,
      });

      if (updatedAppointment && updatedAppointment.data) {
        setCurrentAppointment(updatedAppointment.data);
        setSelectedVisitType(visitType);
        setShowVisitTypeDropdown(false);

        toast({
          title: "Visit Type Updated",
          description: `Visit type set to ${visitType}.`,
        });
      } else {
        throw new Error("Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating visit type:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update visit type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVisitTypeLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!currentAppointment) return;

    setPaymentLoading(true);
    try {
      // Update appointment with payment status via API
      const updatedAppointment = await updateAppointment(appointmentId, {
        paid: true,
        paymentStatus: "Paid",
      });

      if (updatedAppointment && updatedAppointment.data) {
        setCurrentAppointment(updatedAppointment.data);

        toast({
          title: "Payment Successful",
          description: "Your consulting fee has been paid successfully.",
        });
      } else {
        throw new Error("Failed to update payment status");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleQuickQuery = () => {
    // Navigate to chat with doctor
    router.push(`/user/appointment/${appointmentId}/chat`);
  };

  if (!currentAppointment || !currentAppointment.patientDetails) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading patient details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const { patientDetails } = currentAppointment;

  return (
    <ProtectedRoute>
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
              {/* Mobile */}
              <div className="font-medium">
                <p className="text-sm text-gray-500 mb-1">Mobile</p>
                <p className="text-lg text-gray-900">{patientDetails.phone}</p>
              </div>
              {/* Relationship */}
              <div className="mb-6 font-medium">
                <p className="text-sm text-gray-500 mb-1">Relationship</p>
                <p className="text-lg text-gray-900">
                  {patientDetails.relationship}
                </p>
              </div>
            </div>

            {/* Problem */}
            <div className="mb-2 font-medium">
              <p className="text-sm text-gray-500 mb-1">Problem</p>
              <p className="text-base text-gray-900 leading-relaxed">
                {patientDetails.problem}
              </p>
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
                  {doctorData?.firstName} {doctorData?.lastName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Specialty</span>
                <span className="text-sm font-semibold text-gray-900">
                  {doctorData?.specialty}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Date & Time</span>
                <span className="text-sm font-semibold text-cyan-600">
                  {currentAppointment.date}, {currentAppointment.time}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span
                  className={`text-sm font-semibold ${
                    currentAppointment.status === "Upcoming"
                      ? "text-green-600"
                      : currentAppointment.status === "Cancelled"
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
                    currentAppointment.paid === true
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {currentAppointment.paid === true ? "Paid" : "Not Paid"}
                </span>
              </div>
            </div>
          </div>

          {/* Visit Type Dropdown */}
          <div className="mb-6">
            <button
              onClick={() => setShowVisitTypeDropdown(!showVisitTypeDropdown)}
              disabled={visitTypeLoading}
              className="w-full bg-white rounded-2xl shadow-md p-5 border border-gray-200 flex items-center justify-between hover:border-cyan-300 transition-colors disabled:opacity-50"
            >
              <span className="text-base font-medium text-gray-900">
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
                    onClick={() => handleVisitTypeChange(option)}
                    disabled={visitTypeLoading}
                    className={`w-full px-5 py-4 text-left text-base font-medium hover:bg-gray-50 transition-colors ${
                      selectedVisitType === option
                        ? "text-cyan-600 bg-cyan-50"
                        : "text-gray-700"
                    } ${
                      index !== visitTypeOptions.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    } disabled:opacity-50`}
                  >
                    {visitTypeLoading && selectedVisitType === option ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500 mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      option
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-x-10">
            {/* Pay Consulting Fee Button */}
            <Button
              onClick={handlePayment}
              disabled={currentAppointment.paid === true || paymentLoading}
              className="w-1/2 py-6 rounded-xl font-bold text-base disabled:opacity-50"
            >
              {paymentLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : currentAppointment.paid === true ? (
                "Payment Completed ✓"
              ) : (
                "Pay Consulting Fee"
              )}
            </Button>

            {/* Quick Query Button */}
            <Button
              variant="outline"
              onClick={handleQuickQuery}
              disabled={loading}
              className="w-1/2 py-6 rounded-xl font-bold text-base disabled:opacity-50"
            >
              Quick query
            </Button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default PatientDetailsPage;
