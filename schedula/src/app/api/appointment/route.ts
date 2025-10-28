// app/api/appointment/route.ts
// This handles /api/appointment (without ID parameter)

import { NextRequest, NextResponse } from "next/server";
import { Appointment } from "@/lib/types/appointment";

// In-memory storage (replace with actual database in production)
// This should be shared with the [id] route or use a separate data service
let appointments: Appointment[] = [];
let nextId = 1;

// Initialize with some mock data
if (appointments.length === 0) {
  appointments = [
    {
      id: 1,
      tokenNo: "A001",
      doctorName: "Dr. Kumar Das",
      doctorImage: "/female-doctor.png",
      specialty: "Cardiologist",
      qualification: "MBBS, MD (Internal Medicine)",
      day: "Monday",
      date: "2025-10-28",
      timeSlot: "8:20 PM",
      problem: "Stomach pain Feeling unwell and",
      status: "Waiting",
      type: "In-person",
      paymentStatus: "Not paid",
      queuePosition: 15,
      expectedTime: "8:20 PM",
      patientDetails: {
        fullName: "Sudharkar Murti",
        age: 28,
        gender: "Male",
        phone: "+91-9876543210",
        weight: 28,
        problem: "Stomach pain Feeling unwell and",
        relationship: "Self",
        location: "Dombivali",
      },
    },
    {
      id: 2,
      tokenNo: "A002",
      doctorName: "Dr. Priya Sharma",
      doctorImage: "/female-doctor.png",
      specialty: "Dermatologist",
      qualification: "MBBS, MD (Dermatology)",
      day: "Tuesday",
      date: "2025-10-29",
      timeSlot: "10:00 AM",
      status: "Upcoming",
      type: "Online",
      paymentStatus: "Paid",
      patientDetails: {
        fullName: "Anjali Rao",
        age: 32,
        gender: "Female",
        phone: "+91-9876543211",
        weight: 60,
        problem: "Skin rash",
        relationship: "Self",
        location: "Mumbai",
      },
    },
    {
      id: 3,
      tokenNo: "A003",
      doctorName: "Dr. Prakash Das",
      doctorImage: "/male-doctor1.png",
      specialty: "Sr. Psychologist",
      qualification: "MBBS, MD (Psychiatry)",
      day: "Wednesday",
      date: "2025-10-22",
      timeSlot: "02:00 PM",
      status: "Completed",
      type: "In-person",
      paymentStatus: "Paid",
      patientDetails: {
        fullName: "Priya Kumar",
        age: 45,
        gender: "Female",
        phone: "+91-9876543212",
        problem: "Anxiety issues",
        relationship: "Self",
        location: "Chennai",
      },
    },
  ];
  nextId = 4;
}

// GET - Fetch all appointments or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Optional filters
    const status = searchParams.get("status");
    const doctorName = searchParams.get("doctorName");
    const patientName = searchParams.get("patientName");
    const date = searchParams.get("date");
    const userId = searchParams.get("id"); // For filtering by user's appointments

    let filteredAppointments = [...appointments];

    // Apply filters
    if (status) {
      filteredAppointments = filteredAppointments.filter(
        (app) => app.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (doctorName) {
      filteredAppointments = filteredAppointments.filter((app) =>
        app.doctorName.toLowerCase().includes(doctorName.toLowerCase())
      );
    }

    if (patientName) {
      filteredAppointments = filteredAppointments.filter((app) =>
        app.patientDetails.fullName
          .toLowerCase()
          .includes(patientName.toLowerCase())
      );
    }

    if (date) {
      filteredAppointments = filteredAppointments.filter(
        (app) => app.date === date
      );
    }

    // Sort by date (most recent first)
    filteredAppointments.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return NextResponse.json(
      {
        success: true,
        count: filteredAppointments.length,
        data: filteredAppointments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// POST - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "doctorName",
      "specialty",
      "day",
      "date",
      "timeSlot",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate patient details
    if (!body.patientDetails) {
      return NextResponse.json(
        {
          success: false,
          error: "Patient details are required",
        },
        { status: 400 }
      );
    }

    const requiredPatientFields = [
      "fullName",
      "age",
      "gender",
      "phone",
      "relationship",
    ];
    const missingPatientFields = requiredPatientFields.filter(
      (field) => !body.patientDetails[field]
    );

    if (missingPatientFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required patient fields: ${missingPatientFields.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    const validStatuses = ["Upcoming", "Completed", "Canceled", "Waiting"];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate payment status if provided
    const validPaymentStatuses = ["Paid", "Not paid"];
    if (
      body.paymentStatus &&
      !validPaymentStatuses.includes(body.paymentStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validate appointment type if provided
    const validTypes = ["In-person", "Online"];
    if (body.type && !validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid appointment type. Must be one of: ${validTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Create new appointment
    const newAppointment: Appointment = {
      id: nextId++,
      tokenNo: `A${String(nextId - 1).padStart(3, "0")}`,
      doctorName: body.doctorName,
      doctorImage: body.doctorImage || "/male-doctor.png",
      specialty: body.specialty,
      qualification: body.qualification || "MBBS, MD",
      day: body.day,
      date: body.date,
      timeSlot: body.timeSlot,
      problem: body.problem || "",
      status: body.status || "Upcoming",
      type: body.type || "In-person",
      paymentStatus: body.paymentStatus || "Not paid",
      queuePosition: body.queuePosition,
      expectedTime: body.expectedTime,
      patientDetails: {
        fullName: body.patientDetails.fullName,
        age: Number(body.patientDetails.age),
        gender: body.patientDetails.gender,
        phone: body.patientDetails.phone,
        weight: body.patientDetails.weight
          ? Number(body.patientDetails.weight)
          : undefined,
        problem: body.patientDetails.problem || body.problem || "",
        relationship: body.patientDetails.relationship,
        location: body.patientDetails.location || "",
      },
    };

    // Add to appointments array
    appointments.push(newAppointment);

    return NextResponse.json(
      {
        success: true,
        message: "Appointment created successfully",
        data: newAppointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to get appointments (can be imported by other files)
export function getAppointments() {
  return appointments;
}

// Helper function to set appointments (useful for testing or initialization)
export function setAppointments(newAppointments: Appointment[]) {
  appointments = newAppointments;
  nextId = Math.max(...appointments.map((a) => a.id), 0) + 1;
}
