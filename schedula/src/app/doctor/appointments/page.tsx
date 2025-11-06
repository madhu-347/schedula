"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { getAppointmentsByDoctor } from "@/app/services/appointments.api";
import { getPrescriptionsByAppointmentId } from "@/app/services/prescription.api";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Edit,
  X,
} from "lucide-react";
import { Appointment } from "@/lib/types/appointment";

// Types
interface PatientDetails {
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  weight?: number;
  problem?: string;
  relationship: string;
}

// Helper Components
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    Upcoming: "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
    Waiting: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

const DetailRow = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: string;
  highlight?: "green" | "red";
}) => {
  if (!value) return null;

  const highlightStyles = {
    green: "text-green-600 font-medium",
    red: "text-red-600 font-medium",
  };

  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className={highlight ? highlightStyles[highlight] : "font-medium"}>
        {value}
      </span>
    </div>
  );
};

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const { doctor } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [hasPrescription, setHasPrescription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctor?.id) return;

      try {
        setLoading(true);
        const data = await getAppointmentsByDoctor(doctor.id);
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctor?.id]);

  // Filter appointments based on active tab
  useEffect(() => {
    const filtered = appointments.filter(
      (appointment) => appointment.status === activeTab
    );
    setFilteredAppointments(filtered);
  }, [appointments, activeTab]);

  const handleCompleteAppointment = async (id: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/appointment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: "Completed",
        }),
      });

      if (response.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === id ? { ...apt, status: "Completed" } : apt
          )
        );
      }
    } catch (error) {
      console.error("Failed to complete appointment:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditAppointment = (id: string) => {
    router.push(`/doctor/appointments/${id}/edit`);
  };

  const handleCancelAppointment = async (id: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/appointment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: "Cancelled",
        }),
      });

      if (response.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === id ? { ...apt, status: "Cancelled" } : apt
          )
        );
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  if (loading) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Appointments
          </h1>
          <p className="text-gray-600">
            Manage your upcoming, completed, and cancelled appointments
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {["Upcoming", "Completed", "Cancelled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-cyan-500 text-cyan-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                  <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {
                      appointments.filter(
                        (appointment) => appointment.status === tab
                      ).length
                    }
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        #{appointment.tokenNo}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {appointment.patientDetails?.fullName}
                      </p>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        {format(new Date(appointment.date), "MMM dd, yyyy")}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{appointment.time}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{appointment.type || "In-person"}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{appointment.patientDetails?.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-cyan-600 text-cyan-600 hover:bg-cyan-50"
                    onClick={async () => {
                      setSelectedAppointment(appointment);
                      const rx = await getPrescriptionsByAppointmentId(
                        appointment.id
                      );
                      setHasPrescription(rx && rx.length > 0);
                    }}
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
                        <X className="w-4 h-4 mr-2" />
                        {isUpdating ? "Cancelling..." : "Cancel"}
                      </Button>
                    </div>
                  </>
                )}

                {selectedAppointment.status === "Completed" &&
                  hasPrescription && (
                    <Button
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                      onClick={() =>
                        router.push(
                          `/doctor/appointments/${selectedAppointment.id}/prescription/view`
                        )
                      }
                    >
                      View Prescription
                    </Button>
                  )}

                {selectedAppointment.status === "Completed" &&
                  !hasPrescription && (
                    <Button
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                      onClick={() =>
                        router.push(
                          `/doctor/appointments/${selectedAppointment.id}/prescription`
                        )
                      }
                    >
                      Add Prescription
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
