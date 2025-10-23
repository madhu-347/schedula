//Header should display appointment scheduled if scheduled successfully / or unable to book
// doctor card with name, specialty - location, qualification
// appointment card wih appt number, status, reporting time and add to calendar button
// add patient details text
// button to add patient details
// view my appointments button at the bottom

"use client";
import { AppointmentDetailsCard } from "@/components/cards/AppointmentDetails";
import { DoctorInfoCard } from "@/components/cards/DoctorReview";
import React from "react";

function AppointmentReview() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Appointment Review</h1>
      <DoctorInfoCard
        name="Dr. John Doe"
        specialty="Cardiology"
        location="New York, NY"
        qualification="MD, Cardiology"
      />
      <AppointmentDetailsCard
        appointmentNumber="123456"
        status="Active"
        reportingTime="2023-10-10 10:00 AM"
      />
    </div>
  );
}

export default AppointmentReview;
