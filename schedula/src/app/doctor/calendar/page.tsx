"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React, { useEffect, useState } from "react";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const statusColors: Record<string, string> = {
    Upcoming: "#0ea5e9",   // blue
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
    const [startStr, endStr] = timeSlot.split("-").map(s => s.trim());
    const start = new Date(`${dateStr} ${startStr}`);
    const end = endStr ? new Date(`${dateStr} ${endStr}`) : new Date(start.getTime() + 30 * 60 * 1000);
    return { start, end };
  }

  function fmtUS(d: Date) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); // e.g., "Nov 3, 2025"
  }

  function fmtTime(d: Date) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }); // "12:30 PM"
  }

  function rebuildEventsForDoctor(appointments: any[], doctorName: string) {

    const doctorAppointments = appointments.filter(
      (apt: any) =>
        apt?.doctorName &&
        doctorName &&
        apt.doctorName.toLowerCase() === doctorName.toLowerCase()
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
        },
      };
    });
  }

  // --- update status actions you already have ---
  const updateAppointmentStatus = (status: "Completed" | "Cancelled") => {
    if (!selectedEvent) return;
    const stored = JSON.parse(localStorage.getItem("appointments") || "[]");
    const updated = stored.map((apt: any) =>
      String(apt.id) === String(selectedEvent.id) ? { ...apt, status } : apt
    );
    localStorage.setItem("appointments", JSON.stringify(updated));
    setShowModal(false);
    // refresh events without reloading the page
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
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">My Calendar</h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="80vh"
        events={events}
        eventClick={handleEventClick}
        eventDisplay="block"
        displayEventTime={false}

        // --- enable drag & drop reschedule ---
        editable={true}
        droppable={false}
        eventDurationEditable={true}        

        // When an event is dropped or resized, persist it
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
                  date: newDateUS,
                  timeSlot: newTimeSlot,
                };
              });

              localStorage.setItem("appointments", JSON.stringify(updated));
               const color = statusColors[info.event.extendedProps.status] || "#6366f1";
                info.event.setProp("backgroundColor", color);
                info.event.setProp("borderColor", color);
                info.event.setProp("textColor", "#fff");
                info.event.setProp("color", color);
              
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
            <div style="
              width:100%;
              text-align:center;
              font-weight:600;
              font-size:12px;
              line-height:1.2;
              display:flex;align-items:center;justify-content:center;
              padding:2px 4px;
            ">
              ${info.event.title}
            </div>
          `,
        })}

        eventMouseEnter={(info) => {
          const { event, jsEvent } = info;
          const tooltip = document.createElement("div");
          tooltip.className = "fc-tooltip";
          tooltip.innerHTML = `
            <strong>${event.title}</strong><br/>
            Date: ${event.start?.toLocaleDateString()}<br/>
            Time: ${event.extendedProps.time ?? "-"}<br/>
            Status: ${event.extendedProps.status ?? "-"}<br/>
            Token: ${event.extendedProps.token ?? "-"}
          `;
          document.body.appendChild(tooltip);
          tooltip.style.left = jsEvent.pageX + 10 + "px";
          tooltip.style.top = jsEvent.pageY + 10 + "px";
        }}
       eventMouseLeave={() => {
        const tooltip = document.querySelector(".fc-tooltip") as HTMLDivElement | null;
        if (tooltip) {
          tooltip.remove(); // instantly remove
        }
}}
      />

      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[90%] max-w-md p-5 shadow-xl">
            <h3 className="text-lg font-bold mb-2 text-cyan-600">
              {selectedEvent.title}
            </h3>

            <p className="text-gray-700 text-sm mb-1">
              <strong>Date:</strong> {selectedEvent.start.toLocaleDateString()}
            </p>
            <p className="text-gray-700 text-sm mb-1">
              <strong>Time:</strong> {selectedEvent.extendedProps.time}
            </p>
            <p className="text-gray-700 text-sm mb-3">
              <strong>Status:</strong>{" "}
              <span className="font-medium">{selectedEvent.extendedProps.status}</span>
            </p>

            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="font-semibold text-gray-700 mb-1">Patient Details</p>
              <p className="text-sm text-gray-600"><strong>Name:</strong> {selectedEvent.extendedProps.name}</p>
              <p className="text-sm text-gray-600"><strong>Age:</strong> {selectedEvent.extendedProps.age}</p>
              <p className="text-sm text-gray-600"><strong>Gender:</strong> {selectedEvent.extendedProps.gender}</p>
              <p className="text-sm text-gray-600"><strong>Phone:</strong> {selectedEvent.extendedProps.phone}</p>
            </div>

            <div className="space-y-2">
              {selectedEvent.extendedProps.status !== "Completed" && (
                <button
                  className="w-full bg-green-600 text-white py-2 rounded-md"
                  onClick={() => updateAppointmentStatus("Completed")}
                >
                  Mark as Completed
                </button>
              )}
              {selectedEvent.extendedProps.status !== "Cancelled" && (
                <button
                  className="w-full bg-red-600 text-white py-2 rounded-md"
                  onClick={() => updateAppointmentStatus("Cancelled")}
                >
                  Cancel Appointment
                </button>
              )}
              <button
                className="w-full bg-gray-300 py-2 rounded-md"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
