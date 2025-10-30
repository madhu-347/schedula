"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React, { useEffect, useState } from "react";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("appointments");
    const userString = localStorage.getItem("user");

    if (!stored || !userString) return;

    const appointments = JSON.parse(stored);
    const user = JSON.parse(userString);

    const doctorAppointments = appointments.filter(
      (apt: any) =>
        apt.doctorName &&
        user?.name &&
        apt.doctorName.toLowerCase() === user.name.toLowerCase()
    );

    const statusColors: Record<string, string> = {
      Upcoming: "#0ea5e9", // blue
      Completed: "#10b981", // green
      Cancelled: "#ef4444", // red
    };

    const mapped = doctorAppointments.map((apt: any) => {
      const parsed = new Date(apt.date);

      return {
        title: apt.patientDetails?.fullName || "Appointment",
        start: parsed.toISOString().split("T")[0],
        backgroundColor: statusColors[apt.status] || "#6366f1",
        borderColor: statusColors[apt.status] || "#6366f1",
        textColor: "#ffffff",
        extendedProps: {
          status: apt.status,
          token: apt.tokenNo,
          time: apt.timeSlot,
        },
      };
    });

    setEvents(mapped);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">My Calendar</h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="80vh"
        events={events}
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
          const tooltip = document.querySelector(`.fc-tooltip`);
          if (tooltip) tooltip.remove();
        }}
      />
    </div>
  );
}
