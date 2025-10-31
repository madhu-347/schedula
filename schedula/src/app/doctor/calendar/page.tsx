"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React, { useEffect, useState } from "react";
import { X, User, Clock, Calendar as CalendarIcon, Info } from "lucide-react"; // Import icons
import { Button } from "@/components/ui/Button"; // Import your Button component

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const statusColors: Record<string, string> = {
    Upcoming: "#0ea5e9", // blue
    Waiting: "#f59e0b", // amber
    Completed: "#10b981", // green
    Cancelled: "#ef4444", // red
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setShowModal(true);
  };


  // --- helpers ---
  function parseTimeRange(dateStr: string, timeSlot?: string) {
    const base = new Date(dateStr);
    if (!timeSlot) {
      const start = new Date(base);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      return { start, end };
    }
    // Handle "10:00 AM" format
    try {
        const [time, period] = timeSlot.split(" ");
        const [hours, minutes] = time.split(":").map(Number);
        let startHour = hours;
        if (period && period.toLowerCase() === 'pm' && startHour < 12) startHour += 12;
        if (period && period.toLowerCase() === 'am' && startHour === 12) startHour = 0;
        const start = new Date(base.setHours(startHour, minutes, 0, 0));
        const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min duration
        return { start, end };
    } catch (e) {
        // Fallback for "10:00 AM - 11:00 AM"
        try {
            const [startStr, endStr] = timeSlot.split("-").map(s => s.trim());
            const start = new Date(`${dateStr} ${startStr}`);
            const end = endStr ? new Date(`${dateStr} ${endStr}`) : new Date(start.getTime() + 30 * 60 * 1000);
            return { start, end };
        } catch (e2) {
             const start = new Date(base);
             const end = new Date(start.getTime() + 30 * 60 * 1000);
             return { start, end };
        }
    }
  }

  function fmtUS(d: Date) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function fmtTime(d: Date) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  }

  // --- MODIFIED rebuildEventsForDoctor ---
  function rebuildEventsForDoctor(appointments: any[], doctorName: string) {
    // 1. Filter for the doctor
    const doctorAppointments = appointments.filter(
      (apt: any) =>
        apt?.doctorName &&
        doctorName &&
        apt.doctorName.toLowerCase() === doctorName.toLowerCase() &&
        // --- FIX 2: Only show appointments that are NOT completed or cancelled ---
        apt.status !== "Completed" && apt.status !== "Cancelled"
    );

    return doctorAppointments.map((apt: any) => {
      const parsedDate = new Date(apt.date);
      const yyyy = parsedDate.getFullYear();
      const mm = String(parsedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(parsedDate.getDate()).padStart(2, "0");
      const dateOnlyISO = `${yyyy}-${mm}-${dd}`;

      const { start, end } = parseTimeRange(dateOnlyISO, apt.timeSlot);

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
          time: apt.timeSlot,
          name: apt.patientDetails?.fullName || "N/A",
          age: apt.patientDetails?.age || "N/A",
          gender: apt.patientDetails?.gender || "N/A",
          phone: apt.patientDetails?.phone || "N/A",
          // --- FIX 1: Pass the problem field ---
          problem: apt.patientDetails?.problem || "N/A", 
        },
      };
    });
  }
  // --- END MODIFIED FUNCTION ---

  // --- update status actions ---
  const updateAppointmentStatus = (status: "Completed" | "Cancelled") => {
    if (!selectedEvent) return;
    const stored = JSON.parse(localStorage.getItem("appointments") || "[]");
    const updated = stored.map((apt: any) =>
      String(apt.id) === String(selectedEvent.id) ? { ...apt, status } : apt
    );
    localStorage.setItem("appointments", JSON.stringify(updated));
    setShowModal(false);
    
    // Refresh events: This will re-run rebuildEventsForDoctor
    // which will now filter out the event you just changed.
    const user = JSON.parse(localStorage.getItem("user") || "null");
    setEvents(rebuildEventsForDoctor(updated, user?.name));
  };

  useEffect(() => {
    const stored = localStorage.getItem("appointments");
    const userString = localStorage.getItem("user");
    if (!stored || !userString) return;

    const appointments = JSON.parse(stored);
    const user = JSON.parse(userString);
    setEvents(rebuildEventsForDoctor(appointments, user?.name));
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* --- STYLES FOR TOOLTIP AND CALENDAR (Theme applied) --- */}
      <style>
        {`
          .fc-tooltip {
            background: #ffffff;
            color: #1f2937;
            padding: 12px;
            border-radius: 8px;
            font-size: 0.875rem;
            z-index: 100;
            position: absolute;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid #e5e7eb;
            max-width: 250px;
          }
          .fc-tooltip strong {
            color: #0ea5e9;
            font-weight: 600;
            display: block;
            margin-bottom: 4px;
          }
          /* Custom Button Styles */
          .fc .fc-button {
              background-color: #f0f9ff; border: 1px solid #a5f3fc; color: #0891b2;
              font-weight: 600; text-transform: capitalize; box-shadow: none; transition: all 0.2s ease;
          }
          .fc .fc-button:hover, .fc .fc-button:focus {
              background-color: #ecfeff; border-color: #67e8f9; box-shadow: none;
          }
          .fc .fc-button-primary:not(:disabled).fc-button-active, 
          .fc .fc-button-primary:not(:disabled):active {
              background-color: #06b6d4; border-color: #06b6d4; color: white;
          }
          .fc .fc-day-today { background-color: #ecfeff !important; }
        `}
      </style>
      {/* --- END STYLES --- */}

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">My Calendar</h2>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="80vh"
          events={events}
          eventClick={handleEventClick}
          eventDisplay="block"
          displayEventTime={false}
          editable={true}
          droppable={false}
          eventDurationEditable={true}
          
          eventDrop={(info) => {
              try {
                const id = String(info.event.id);
                const newStart = info.event.start!;
                const newEnd = info.event.end || new Date(newStart.getTime() + 30*60*1000);
                const stored = JSON.parse(localStorage.getItem("appointments") || "[]");
                const updated = stored.map((apt: any) => {
                  if (String(apt.id) !== id) return apt;
                  const newDateUS = fmtUS(newStart);
                  const newTimeSlot = `${fmtTime(newStart)} - ${fmtTime(newEnd)}`;
                  return {
                    ...apt,
                    date: newDateUS, // Note: Your parseTimeRange uses ISO. Make sure this format is consistent
                    timeSlot: newTimeSlot,
                  };
                });
                localStorage.setItem("appointments", JSON.stringify(updated));
                const user = JSON.parse(localStorage.getItem("user") || "null");
                setEvents(rebuildEventsForDoctor(updated, user?.name));
              } catch (e) {
                info.revert();
              }
          }}

          eventResize={(info) => {
              try {
                const id = String(info.event.id);
                const newStart = info.event.start!;
                const newEnd = info.event.end || new Date(newStart.getTime() + 30*60*1000);
                const stored = JSON.parse(localStorage.getItem("appointments") || "[]");
                const updated = stored.map((apt: any) => {
                  if (String(apt.id) !== id) return apt;
                  const newTimeSlot = `${fmtTime(newStart)} - ${fmtTime(newEnd)}`;
                  return { ...apt, timeSlot: newTimeSlot };
                });
                localStorage.setItem("appointments", JSON.stringify(updated));
                const user = JSON.parse(localStorage.getItem("user") || "null");
                setEvents(rebuildEventsForDoctor(updated, user?.name));
              } catch (e) {
                info.revert();
              }
          }}

          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{ today: "Today", month: "Month", week: "Week", day: "Day" }}

          eventContent={(info) => ({
            html: `
              <div style="width:100%; text-align:center; font-weight:600; font-size:12px; line-height:1.2; display:flex; align-items:center; justify-content:center; padding:2px 4px;">
                ${info.event.title}
              </div>
            `,
          })}

          eventMouseEnter={(info) => {
            const { event, jsEvent } = info;
            const tooltip = document.createElement("div");
            tooltip.className = "fc-tooltip";
            tooltip.id = `fc-tooltip-${event.id}`;
            tooltip.innerHTML = `
              <strong>${event.title}</strong>
              Date: ${event.start?.toLocaleDateString()}<br/>
              Time: ${event.extendedProps.time ?? "-"}<br/>
              Status: ${event.extendedProps.status ?? "-"}
            `;
            document.body.appendChild(tooltip);
            tooltip.style.left = jsEvent.pageX + 10 + "px";
            tooltip.style.top = jsEvent.pageY + 10 + "px";
          }}
         eventMouseLeave={(info) => {
           const tooltip = document.getElementById(`fc-tooltip-${info.event.id}`);
           if (tooltip) {
             tooltip.remove();
           }
         }}
        />
      </div>

      {/* --- RESTYLED MODAL --- */}
      {showModal && selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)} // Close on overlay click
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
            {/* Modal Header */}
            <div className="p-4 bg-cyan-500 text-white flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedEvent.title}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-full text-cyan-100 hover:bg-cyan-600">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Appointment Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700"><strong>Date:</strong> {selectedEvent.start.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700"><strong>Time:</strong> {selectedEvent.extendedProps.time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    <strong>Status:</strong> <span className="font-semibold" style={{ color: statusColors[selectedEvent.extendedProps.status] || '#6366f1' }}>
                      {selectedEvent.extendedProps.status}
                    </span>
                  </span>
                </div>
              </div>

              {/* Patient Details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><User size={16} /> Patient Details</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {/* --- FIX: Read from extendedProps --- */}
                  <p className="text-gray-600"><strong>Name:</strong> {selectedEvent.extendedProps.name}</p>
                  <p className="text-gray-600"><strong>Age:</strong> {selectedEvent.extendedProps.age}</p>
                  <p className="text-gray-600"><strong>Gender:</strong> {selectedEvent.extendedProps.gender}</p>
                  <p className="text-gray-600"><strong>Phone:</strong> {selectedEvent.extendedProps.phone}</p>
                  <p className="text-gray-600 col-span-2"><strong>Problem:</strong> {selectedEvent.extendedProps.problem}</p>
                  {/* --- END FIX --- */}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {/* Only show Mark as Completed if it's Upcoming or Waiting */}
                {(selectedEvent.extendedProps.status === "Upcoming" || selectedEvent.extendedProps.status === "Waiting") && (
                  <Button
                    variant="default"
                    className="w-full bg-green-500 hover:bg-green-600"
                    onClick={() => updateAppointmentStatus("Completed")}
                  >
                    Mark as Completed
                  </Button>
                )}
                {/* Only show Cancel if it's Upcoming or Waiting */}
                {(selectedEvent.extendedProps.status === "Upcoming" || selectedEvent.extendedProps.status === "Waiting") && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => updateAppointmentStatus("Cancelled")}
                  >
                    Cancel Appointment
                  </Button>
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
      {/* --- END RESTYLED MODAL --- */}

    </div>
  );
}