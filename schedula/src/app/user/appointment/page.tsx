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

type TabType = "Upcoming" | "Completed" | "Cancelled";

const AppointmentsPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("Upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  const filteredAppointments = appointments.filter(
    (apt) => apt.status === activeTab
  );

  const handleMakePayment = (id: number): void => {
    // Update in state
    const updatedAppointments = appointments.map((apt) =>
      apt.id === id ? { ...apt, paymentStatus: "Paid" as const } : apt
    );
    setAppointments(updatedAppointments);

    // Update in localStorage - get all appointments, update the specific one
    const allStored = localStorage.getItem("appointments");
    if (allStored) {
      const allAppointments: Appointment[] = JSON.parse(allStored);
      const updatedAll = allAppointments.map((apt) =>
        apt.id === id ? { ...apt, paymentStatus: "Paid" as const } : apt
      );
      localStorage.setItem("appointments", JSON.stringify(updatedAll));
    }

    // Dispatch custom event for other components
    window.dispatchEvent(new Event("appointment:updated"));
    setOpenMenuId(null);
  };

  const handleCancelAppointment = (id: number): void => {
    // Update in state
    const updatedAppointments = appointments.map((apt) =>
      apt.id === id ? { ...apt, status: "Cancelled" as const } : apt
    );
    setAppointments(updatedAppointments);

    // Update in localStorage - get all appointments, update the specific one
    const allStored = localStorage.getItem("appointments");
    if (allStored) {
      const allAppointments: Appointment[] = JSON.parse(allStored);
      const updatedAll = allAppointments.map((apt) =>
        apt.id === id ? { ...apt, status: "Cancelled" as const } : apt
      );
      localStorage.setItem("appointments", JSON.stringify(updatedAll));
    }

    // Dispatch custom event for other components
    window.dispatchEvent(new Event("appointment:updated"));

    getAllAppointments(JSON.parse(localStorage.getItem("user") || "{}"));
    setOpenMenuId(null);
  };

  const toggleMenu = (id: number): void => {
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

    // Format as "Oct 30, 2025" or use your preferred format
    return appointmentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAllAppointments = (user: any) => {

    try {
      setLoading(true);
      const stored = localStorage.getItem("appointments");

      if (!stored) {
        console.log("No appointments found in localStorage");
        setAppointments([]);
        return;
      }

      const parsed: Appointment[] = JSON.parse(stored);

      // Ensure it's an array
      if (!Array.isArray(parsed)) {
        console.error("Appointments data is not an array");
        setAppointments([]);
        return;
      }

      // Filter appointments for the current patient (case-insensitive)
      // Filter by logged in user's email instead of name
      const patientAppointments = parsed.filter(
        (apt) => apt.userEmail && apt.userEmail === user.email
);


      console.log(
        `Appointments for ${user.name}:`,
        patientAppointments.length
      );
      setAppointments(patientAppointments);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get logged-in user's information
    const userString = localStorage.getItem("user");
    const expiryString = localStorage.getItem("userExpiry");
    const expiry = expiryString ? Number(expiryString) : 0;

    if (!userString || !expiry || Date.now() >= expiry) {
      // User not logged in or session expired
      // router.push("/user/login");
      return;
    }

    try {
      const user = JSON.parse(userString);

      if (!user || user.type !== "user") {
        // Not a patient user
        router.push("/user/login");
        return;
      }
      setCurrentUserName(user.name);
      getAllAppointments(user);

    const handleUpdate = () => {
      getAllAppointments(user);
};

      window.addEventListener("appointment:updated", handleUpdate);
      window.addEventListener("storage", handleUpdate);

      return () => {
        window.removeEventListener("appointment:updated", handleUpdate);
        window.removeEventListener("storage", handleUpdate);
      };
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/user/login");
    }
  }, [router]);

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
        <div className="max-w-3xl mx-auto flex gap-8">
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
                You don't have an appointment yet
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
            filteredAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="p-5 shadow-md border border-gray-200"
              >
                <div className="flex gap-4">
                  {/* Doctor Image */}
                  <div className="relative shrink-0">
                    {appointment.doctorImage ? (
                      <Image
                        src={appointment.doctorImage}
                        alt={appointment.doctorName}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-2xl object-cover ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center ring-2 ring-gray-100">
                        <span className="text-3xl font-bold text-cyan-600">
                          {appointment.doctorName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Appointment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {appointment.doctorName}
                        </h3>
                        {appointment.specialty && (
                          <p className="text-sm text-cyan-600 font-medium">
                            {appointment.specialty}
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
                                    console.log("Reschedule clicked");
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
                          {appointment.timeSlot}
                        </span>
                      </p>
                      <p>
                        Payment |{" "}
                        <span
                          className={
                            appointment.paymentStatus === "Paid"
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {appointment.paymentStatus}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Hospital Icon */}
                  <div className="bg-cyan-50 rounded-xl p-3 h-fit">
                    <Building2 className="w-6 h-6 text-cyan-500" />
                  </div>
                </div>

                {appointment.paymentStatus === "Not paid" &&
                  appointment.status === "Upcoming" && (
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
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AppointmentsPage;
