"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  User,
  Video,
  CheckCircle2,
  X,
  Edit,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/useToast";
import {
  getAppointmentsByDoctor,
  updateAppointment,
} from "@/app/services/appointments.api";
import { useAuth } from "@/context/AuthContext";
import { Appointment } from "@/lib/types/appointment";

type TabStatus = "Upcoming" | "Completed" | "Cancelled";

export default function DoctorAppointmentsPage() {
  const { doctor } = useAuth();
  // console.log(doctor);
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<TabStatus>("Upcoming");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load appointments from API
  const loadAppointments = async () => {
    if (!doctor?.id) return;

    setIsLoading(true);
    try {
      const appts = await getAppointmentsByDoctor(doctor.id);
      console.log("Fetched appointments:", appts);
      setAppointments(appts || []);
      console.log("appointments: ", appointments);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setAppointments([]);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [doctor?.id]);

  // Filter appointments by active tab
  const filteredAppointments = useMemo(
    () => appointments.filter((a) => a.status === activeTab),
    [appointments, activeTab]
  );

  // Complete appointment
  const handleCompleteAppointment = async (appointmentId: string) => {
    setIsUpdating(true);
    try {
      const response = await updateAppointment(appointmentId, {
        status: "Completed",
      });

      if (response.success) {
        toast({
          title: "Appointment Completed",
          description: "The appointment has been marked as completed.",
        });

        // Reload appointments
        await loadAppointments();
        closeModal();
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast({
        title: "Error",
        description: "Failed to complete appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await updateAppointment(appointmentId, {
        status: "Cancelled",
      });

      if (response.success) {
        toast({
          title: "Appointment Cancelled",
          description: "The appointment has been cancelled.",
        });

        // Reload appointments
        await loadAppointments();
        closeModal();
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Edit appointment
  const handleEditAppointment = (appointmentId: string) => {
    router.push(`/doctor/appointments/${appointmentId}/edit`);
  };

  const closeModal = () => setSelectedAppointment(null);

  // ESC key closes modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const tabs: TabStatus[] = ["Upcoming", "Completed", "Cancelled"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/doctor/dashboard"
              className="p-2 -ml-2 rounded-full hover:bg-cyan-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                My Appointments
              </h1>
              {doctor && (
                <p className="text-sm text-gray-500 mt-1">
                  Dr. {doctor.firstName} {doctor.lastName}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium transition-colors ${
                activeTab === tab
                  ? "text-cyan-600 border-b-2 border-cyan-600"
                  : "text-gray-600 hover:text-cyan-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Appointment Cards */}
        {filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-cyan-600" />
                      {appointment.patientDetails?.fullName || "Patient"}
                    </h2>
                    {appointment.patientDetails?.problem && (
                      <p className="text-sm text-gray-500 mt-1">
                        {appointment.patientDetails.problem}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-sm px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                      appointment.status === "Upcoming"
                        ? "bg-cyan-50 text-cyan-600"
                        : appointment.status === "Completed"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4" />
                    {appointment.day && `${appointment.day}, `}
                    {appointment.date}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {appointment.time}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    {appointment.type === "Virtual" ? (
                      <Video className="w-4 h-4 text-purple-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {appointment.type || "In-person"}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="font-medium">Token:</span>
                    <span className="text-cyan-600 font-semibold">
                      #{appointment.tokenNo}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-cyan-600 text-cyan-600 hover:bg-cyan-50"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <svg
              className="w-48 h-48 mb-6 opacity-50"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(120, 140) rotate(-15)">
                <rect
                  x="0"
                  y="20"
                  width="120"
                  height="160"
                  rx="8"
                  fill="#E5E7EB"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                />
                <rect
                  x="30"
                  y="0"
                  width="60"
                  height="30"
                  rx="6"
                  fill="#06b6d4"
                />
                <circle cx="50" cy="10" r="4" fill="white" />
                <circle cx="70" cy="10" r="4" fill="white" />
              </g>
              <g transform="translate(180, 150) rotate(10)">
                <rect
                  x="0"
                  y="20"
                  width="140"
                  height="180"
                  rx="8"
                  fill="#F3F4F6"
                  stroke="#6B7280"
                  strokeWidth="2"
                />
                <rect
                  x="35"
                  y="0"
                  width="70"
                  height="35"
                  rx="8"
                  fill="#06b6d4"
                />
                <circle cx="60" cy="12" r="5" fill="white" />
                <circle cx="85" cy="12" r="5" fill="white" />
              </g>
            </svg>

            <p className="text-lg font-medium text-gray-700 mb-2">
              No {activeTab.toLowerCase()} appointments
            </p>
            <p className="text-sm text-gray-500 text-center">
              Your {activeTab.toLowerCase()} appointments will appear here
            </p>
          </div>
        )}
      </div>

      {/* Modal for Appointment Details */}
      {selectedAppointment && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
            onClick={closeModal}
          ></div>

          <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center pr-6">
                Appointment Details
              </h2>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-100">
                  <p className="text-cyan-800 font-semibold text-center">
                    Token No: #{selectedAppointment.tokenNo}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <DetailRow
                    label="Patient Name"
                    value={selectedAppointment.patientDetails?.fullName}
                  />
                  <DetailRow
                    label="Age"
                    value={selectedAppointment.patientDetails?.age?.toString()}
                  />
                  <DetailRow
                    label="Gender"
                    value={selectedAppointment.patientDetails?.gender}
                  />
                  <DetailRow
                    label="Phone"
                    value={selectedAppointment.patientDetails?.phone}
                  />
                  {selectedAppointment.patientDetails?.weight && (
                    <DetailRow
                      label="Weight"
                      value={`${selectedAppointment.patientDetails.weight} kg`}
                    />
                  )}
                  <DetailRow
                    label="Relationship"
                    value={selectedAppointment.patientDetails?.relationship}
                  />
                  {selectedAppointment.patientDetails?.problem && (
                    <DetailRow
                      label="Problem"
                      value={selectedAppointment.patientDetails.problem}
                    />
                  )}
                  <DetailRow
                    label="Date"
                    value={`${selectedAppointment.day}, ${selectedAppointment.date}`}
                  />
                  <DetailRow label="Time" value={selectedAppointment.time} />
                  <DetailRow
                    label="Type"
                    value={selectedAppointment.type || "In-person"}
                  />
                  <DetailRow
                    label="Visit Type"
                    value={selectedAppointment.visitType}
                  />
                  <DetailRow
                    label="Payment Status"
                    value={selectedAppointment.paid ? "Paid" : "Not Paid"}
                    highlight={selectedAppointment.paid ? "green" : "red"}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-6">
                {selectedAppointment.status === "Upcoming" && (
                  <>
                    <Button
                      className="w-full cursor-pointer bg-green-500 hover:bg-green-600 text-white"
                      onClick={() =>
                        handleCompleteAppointment(selectedAppointment.id)
                      }
                      disabled={isUpdating}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {isUpdating ? "Completing..." : "Mark as Completed"}
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="border-cyan-600 cursor-pointer text-cyan-600 hover:bg-cyan-50"
                        onClick={() =>
                          handleEditAppointment(selectedAppointment.id)
                        }
                        disabled={isUpdating}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        className="cursor-pointer border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() =>
                          handleCancelAppointment(selectedAppointment.id)
                        }
                        disabled={isUpdating}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
                {selectedAppointment.status === "Completed" && (
                  <>
                    {!selectedAppointment.prescription ? (
                      <Button 
                        onClick={() => router.push(`/doctor/appointments/${selectedAppointment.id}/prescription`)}
                      >
                        Add Prescription
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={() => router.push(`/doctor/appointments/${selectedAppointment.id}/prescription/view`)}
                      >
                        View Prescription
                      </Button>
                    )}
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="w-full cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper component for detail rows
function DetailRow({
  label,
  value,
  fullWidth = false,
  highlight,
}: {
  label: string;
  value?: string;
  fullWidth?: boolean;
  highlight?: "green" | "red";
}) {
  if (!value) return null;

  return (
    <div className={`${fullWidth ? "" : "grid grid-cols-2 gap-2"} py-1`}>
      <span className="font-medium text-gray-600">{label}:</span>
      <span
        className={`${fullWidth ? "mt-1" : ""} ${
          highlight === "green"
            ? "text-green-600 font-semibold"
            : highlight === "red"
            ? "text-red-600 font-semibold"
            : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
