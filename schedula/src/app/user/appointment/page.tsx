"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, MoreVertical, Building2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Appointment } from "@/lib/types/appointment";

// Type definitions

type TabType = "Upcoming" | "Completed" | "Canceled";

const AppointmentsPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("Upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showViewModal, setShowViewModal] = useState<Appointment | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] =
    useState<Appointment | null>(null);

  const filteredAppointments = appointments.filter(
    (apt) => apt.status === activeTab
  );

  const handleMakePayment = (id: number): void => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, payment: "Paid" } : apt
      )
    );
    setOpenMenuId(null);
  };

  const handleCancelAppointment = (id: number): void => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: "Canceled" as const } : apt
      )
    );
    setOpenMenuId(null);
  };

  const toggleMenu = (id: number): void => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const formatDate = (dateString: string): string => {
    const today = new Date().toISOString().split("T")[0];
    return dateString === today ? "Today" : dateString;
  };

  const fecthAppointments = () => {
    const storedAppointments = localStorage.getItem("appointments");
    if (storedAppointments) {
      const appointments: Appointment[] = JSON.parse(storedAppointments);
      console.log("appointment data : ", appointments);
      setAppointments(appointments);
    }
  };

  useEffect(() => {
    fecthAppointments();
  }, [openMenuId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <h1 className="text-xl font-semibold text-gray-900">
              Appointment Scheduled
            </h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white px-4 border-b border-gray-200 sticky top-16 z-10">
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
            onClick={() => setActiveTab("Canceled")}
            className={`py-3 font-semibold relative ${
              activeTab === "Canceled" ? "text-cyan-500" : "text-gray-400"
            }`}
          >
            Canceled
            {activeTab === "Canceled" && (
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
                {/* Clipboard 1 (tilted left) */}
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
                {/* Clipboard 2 (tilted right, in front) */}
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
                    <Image
                      src={appointment.doctorImage}
                      alt={appointment.doctorName}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-2xl object-cover ring-2 ring-gray-100"
                    />
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
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 w-40">
                            <button
                              onClick={() => {
                                router.push(`/appointment/${appointment.id}`);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                              View Details
                            </button>
                            {appointment.status === "Upcoming" && (
                              <>
                                <button
                                  onClick={() => {
                                    setShowRescheduleModal(appointment);
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
                                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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

      {/* View Modal */}
      {/* {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Appointment Details
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 pb-4 border-b">
                <Image
                  src={showViewModal.doctorImage}
                  alt={showViewModal.doctorName}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-xl object-cover ring-2 ring-gray-100"
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {showViewModal.doctorName}
                  </h3>
                  {showViewModal.specialty && (
                    <p className="text-sm text-cyan-600 font-medium">
                      {showViewModal.specialty}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    Token no: #{showViewModal.tokenNo}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">
                    {showViewModal.date}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-semibold text-gray-900">
                    {showViewModal.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p
                    className={`font-semibold ${
                      showViewModal.payment === "Paid"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {showViewModal.payment}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {showViewModal.status}
                  </p>
                </div>
                {showViewModal.location && (
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">
                      {showViewModal.location}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={() => setShowViewModal(null)}
              className="w-full mt-6"
            >
              Close
            </Button>
          </Card>
        </div>
      )} */}

      {/* Reschedule Modal */}
      {/* {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Reschedule Appointment
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Date
                </label>
                <input
                  type="date"
                  defaultValue={showRescheduleModal.date}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 transition-colors"
                  id="reschedule-date"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Time
                </label>
                <input
                  type="time"
                  defaultValue="12:30"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 transition-colors"
                  id="reschedule-time"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowRescheduleModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const dateInput = document.getElementById(
                    "reschedule-date"
                  ) as HTMLInputElement;
                  const timeInput = document.getElementById(
                    "reschedule-time"
                  ) as HTMLInputElement;
                  const newDate = dateInput.value;
                  const newTime = timeInput.value;
                  handleReschedule(showRescheduleModal.id, newDate, newTime);
                }}
                className="flex-1"
              >
                Confirm
              </Button>
            </div>
          </Card>
        </div>
      )} */}
      <BottomNav />
    </div>
  );
};

export default AppointmentsPage;
