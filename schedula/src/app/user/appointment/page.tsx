// user/appointment 
"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, MoreVertical, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import { Appointment } from "@/lib/types/appointment";
import Heading from "@/components/ui/Heading";
import { getPrescriptionsByAppointmentId } from "@/app/services/prescription.api";
import {
  getAppointmentsByPatient,
  updateAppointment,
} from "@/app/services/appointments.api";
import { Doctor } from "@/lib/types/doctor";
import { User } from "@/lib/types/user";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
type TabType = "Upcoming" | "Completed" | "Cancelled";
const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("Upcoming");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<any[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const filteredAppointments = appointments.filter(
    (apt) => apt.status === activeTab
  );
  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointmentsByPatient(user?.id || "");
      console.log("Appointments:", response);
      if (response && Array.isArray(response)) {
        // ✅ Attach prescriptions to each appointment
        const withPrescriptions = await Promise.all(
          response.map(async (appointment) => {
            const prescriptions = await getPrescriptionsByAppointmentId(
              appointment.id
            );
            return {
              ...appointment,
              prescription:
                prescriptions && prescriptions.length > 0
                  ? prescriptions[prescriptions.length - 1]
                  : null,
            };
          })
        );
        console.log("Appointments with prescriptions:", withPrescriptions);
        setAppointments(withPrescriptions);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllAppointments();
  }, []);
  const handleMakePayment = async (id: string): Promise<void> => {
    try {
      const response = await updateAppointment(id, {
        paid: true,
      });
      if (response.success) {
        // Update local state
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, paid: true } : apt))
        );
        toast.success("Payment successful!");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to process payment");
    }
    setOpenMenuId(null);
  };
  const handleCancelAppointment = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }
    try {
      const response = await updateAppointment(id, {
        status: "Cancelled",
      });
      if (response.success) {
        // Update local state
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === id ? { ...apt, status: "Cancelled" } : apt
          )
        );
        toast.success("Appointment cancelled successfully");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    }
    setOpenMenuId(null);
  };
  const toggleMenu = (id: string): void => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  const formatDate = (dateString: string): string => {
    const today = new Date();
    const appointmentDate = new Date(dateString);
    if (
      today.getDate() === appointmentDate.getDate() &&
      today.getMonth() === appointmentDate.getMonth() &&
      today.getFullYear() === appointmentDate.getFullYear()
    ) {
      return "Today";
    }
    return appointmentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);
  if (loading) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="pt-4 mb-2">
        <Heading heading={"Your Appointments"} />
      </div>
      {/* Tabs */}
      <div className="bg-white px-4 border-gray-200 sticky top-20 z-10">
        <div className="max-w-3xl mx-auto mt-8 flex gap-8">
          <button
            onClick={() => setActiveTab("Upcoming")}
            className={`py-3 font-semibold relative ${
              activeTab === "Upcoming" ? "text-cyan-500" : "text-gray-400"
            }`}
          >
            Upcoming
            {activeTab === "Upcoming" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("Completed")}
            className={`py-3 font-semibold relative ${
              activeTab === "Completed" ? "text-cyan-500" : "text-gray-400"
            }`}
          >
            Completed
            {activeTab === "Completed" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("Cancelled")}
            className={`py-3 font-semibold relative ${
              activeTab === "Cancelled" ? "text-cyan-500" : "text-gray-400"
            }`}
          >
            Cancelled
            {activeTab === "Cancelled" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
            )}
          </button>
        </div>
      </div>
      {/* Appointments List */}
      <div className="p-4 flex justify-center">
        <div className="w-full md:max-w-3xl space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <svg
                className="w-64 h-64 mb-8"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Clipboard 1 */}
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
                    fill="#22D3EE"
                  />
                  <circle cx="50" cy="10" r="4" fill="white" />
                  <circle cx="70" cy="10" r="4" fill="white" />
                </g>
                {/* Clipboard 2 */}
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
                    fill="#22D3EE"
                  />
                  <circle cx="60" cy="12" r="5" fill="white" />
                  <circle cx="85" cy="12" r="5" fill="white" />
                </g>
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                You dont have an appointment yet
              </h3>
              <p className="text-gray-600 text-center mb-8">
                Please click the button below to book an appointment.
              </p>
              <Button
                onClick={() => router.push("/user/dashboard")}
                className="w-full md:w-auto px-8"
              >
                Book appointment
              </Button>
            </div>
          ) : (
            filteredAppointments.map((appointment) => {
              const doctorName = appointment.doctor
                ? `${appointment.doctor.firstName || ""} ${
                    appointment.doctor.lastName || ""
                  }`.trim()
                : "Unknown Doctor";
              const doctorSpecialty = appointment.doctor?.specialty || "";
              const doctorImage = appointment.doctor?.image || null;
              return (
                <Card
                  key={appointment.id}
                  className="p-5 shadow-md border border-gray-200"
                >
                  <div className="flex gap-4">
                    {/* Doctor Image */}
                    <div className="relative shrink-0">
                      {doctorImage ? (
                        <Image
                          src={doctorImage}
                          alt={doctorName}
                          width={96}
                          height={96}
                          className="w-24 h-24 rounded-2xl object-cover ring-2 ring-gray-100"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-cyan-100 to-cyan-200 flex items-center justify-center ring-2 ring-gray-100">
                          <span className="text-3xl font-bold text-cyan-600">
                            {doctorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Appointment Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">
                            Dr. {doctorName}
                          </h3>
                          {doctorSpecialty && (
                            <p className="text-sm text-cyan-600 font-medium">
                              {doctorSpecialty}
                            </p>
                          )}
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(appointment.id);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                          {openMenuId === appointment.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-40">
                              <button
                                onClick={() => {
                                  router.push(
                                    `/user/appointment/${appointment.id}`
                                  );
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors rounded-t-xl"
                              >
                                View Details
                              </button>
                              {appointment.status === "Completed" && (
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/user/appointment/${appointment.id}/feedback`
                                    )
                                  }
                                  className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                  Feedback
                                </button>
                              )}
                              {appointment.status === "Completed" &&
                                appointment.prescription && (
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/user/prescription/${appointment.prescription.id}`
                                      )
                                    }
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors"
                                  >
                                    View Prescription
                                  </button>
                                )}
                              {appointment.status === "Upcoming" && (
                                <button
                                  onClick={() => {
                                    router.push(
                                      `/user/appointment/${appointment.id}/edit`
                                    );
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                  Edit
                                </button>
                              )}
                              {appointment.status === "Upcoming" && (
                                <>
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/user/doctor/${appointment.doctorId}/book?rescheduleId=${appointment.id}`
                                      );
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors"
                                  >
                                    Reschedule
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleCancelAppointment(appointment.id)
                                    }
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors rounded-b-xl"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="font-medium">
                          Token no - #{appointment.tokenNo}
                        </p>
                        <p>
                          {formatDate(appointment.date)} |{" "}
                          <span className="text-cyan-600 font-medium">
                            {appointment.time}
                          </span>
                        </p>
                        <p>
                          Payment |{" "}
                          <span
                            className={
                              appointment.paid
                                ? "text-green-600 font-medium"
                                : "text-red-600 font-medium"
                            }
                          >
                            {appointment.paid ? "Paid" : "Not Paid"}
                          </span>
                        </p>
                      </div>
                    </div>
                    {/* Hospital Icon */}
                    <div className="bg-cyan-50 rounded-xl p-3 h-fit">
                      <Building2 className="w-6 h-6 text-cyan-500" />
                    </div>
                  </div>
                  {!appointment.paid && appointment.status === "Upcoming" && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-sm text-gray-600 sm:max-w-[60%]">
                        Reduce your waiting time and visiting time by paying the
                        consulting fee upfront
                      </p>
                      <Button
                        onClick={() => handleMakePayment(appointment.id)}
                        className="w-full sm:w-auto"
                      >
                        Make Payment
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};
export default AppointmentsPage;
