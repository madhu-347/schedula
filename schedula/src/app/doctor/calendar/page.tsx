"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React, { useEffect, useState, useRef } from "react";
import {
  X,
  User,
  Clock,
  Calendar as CalendarIcon,
  Info,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  getAppointmentsByDoctor,
  updateAppointment,
} from "@/app/services/appointments.api";
import { useAuth } from "@/context/AuthContext";
import { Appointment } from "@/lib/types/appointment";
import { getDoctorById } from "@/app/services/doctor.api";

export default function CalendarPage() {
  const { doctor } = useAuth();
  const doctorId = doctor?.id as string;
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [doctorAvailability, setDoctorAvailability] = useState<any>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const statusColors: Record<string, string> = {
    Upcoming: "#0ea5e9", // blue
    Waiting: "#f59e0b", // amber
    Completed: "#10b981", // green
    Cancelled: "#ef4444", // red
  };

  // Load doctor data to get availability
  useEffect(() => {
    const loadDoctorData = async () => {
      if (doctorId) {
        try {
          const doctorData = await getDoctorById(doctorId);
          setDoctorAvailability(doctorData?.doctor || doctorData?.data);
        } catch (error) {
          console.error("Error loading doctor data:", error);
        }
      }
    };

    loadDoctorData();
  }, [doctorId]);

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setShowModal(true);
  };

  // Parse time range like "05:30 AM - 06:00 AM" and create start/end dates
  function parseTimeRange(dateStr: string, timeRange?: string) {
    const base = new Date(dateStr + "T00:00:00");

    if (!timeRange) {
      const start = new Date(base);
      start.setHours(9, 0, 0, 0);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      return { start, end };
    }

    try {
      // Handle "05:30 AM - 06:00 AM" format
      const parts = timeRange.split("-").map((s) => s.trim());

      // Parse start time
      const [startTimeStr, startPeriod] = parts[0].split(" ");
      const [startHours, startMinutes] = startTimeStr.split(":").map(Number);

      let startHour = startHours;
      if (startPeriod && startPeriod.toLowerCase() === "pm" && startHour < 12) {
        startHour += 12;
      }
      if (
        startPeriod &&
        startPeriod.toLowerCase() === "am" &&
        startHour === 12
      ) {
        startHour = 0;
      }

      const start = new Date(base);
      start.setHours(startHour, startMinutes || 0, 0, 0);

      // Parse end time if available
      let end: Date;
      if (parts.length > 1) {
        const [endTimeStr, endPeriod] = parts[1].split(" ");
        const [endHours, endMinutes] = endTimeStr.split(":").map(Number);

        let endHour = endHours;
        if (endPeriod && endPeriod.toLowerCase() === "pm" && endHour < 12) {
          endHour += 12;
        }
        if (endPeriod && endPeriod.toLowerCase() === "am" && endHour === 12) {
          endHour = 0;
        }

        end = new Date(base);
        end.setHours(endHour, endMinutes || 0, 0, 0);
      } else {
        // Default 30 min duration if no end time
        end = new Date(start.getTime() + 30 * 60 * 1000);
      }

      return { start, end };
    } catch (e) {
      console.error("Error parsing time:", e);
      const start = new Date(base);
      start.setHours(9, 0, 0, 0);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      return { start, end };
    }
  }

  // Format time to 12-hour format
  function fmtTime(d: Date): string {
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Convert date to ISO format (YYYY-MM-DD)
  function toISODate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Get day name from date
  function getDayName(d: Date): string {
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }

  // Build calendar events from appointments
  function buildCalendarEvents(appointments: Appointment[]) {
    // Filter out completed/cancelled appointments
    const relevantAppointments = appointments.filter(
      (apt: Appointment) =>
        apt.status !== "Completed" && apt.status !== "Cancelled"
    );

    return relevantAppointments.map((apt: Appointment) => {
      const { start, end } = parseTimeRange(apt.date, apt.time);

      return {
        id: String(apt.id),
        title: apt.patientDetails?.fullName || "Appointment",
        start,
        end,
        allDay: false,
        color: statusColors[apt.status] || "#6366f1",
        backgroundColor: statusColors[apt.status] || "#6366f1",
        borderColor: statusColors[apt.status] || "#6366f1",
        textColor: "#ffffff",
        extendedProps: {
          status: apt.status,
          token: apt.tokenNo,
          time: apt.time,
          type: apt.type,
          visitType: apt.visitType,
          name: apt.patientDetails?.fullName || "N/A",
          age: apt.patientDetails?.age || "N/A",
          gender: apt.patientDetails?.gender || "N/A",
          phone: apt.patientDetails?.phone || "N/A",
          problem: apt.patientDetails?.problem || "N/A",
        },
      };
    });
  }

  // Generate background events for doctor's available time slots
  const generateAvailabilityEvents = () => {
    if (!doctorAvailability) return [];

    const events = [];
    const today = new Date();

    // Generate events for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const isoDate = toISODate(date);

      // Check if doctor is available on this day
      const isAvailableDay =
        !doctorAvailability.availableDays ||
        doctorAvailability.availableDays.length === 0 ||
        doctorAvailability.availableDays.includes(dayName);

      if (isAvailableDay) {
        // Add morning availability
        if (
          doctorAvailability.availableTime?.morning?.from &&
          doctorAvailability.availableTime?.morning?.to
        ) {
          const start = new Date(
            `${isoDate}T${doctorAvailability.availableTime.morning.from}:00`
          );
          const end = new Date(
            `${isoDate}T${doctorAvailability.availableTime.morning.to}:00`
          );

          events.push({
            start,
            end,
            display: "background",
            backgroundColor: "rgba(236, 254, 255, 0.5)", // Light cyan background
            borderColor: "rgba(236, 254, 255, 0.5)",
          });
        }

        // Add evening availability
        if (
          doctorAvailability.availableTime?.evening?.from &&
          doctorAvailability.availableTime?.evening?.to
        ) {
          const start = new Date(
            `${isoDate}T${doctorAvailability.availableTime.evening.from}:00`
          );
          const end = new Date(
            `${isoDate}T${doctorAvailability.availableTime.evening.to}:00`
          );

          events.push({
            start,
            end,
            display: "background",
            backgroundColor: "rgba(236, 254, 255, 0.5)", // Light cyan background
            borderColor: "rgba(236, 254, 255, 0.5)",
          });
        }
      }
    }

    return events;
  };

  // Load appointments from API
  const loadAppointments = async () => {
    try {
      const appointments = await getAppointmentsByDoctor(doctorId);
      const calendarEvents = buildCalendarEvents(appointments);
      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setEvents([]);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (status: "Completed" | "Cancelled") => {
    if (!selectedEvent) return;

    try {
      await updateAppointment(selectedEvent.id, { status });
      setShowModal(false);
      loadAppointments(); // Reload events
    } catch (error) {
      console.error("Failed to update appointment:", error);
      alert("Failed to update appointment");
    }
  };

  // Handle event drag (reschedule) - Update date, day, and time
  const handleEventDrop = async (info: any) => {
    try {
      const id = info.event.id;
      const newStart = info.event.start!;
      const newEnd =
        info.event.end || new Date(newStart.getTime() + 30 * 60 * 1000);

      // Get the new date in ISO format
      const newDate = toISODate(newStart);

      // Get the new day name
      const newDay = getDayName(newStart);

      // Format the new time range
      const newTime = `${fmtTime(newStart)} - ${fmtTime(newEnd)}`;

      console.log("Updating appointment:", {
        date: newDate,
        day: newDay,
        time: newTime,
      });

      // Update the appointment
      const updatedAppointment = await updateAppointment(id, {
        date: newDate,
        day: newDay,
        time: newTime,
      });

      // Send notification to patient about rescheduling
      if (updatedAppointment) {
        try {
          await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              doctorName: `${doctor?.firstName} ${doctor?.lastName}`,
              message: `Your appointment has been rescheduled to ${newDay}, ${newDate} at ${newTime}.`,
            }),
          });
        } catch (err) {
          console.error("Failed to send notification:", err);
        }
      }

      loadAppointments(); // Reload events
    } catch (e) {
      console.error("Error rescheduling:", e);
      info.revert();
      alert("Failed to reschedule appointment");
    }
  };

  // Handle event resize (change duration) - Update time range
  const handleEventResize = async (info: any) => {
    try {
      const id = info.event.id;
      const newStart = info.event.start!;
      const newEnd =
        info.event.end || new Date(newStart.getTime() + 30 * 60 * 1000);

      const newTime = `${fmtTime(newStart)} - ${fmtTime(newEnd)}`;

      console.log("Updating time:", newTime);

      // Update the appointment
      const updatedAppointment = await updateAppointment(id, {
        time: newTime,
      });

      // Send notification to patient about time change
      if (updatedAppointment) {
        try {
          await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              doctorName: `${doctor?.firstName} ${doctor?.lastName}`,
              message: `Your appointment time has been updated to ${newTime}.`,
            }),
          });
        } catch (err) {
          console.error("Failed to send notification:", err);
        }
      }

      loadAppointments(); // Reload events
    } catch (e) {
      console.error("Error resizing:", e);
      info.revert();
      alert("Failed to update appointment time");
    }
  };

  // Remove tooltip when mouse leaves
  const removeTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.remove();
      tooltipRef.current = null;
    }
  };

  // Initial load and auto-refresh
  useEffect(() => {
    loadAppointments();

    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      loadAppointments();
    }, 30000);

    return () => {
      clearInterval(intervalId);
      removeTooltip();
    };
  }, [doctorId]);

  // Generate availability events when doctor availability changes
  const availabilityEvents = generateAvailabilityEvents();

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      {/* Styles for calendar customization */}
      <style>
        {`
          .fc-tooltip {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            color: #1f2937;
            padding: 16px;
            border-radius: 12px;
            font-size: 0.875rem;
            z-index: 1000;
            position: fixed;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.08);
            border: 1px solid #e5e7eb;
            max-width: 280px;
            min-width: 240px;
            pointer-events: none;
            transition: opacity 0.2s ease;
          }
          .fc-tooltip::before {
            content: '';
            position: absolute;
            top: -6px;
            left: 20px;
            width: 12px;
            height: 12px;
            background: white;
            border-left: 1px solid #e5e7eb;
            border-top: 1px solid #e5e7eb;
            transform: rotate(45deg);
          }
          .fc-tooltip strong {
            color: #0ea5e9;
            font-weight: 600;
            font-size: 0.95rem;
            display: block;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e0f2fe;
          }
          .fc-tooltip-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 6px 0;
            color: #4b5563;
          }
          .fc-tooltip-icon {
            color: #06b6d4;
            flex-shrink: 0;
          }
          .fc-tooltip-label {
            font-weight: 500;
            color: #6b7280;
          }
          .fc-tooltip-value {
            color: #1f2937;
            font-weight: 500;
          }
          .fc .fc-button {
            background-color: #f0f9ff;
            border: 1px solid #a5f3fc;
            color: #0891b2;
            font-weight: 600;
            text-transform: capitalize;
            box-shadow: none;
            transition: all 0.2s ease;
            border-radius: 8px;
            padding: 8px 16px;
          }
          .fc .fc-button:hover,
          .fc .fc-button:focus {
            background-color: #ecfeff;
            border-color: #67e8f9;
            box-shadow: 0 2px 8px rgba(6, 182, 212, 0.2);
            transform: translateY(-1px);
          }
          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active {
            background-color: #06b6d4;
            border-color: #06b6d4;
            color: white;
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
          }
          .fc .fc-day-today {
            background-color: #ecfeff !important;
          }
          .fc-event {
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .fc-event:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .fc-timegrid-event {
            border-radius: 4px;
            padding: 2px 4px;
          }
          .fc-timegrid-slot {
            height: 3em;
          }
        `}
      </style>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Calendar</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your appointments - Drag to reschedule
            </p>
          </div>
          {doctor?.firstName && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="font-semibold text-cyan-600">
                Dr. {doctor.firstName} {doctor.lastName}
              </p>
            </div>
          )}
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          height="80vh"
          events={[...events, ...availabilityEvents]}
          eventClick={handleEventClick}
          eventDisplay="block"
          displayEventTime={true}
          editable={true}
          droppable={false}
          eventDurationEditable={true}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          slotMinTime={
            doctorAvailability?.availableTime?.morning?.from || "06:00:00"
          }
          slotMaxTime={
            doctorAvailability?.availableTime?.evening?.to || "22:00:00"
          }
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
          }}
          eventContent={(info) => {
            // Don't show content for background events
            if (info.event.display === "background") {
              return { html: "" };
            }

            const isList = info.view.type === "dayGridMonth";
            if (isList) {
              return {
                html: `
                  <div style="width:100%; text-align:center; font-weight:600; font-size:11px; line-height:1.2; display:flex; align-items:center; justify-content:center; padding:2px 4px; border-radius:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    ${info.event.title}
                  </div>
                `,
              };
            }
            return {
              html: `
                <div style="padding:4px 6px; height:100%; display:flex; flex-direction:column; overflow:hidden;">
                  <div style="font-weight:600; font-size:12px; margin-bottom:2px;">${info.timeText}</div>
                  <div style="font-size:11px; font-weight:500; line-height:1.3;">${info.event.title}</div>
                </div>
              `,
            };
          }}
          eventMouseEnter={(info) => {
            // Don't show tooltip for background events
            if (info.event.display === "background") return;

            removeTooltip();

            const { event, jsEvent } = info;
            const tooltip = document.createElement("div");
            tooltip.className = "fc-tooltip";
            tooltip.innerHTML = `
              <strong>${event.title}</strong>
              <div class="fc-tooltip-row">
                <svg class="fc-tooltip-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke-width="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke-width="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke-width="2"/>
                </svg>
                <span class="fc-tooltip-value">${event.start?.toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}</span>
              </div>
              <div class="fc-tooltip-row">
                <svg class="fc-tooltip-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke-width="2"/>
                  <polyline points="12 6 12 12 16 14" stroke-width="2"/>
                </svg>
                <span class="fc-tooltip-value">${
                  event.extendedProps.time ?? "Not set"
                }</span>
              </div>
              <div class="fc-tooltip-row">
                <svg class="fc-tooltip-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke-width="2"/>
                  <line x1="12" y1="16" x2="12" y2="12" stroke-width="2"/>
                  <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2"/>
                </svg>
                <span class="fc-tooltip-label">Status:</span>
                <span class="fc-tooltip-value" style="color: ${
                  statusColors[event.extendedProps.status] || "#6366f1"
                }">${event.extendedProps.status}</span>
              </div>
              ${
                event.extendedProps.visitType
                  ? `
                <div class="fc-tooltip-row">
                  <svg class="fc-tooltip-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11l3 3L22 4" stroke-width="2"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke-width="2"/>
                  </svg>
                  <span class="fc-tooltip-value">${event.extendedProps.visitType} Visit</span>
                </div>
              `
                  : ""
              }
            `;
            document.body.appendChild(tooltip);
            tooltipRef.current = tooltip;

            const rect = (
              jsEvent.target as HTMLElement
            ).getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 - 120 + "px";
            tooltip.style.top = rect.bottom + 10 + "px";
          }}
          eventMouseLeave={() => {
            removeTooltip();
          }}
        />
      </div>

      {/* Appointment Details Modal */}
      {showModal && selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-linear-to-r from-cyan-500 to-cyan-600 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    {selectedEvent.title}
                  </h3>
                  <div className="flex items-center gap-3 text-cyan-100 text-sm">
                    <span>Token #{selectedEvent.extendedProps.token}</span>
                    {selectedEvent.extendedProps.visitType && (
                      <>
                        <span>•</span>
                        <span>
                          {selectedEvent.extendedProps.visitType} Visit
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full text-cyan-100 hover:bg-cyan-600 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Appointment Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-cyan-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Date</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {selectedEvent.start.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-cyan-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Time</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {selectedEvent.extendedProps.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Info className="w-5 h-5 text-cyan-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Status</p>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color:
                          statusColors[selectedEvent.extendedProps.status] ||
                          "#6366f1",
                      }}
                    >
                      {selectedEvent.extendedProps.status}
                    </p>
                  </div>
                </div>

                {selectedEvent.extendedProps.type && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-cyan-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Type</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedEvent.extendedProps.type}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Patient Details */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-xl border border-cyan-100">
                <p className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={18} className="text-cyan-600" /> Patient
                  Information
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      Name
                    </p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.extendedProps.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      Age
                    </p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.extendedProps.age}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      Gender
                    </p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.extendedProps.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      Phone
                    </p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.extendedProps.phone}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      Problem
                    </p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.extendedProps.problem}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {(selectedEvent.extendedProps.status === "Upcoming" ||
                  selectedEvent.extendedProps.status === "Waiting") && (
                  <>
                    <Button
                      variant="default"
                      className="w-full bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30"
                      onClick={() => updateAppointmentStatus("Completed")}
                    >
                      ✓ Mark as Completed
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full shadow-lg shadow-red-500/30"
                      onClick={() => updateAppointmentStatus("Cancelled")}
                    >
                      ✕ Cancel Appointment
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  className="w-full border-2 hover:bg-gray-50"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
