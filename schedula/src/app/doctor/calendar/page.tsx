"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  EventClickArg,
  EventDropArg,
  EventApi,
  EventInput,
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";

import {
  X,
  User,
  Clock,
  Calendar as CalendarIcon,
  Info,
  MapPin,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  getAppointmentsByDoctor,
  updateAppointment,
} from "@/app/services/appointments.api";
import { useAuth } from "@/context/AuthContext";
import { Appointment } from "@/lib/types/appointment";
import { getDoctorById } from "@/app/services/doctor.api";

/* --- Strong types --- */
interface DoctorAvailability {
  availableDays?: string[];
  availableTime?: {
    morning?: { from?: string; to?: string };
    evening?: { from?: string; to?: string };
  };
}

interface ExtendedEventProps {
  status?: string;
  token?: string;
  time?: string;
  type?: string;
  visitType?: string;
  name?: string;
  age?: number | string;
  gender?: string;
  phone?: string;
  problem?: string;
}

/* --- Component --- */
export default function CalendarPage() {
  const { doctor } = useAuth();
   const router = useRouter();
  
  const doctorId = doctor?.id as string | undefined;

  // FullCalendar wants EventInput[] as events
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [doctorAvailability, setDoctorAvailability] =
    useState<DoctorAvailability | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const calendarRef = useRef<FullCalendar | null>(null);

  const dateParam = searchParams?.get("date");
  const selectedDate = dateParam ? new Date(dateParam) : new Date();

  useEffect(() => {
    if (calendarRef.current && selectedDate) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(selectedDate); // 👈 jump to selected date
      calendarApi.changeView("timeGridDay"); // 👈 ensure daily view
    }
  }, [selectedDate]);

  const statusColors: Record<string, string> = {
    Upcoming: "#0ea5e9",
    Waiting: "#f59e0b",
    Completed: "#10b981",
    Cancelled: "#ef4444",
  };

  /* removeTooltip must exist before useEffect cleanup calls it */
  const removeTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.remove();
      tooltipRef.current = null;
    }
  };

  // Parse time range like "05:30 AM - 06:00 AM"
  function parseTimeRange(dateStr: string, timeRange?: string) {
    const base = new Date(dateStr + "T00:00:00");

    if (!timeRange) {
      const start = new Date(base);
      start.setHours(9, 0, 0, 0);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      return { start, end };
    }

    try {
      const parts = timeRange.split("-").map((s) => s.trim());
      const [startTimeStr, startPeriod] = parts[0].split(" ");
      const [startHours, startMinutes] = startTimeStr.split(":").map(Number);
      let startHour = startHours;
      if (startPeriod?.toLowerCase() === "pm" && startHour < 12)
        startHour += 12;
      if (startPeriod?.toLowerCase() === "am" && startHour === 12)
        startHour = 0;
      const start = new Date(base);
      start.setHours(startHour, startMinutes || 0, 0, 0);

      let end: Date;
      if (parts.length > 1) {
        const [endTimeStr, endPeriod] = parts[1].split(" ");
        const [endHours, endMinutes] = endTimeStr.split(":").map(Number);
        let endHour = endHours;
        if (endPeriod?.toLowerCase() === "pm" && endHour < 12) endHour += 12;
        if (endPeriod?.toLowerCase() === "am" && endHour === 12) endHour = 0;
        end = new Date(base);
        end.setHours(endHour, endMinutes || 0, 0, 0);
      } else {
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

  function fmtTime(d: Date): string {
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function toISODate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function getDayName(d: Date): string {
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }

  function buildCalendarEvents(appointments: Appointment[]): EventInput[] {
    const relevantAppointments = appointments.filter(
      (apt) => apt.status !== "Completed" && apt.status !== "Cancelled"
    );

    return relevantAppointments.map((apt) => {
      const { start, end } = parseTimeRange(apt.date, apt.time);
      const ext: ExtendedEventProps = {
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
      };

      const color = statusColors[apt.status] || "#6366f1";

      const ev: EventInput = {
        id: String(apt.id),
        title: apt.patientDetails?.fullName || "Appointment",
        start,
        end,
        allDay: false,
        color,
        backgroundColor: color,
        borderColor: color,
        textColor: "#ffffff",
        extendedProps: ext,
      };

      return ev;
    });
  }

  function generateAvailabilityEvents(): EventInput[] {
    if (!doctorAvailability) return [];
    const out: EventInput[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const isoDate = toISODate(date);
      const isAvailableDay =
        !doctorAvailability.availableDays ||
        doctorAvailability.availableDays.length === 0 ||
        doctorAvailability.availableDays.includes(dayName);

      if (isAvailableDay) {
        const morningFrom = doctorAvailability.availableTime?.morning?.from;
        const morningTo = doctorAvailability.availableTime?.morning?.to;
        if (morningFrom && morningTo) {
          const start = new Date(`${isoDate}T${morningFrom}:00`);
          const end = new Date(`${isoDate}T${morningTo}:00`);
          out.push({
            start,
            end,
            display: "background",
            backgroundColor: "rgba(236, 254, 255, 0.5)",
            borderColor: "rgba(236, 254, 255, 0.5)",
          });
        }

        const eveningFrom = doctorAvailability.availableTime?.evening?.from;
        const eveningTo = doctorAvailability.availableTime?.evening?.to;
        if (eveningFrom && eveningTo) {
          const start = new Date(`${isoDate}T${eveningFrom}:00`);
          const end = new Date(`${isoDate}T${eveningTo}:00`);
          out.push({
            start,
            end,
            display: "background",
            backgroundColor: "rgba(236, 254, 255, 0.5)",
            borderColor: "rgba(236, 254, 255, 0.5)",
          });
        }
      }
    }
    return out;
  }

  // Load doctor data safely
  useEffect(() => {
    let isMounted = true;
    const loadDoctorData = async () => {
      if (!doctorId) return;
      try {
        const doctorData = await getDoctorById(doctorId);
        if (isMounted) {
          setDoctorAvailability(doctorData?.doctor || doctorData?.data || null);
        }
      } catch (error) {
        console.error("Error loading doctor data:", error);
      }
    };
    setTimeout(loadDoctorData, 0);
    return () => {
      isMounted = false;
    };
  }, [doctorId]);

  // Safe async loading of appointments
  useEffect(() => {
    let isMounted = true;

    const loadAppointments = async () => {
      if (!doctorId) return;
      try {
        const appointments = await getAppointmentsByDoctor(doctorId);
        if (isMounted) {
          const calendarEvents = buildCalendarEvents(appointments);
          setEvents(calendarEvents);
        }
      } catch (error) {
        console.error("Error loading appointments:", error);
        if (isMounted) setEvents([]);
      }
    };

    setTimeout(loadAppointments, 0);
    const intervalId = setInterval(loadAppointments, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      removeTooltip();
    };
  }, [doctorId]);

  const handleEventClick = (info: EventClickArg) => {
    setSelectedEvent(info.event);
    setShowModal(true);
  };

  const updateAppointmentStatus = async (status: "Completed" | "Cancelled") => {
    if (!selectedEvent) return;
    try {
      await updateAppointment(selectedEvent.id, { status });
      setShowModal(false);
      // reload
      if (doctorId) {
        const appointments = await getAppointmentsByDoctor(doctorId);
        setEvents(buildCalendarEvents(appointments));
      }
    } catch (error) {
      console.error("Failed to update appointment:", error);
      alert("Failed to update appointment");
    }
  };

  const handleEventDrop = async (info: EventDropArg) => {
    try {
      const id = info.event.id;
      const newStart = info.event.start!;
      const newEnd =
        info.event.end || new Date(newStart.getTime() + 30 * 60 * 1000);
      const newDate = toISODate(newStart);
      const newDay = getDayName(newStart);
      const newTime = `${fmtTime(newStart)} - ${fmtTime(newEnd)}`;

      await updateAppointment(id, {
        date: newDate,
        day: newDay,
        time: newTime,
      });
      if (doctorId) {
        const appointments = await getAppointmentsByDoctor(doctorId);
        setEvents(buildCalendarEvents(appointments));
      }
    } catch (e) {
      console.error("Error rescheduling:", e);
      info.revert();
      alert("Failed to reschedule appointment");
    }
  };

  const handleEventResize = async (info: EventResizeDoneArg) => {
    try {
      const id = info.event.id;
      const newStart = info.event.start!;
      const newEnd =
        info.event.end || new Date(newStart.getTime() + 30 * 60 * 1000);
      const newTime = `${fmtTime(newStart)} - ${fmtTime(newEnd)}`;

      await updateAppointment(id, { time: newTime });
      if (doctorId) {
        const appointments = await getAppointmentsByDoctor(doctorId);
        setEvents(buildCalendarEvents(appointments));
      }
    } catch (e) {
      console.error("Error resizing:", e);
      info.revert();
      alert("Failed to update appointment time");
    }
  };

  const availabilityEvents = generateAvailabilityEvents();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      {/* Calendar */}
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex">
             <button
                         onClick={() => router.back()}
                         className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                         title="Go back"
                     >
                         <ArrowLeft className="w-5 h-5 text-gray-600" />
                     </button>
              <h2 className="text-2xl font-bold text-gray-800">My Calendar</h2>
            </div>
            
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
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          height="80vh"
          events={[...events, ...availabilityEvents]}
          eventClick={handleEventClick}
          editable
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
        />
      </div>

      {/* Modal */}
      {showModal && selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-cyan-600 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {selectedEvent.title}
                </h3>
                <p className="text-cyan-100 text-sm">
                  Token #
                  {(selectedEvent.extendedProps as ExtendedEventProps).token}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-cyan-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-cyan-500" />
                  <p className="font-semibold text-gray-800">
                    {selectedEvent.start
                      ? selectedEvent.start.toLocaleDateString()
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-cyan-500" />
                  <p className="font-semibold text-gray-800">
                    {(selectedEvent.extendedProps as ExtendedEventProps).time ??
                      ""}
                  </p>
                </div>
              </div>

              <div className="bg-cyan-50 p-4 rounded-lg">
                <p className="font-bold text-gray-800 mb-2">Patient Info</p>
                <p>
                  Name:{" "}
                  {(selectedEvent.extendedProps as ExtendedEventProps).name}
                </p>
                <p>
                  Age: {(selectedEvent.extendedProps as ExtendedEventProps).age}
                </p>
                <p>
                  Gender:{" "}
                  {(selectedEvent.extendedProps as ExtendedEventProps).gender}
                </p>
                <p>
                  Phone:{" "}
                  {(selectedEvent.extendedProps as ExtendedEventProps).phone}
                </p>
              </div>

              <div className="space-y-2">
                {((selectedEvent.extendedProps as ExtendedEventProps).status ===
                  "Upcoming" ||
                  (selectedEvent.extendedProps as ExtendedEventProps).status ===
                    "Waiting") && (
                  <>
                    <Button
                      variant="default"
                      className="w-full bg-green-500 hover:bg-green-600"
                      onClick={() => updateAppointmentStatus("Completed")}
                    >
                      ✓ Mark as Completed
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => updateAppointmentStatus("Cancelled")}
                    >
                      ✕ Cancel Appointment
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  className="w-full"
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
