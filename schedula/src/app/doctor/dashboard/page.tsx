"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Calendar,
  Users,
  Bell,
  UserPlus,
  X,
  Video,
  ChevronRight,
  Star,
  Clock,
  FileText,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Appointment } from "@/lib/types/appointment";
import { useAuth } from "@/context/AuthContext";
import { getAppointmentsByDoctor } from "@/app/services/appointments.api";

type DashboardStats = {
  todayAppointments: number;
  totalPatients: number;
  pendingRequests: number;
};

type VisitTypeBreakdown = {
  name: string;
  value: number;
};

type ReviewDisplay = {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  feedbackText: string;
  date: string;
};

type Notification = {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
};

export default function DoctorDashboardPage() {
  const { doctor, loading } = useAuth();
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    totalPatients: 0,
    pendingRequests: 0,
  });
  const [visitTypeBreakdown, setVisitTypeBreakdown] = useState<
    VisitTypeBreakdown[]
  >([]);
  const [appointmentDates, setAppointmentDates] = useState<Date[]>([]);
  const [reviews, setReviews] = useState<ReviewDisplay[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch appointments and calculate all data
  const fetchAndProcessAppointments = async () => {
    if (!doctor?.id) return;

    setIsLoadingData(true);
    try {
      const appointments: Appointment[] = await getAppointmentsByDoctor(
        doctor.id
      );
      console.log("Fetched appointments:", appointments);

      setAllAppointments(appointments);

      // Process upcoming appointments (top 5)
      const upcoming = appointments
        .filter((a) => a.status === "Upcoming")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      setUpcomingAppointments(upcoming);

      // Calculate stats
      calculateStats(appointments);

      // Calculate visit type breakdown
      calculateVisitTypes(appointments);

      // Extract appointment dates for calendar
      extractAppointmentDates(appointments);

      // Process reviews from feedback
      processReviews(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Calculate dashboard stats
  const calculateStats = (appointments: Appointment[]) => {
    const today = format(new Date(), "yyyy-MM-dd");

    const todayAppointmentsCount = appointments.filter(
      (a) => a.date === today && a.status === "Upcoming"
    ).length;

    // Count unique patients
    const uniquePatients = new Set(appointments.map((a) => a.patientId)).size;

    // Count upcoming appointments as pending
    const pendingCount = appointments.filter(
      (a) => a.status === "Upcoming"
    ).length;

    setStats({
      todayAppointments: todayAppointmentsCount,
      totalPatients: uniquePatients,
      pendingRequests: pendingCount,
    });
  };

  // Calculate visit type breakdown for pie chart
  const calculateVisitTypes = (appointments: Appointment[]) => {
    const firstVisitCount = appointments.filter(
      (a) => a.visitType === "First"
    ).length;

    const reportVisitCount = appointments.filter(
      (a) => a.visitType === "Report"
    ).length;

    const followUpCount = appointments.filter(
      (a) => a.visitType === "Follow-up"
    ).length;

    setVisitTypeBreakdown([
      { name: "First Visit", value: firstVisitCount },
      { name: "Report", value: reportVisitCount },
      { name: "Follow-up", value: followUpCount },
    ]);
  };

  // Extract dates for calendar marking
  const extractAppointmentDates = (appointments: Appointment[]) => {
    const dates = appointments
     .filter((a) => a.date && a.status === "Upcoming")
      .map((a) => {
        try {
          return new Date(a.date);
        } catch {
          return null;
        }
      })
      .filter((d): d is Date => d !== null);

    setAppointmentDates(dates);
  };

  // Process reviews from appointment feedback
  const processReviews = (appointments: Appointment[]) => {
    const reviewsData: ReviewDisplay[] = appointments
      .filter((a) => a.feedback && a.status === "Completed")
      .map((a) => {
        const feedback = a.feedback!;
        const patientName = a.patientDetails?.fullName || "Anonymous Patient";

        // Calculate average rating
        const avgRating = Math.round(
          (feedback.consulting + feedback.hospital + feedback.waitingTime) / 3
        );

        // Generate default comment if no feedback text
        let comment = feedback.feedbackText || "";
        if (!comment) {
          if (avgRating >= 4.5) {
            comment = "Excellent doctor! Highly recommend.";
          } else if (avgRating >= 3.5) {
            comment =
              "Very helpful and understanding. Explained everything clearly.";
          } else if (avgRating >= 2.5) {
            comment = "Good consultation, but could be improved.";
          } else {
            comment = "The experience needs improvement.";
          }
        }

        return {
          id: `${a.id}-${feedback.submittedAt}`,
          patientName,
          rating: avgRating,
          comment,
          feedbackText: feedback.feedbackText || "",
          date: feedback.submittedAt,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3); // Show only top 3 most recent

    setReviews(reviewsData);
  };

  // Fetch appointments on mount and when doctor changes
  useEffect(() => {
    if (!doctor?.id) return;

    fetchAndProcessAppointments();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchAndProcessAppointments, 60000);
    return () => clearInterval(interval);
  }, [doctor?.id]);

  // Fetch notifications
  useEffect(() => {
    if (!doctor?.id) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `/api/notifications?recipientId=${encodeURIComponent(doctor.id)}`
        );
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data.reverse());
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [doctor?.id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userExpiry");
    router.push("/doctor/login");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Redirect if no doctor
  if (!doctor) {
    // router.push("/doctor/login");
    return null;
  }

  // Calendar modifiers
  const appointmentDayModifier = { appointment: appointmentDates };
  const appointmentDotStyleCSS = `
    .rdp-day_appointment { position: relative; }
    .rdp-day_appointment::after {
        content: ''; position: absolute; bottom: 4px; left: 50%;
        transform: translateX(-50%); width: 6px; height: 6px;
        border-radius: 50%; background-color: #0891b2;
    }
  `;

  const PIE_COLORS = ["#06b6d4", "#f59e0b", "#10b981"];
console.log("upcomingAppointments",upcomingAppointments)
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoadingData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Calendar Section */}
                <section className="bg-white p-4 rounded-lg shadow-md">
                  <style>{appointmentDotStyleCSS}</style>
                  <DayPicker
                    mode="single"
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    modifiers={appointmentDayModifier}
                    modifiersClassNames={{ appointment: "rdp-day_appointment" }}
                    onDayClick={(day) => {
                      const formattedDate = format(day, "yyyy-MM-dd");
                      router.push(`/doctor/calendar?date=${formattedDate}`);
                    }}
                    styles={{
                      caption_label: { fontWeight: "bold" },
                      head_cell: { color: "#666", fontSize: "0.8rem" },
                    }}
                    footer={
                      <p className="text-center text-sm mt-2 text-gray-500">
                        Today is {format(new Date(), "PPP")}.
                      </p>
                    }
                    showOutsideDays
                    className="w-full"
                  />
                </section>

                {/* Quick Actions Section */}
                <section className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    Quick Actions
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/doctor/calendar"
                      className="text-sm bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-md transition-colors"
                    >
                      Open Full Calendar
                    </Link>
                    <Link
                      href="/doctor/availability"
                      className="text-sm bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-md transition-colors"
                    >
                      Manage Availability
                    </Link>
                    <Link
                      href="/doctor/appointment"
                      className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-md transition-colors"
                    >
                      View All Appointments
                    </Link>
                  </div>
                </section>

                {/* Recent Reviews Section */}
                <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Recent Reviews
                  </h2>
                  {reviews.length > 0 ? (
                    <ul className="space-y-4">
                      {reviews.map((review) => (
                        <li
                          key={review.id}
                          className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-700 text-sm">
                              {review.patientName}
                            </span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={`${
                                    i < review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-1">
                            {review.feedbackText || review.comment}
                          </p>
                          <p className="text-xs text-gray-400 text-right">
                            {format(new Date(review.date), "PP")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No reviews received yet.
                    </p>
                  )}
                  <button
                    onClick={() => router.push("/doctor/reviews")}
                    className="text-sm text-cyan-600 hover:underline mt-4 font-medium"
                  >
                    View All Reviews
                  </button>
                </section>
              </div>

              {/* Right Column */}
              <section className="lg:col-span-2 space-y-6">
                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatBox
                    title="Today's Appointments"
                    value={stats.todayAppointments}
                    icon={Calendar}
                    color="text-cyan-600 bg-cyan-100"
                  />
                  <StatBox
                    title="Total Patients"
                    value={stats.totalPatients}
                    icon={Users}
                    color="text-blue-600 bg-blue-100"
                  />
                  <StatBox
                    title="Upcoming"
                    value={stats.pendingRequests}
                    icon={UserPlus}
                    color="text-amber-600 bg-amber-100"
                  />
                </div>

                {/* Pie Chart Section */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Visit Types Distribution
                  </h2>
                  {visitTypeBreakdown.some((item) => item.value > 0) ? (
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={visitTypeBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {visitTypeBreakdown.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => `${value} appointments`}
                          />
                          <Legend
                            iconType="circle"
                            verticalAlign="bottom"
                            height={36}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">
                      No visit type data available yet.
                    </p>
                  )}
                </div>

                {/* Upcoming Appointments List */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Upcoming Appointments
                  </h2>
                  {upcomingAppointments.length > 0 ? (
                    <ul className="space-y-4">
                      {upcomingAppointments.map((appt) => (
                        <li
                          key={appt.id}
                          className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() =>
                                router.push(`/doctor/appointment`)
                              }
                            >
                              {appt.type === "Virtual" ? (
                                <Video className="w-5 h-5 text-purple-500 shrink-0" />
                              ) : (
                                <Clock className="w-5 h-5 text-cyan-500 shrink-0" />
                              )}
                              <div>
                                <p className="font-medium text-gray-700">
                                  {appt?.patientDetails?.fullName || "Patient"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {appt.date} • {appt.time}
                                </p>
                                {appt.patientDetails?.problem && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {appt.patientDetails.problem}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* <Link
                                href={`/doctor/patient/${appt.patientId}/history`}
                                className="p-2 rounded-lg hover:bg-cyan-50 transition-colors group"
                                title="View Medical History"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FileText className="w-4 h-4 text-gray-400 group-hover:text-cyan-600" />
                              </Link> */}
                              
                              <Link
                                href={`/doctor/appointment/${appt.id}`}
                                className="p-2 rounded-lg hover:bg-cyan-50 transition-colors group"
                                title="View Appointment"
                                onClick={(e) => e.stopPropagation()}
                              >
                              <ChevronRight
                                className="w-4 h-4 text-gray-400 group-hover:text-cyan-600"
                              />
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No upcoming appointments scheduled.
                    </p>
                  )}
                  <Link
                    href="/doctor/appointment"
                    className="text-sm text-cyan-600 hover:underline mt-4 font-medium inline-block"
                  >
                    View Full Schedule
                  </Link>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
// StatBox Component
interface StatBoxProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

function StatBox({ title, value, icon: Icon, color }: StatBoxProps) {
  const router = useRouter();

  const handleClick = () => {
    if (title === "Total Patients") router.push("/doctor/patient");
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white p-4 rounded-lg shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow ${
        title === "Total Patients" ? "cursor-pointer hover:bg-blue-50" : ""
      }`}
    >
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}