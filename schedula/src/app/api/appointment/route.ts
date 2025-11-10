// app/api/appointment/route.ts
// CRUD Operations:
// - GET all appointments (with patient and doctor data)
// - GET appointments by patient (patientId)
// - GET appointments by doctor (doctorId)
// - GET appointment by id
// - POST create new appointment
// - PUT/PATCH update appointment details by id (returns enriched data)
// - DELETE appointment by id

import { NextRequest, NextResponse } from "next/server";
import { Appointment } from "@/lib/types/appointment";
import { Doctor } from "@/lib/types/doctor";
import { User } from "@/lib/types/user";
import mockData from "@/lib/mockData.json";
import { promises as fs } from "fs";
import path from "path";

// File-based persistence helpers
const dataDir = path.join(process.cwd(), "data");
const appointmentsFile = path.join(dataDir, "appointments.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {}
}

async function readAppointments(): Promise<Appointment[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(appointmentsFile, "utf8");
    return JSON.parse(data);
  } catch {
    // Fallback to mock data on first run
    return JSON.parse(JSON.stringify(mockData.appointments)) as Appointment[];
  }
}

async function writeAppointments(data: Appointment[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(appointmentsFile, JSON.stringify(data, null, 2), "utf8");
}

// Helper function to enrich appointment with patient and doctor data
function enrichAppointment(appointment: Appointment) {
  const patient =
    mockData.users.find((u: User) => u.id === appointment.patientId) || null;

  const doctor =
    mockData.doctors.find((d: Doctor) => d.id === appointment.doctorId) || null;

  // ✅ Safely extract patientDetails with correct type
  const p = appointment.patientDetails;

  const safePatientDetails = p
    ? {
        fullName: p.fullName,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        weight: p.weight,
        problem: p.problem,
        relationship: p.relationship,
        location: p.location,
      }
    : null;

  return {
    ...appointment,
    patient,
    doctor,

    // ✅ TS-safe patientDetails
    patientDetails: safePatientDetails,
  };
}

// Helper function to enrich multiple appointments
function enrichAppointments(appointments: Appointment[]) {
  return appointments.map(enrichAppointment);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get filter parameters
    const id = searchParams.get("id");
    const patientId = searchParams.get("patientId");
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const type = searchParams.get("type");
    const visitType = searchParams.get("visitType");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : null;

    const appointmentsData = await readAppointments();

    // If ID is provided, return specific appointment with enriched data
    if (id) {
      const appointment = appointmentsData.find((app) => app.id === id);

      if (!appointment) {
        return NextResponse.json(
          { success: false, error: "Appointment not found" },
          { status: 404 }
        );
      }

      // Enrich with patient and doctor data
      const enrichedAppointment = enrichAppointment(appointment);

      return NextResponse.json(
        { success: true, data: enrichedAppointment },
        { status: 200 }
      );
    }

    // Start with all appointments
    let filteredAppointments = [...appointmentsData];

    // Apply filters
    if (patientId)
      filteredAppointments = filteredAppointments.filter(
        (app) => app.patientId === patientId
      );

    if (doctorId)
      filteredAppointments = filteredAppointments.filter(
        (app) => app.doctorId === doctorId
      );

    if (status)
      filteredAppointments = filteredAppointments.filter(
        (app) => app.status.toLowerCase() === status.toLowerCase()
      );

    if (date)
      filteredAppointments = filteredAppointments.filter(
        (app) => app.date === date
      );

    if (type)
      filteredAppointments = filteredAppointments.filter(
        (app) => app.type?.toLowerCase() === type.toLowerCase()
      );

    if (visitType)
      filteredAppointments = filteredAppointments.filter(
        (app) => app.visitType?.toLowerCase() === visitType.toLowerCase()
      );

    // Sort by date (most recent first)
    filteredAppointments.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    // If limit is provided, return only that many latest appointments
    const limitedAppointments =
      limit && limit > 0
        ? filteredAppointments.slice(0, limit)
        : filteredAppointments;

    // Enrich all appointments with patient and doctor data
    const enrichedAppointments = enrichAppointments(limitedAppointments);

    return NextResponse.json(
      {
        success: true,
        count: enrichedAppointments.length,
        data: enrichedAppointments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching appointments:", error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("create appt req body ", body);

    const appointmentsData = await readAppointments();

    // Validate required fields based on interface
    const requiredFields = ["patientId", "doctorId", "day", "date", "status"];

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

    // Validate patientId exists in users
    const patient = mockData.users.find(
      (user: User) => user.id === body.patientId
    );
    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: `Patient with ID ${body.patientId} not found`,
        },
        { status: 404 }
      );
    }

    // Validate doctorId exists in doctors
    const doctor = mockData.doctors.find(
      (doctor: Doctor) => doctor.id === body.doctorId
    );
    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          error: `Doctor with ID ${body.doctorId} not found`,
        },
        { status: 404 }
      );
    }

    // Validate status
    const validStatuses = ["Upcoming", "Completed", "Cancelled"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate paid field (required boolean)
    if (typeof body.paid !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "Field 'paid' is required and must be a boolean",
        },
        { status: 400 }
      );
    }

    // Validate appointment type if provided
    if (body.type) {
      const validTypes = ["In-person", "Virtual"];
      if (!validTypes.includes(body.type)) {
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
    }

    // Validate visit type if provided
    if (body.visitType) {
      const validVisitTypes = ["Follow-up", "Report", "First"];
      if (!validVisitTypes.includes(body.visitType)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid visit type. Must be one of: ${validVisitTypes.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate patientDetails if provided
    if (body.patientDetails) {
      const requiredPatientFields = ["fullName", "age", "gender", "phone"];
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

      // Validate gender
      const validGenders = ["Male", "Female", "Other"];
      if (!validGenders.includes(body.patientDetails.gender)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid gender. Must be one of: ${validGenders.join(", ")}`,
          },
          { status: 400 }
        );
      }

      // Validate relationship
      const validRelationships = [
        "Self",
        "Son",
        "Daughter",
        "Brother",
        "Sister",
        "Father",
        "Mother",
        "Spouse",
        "Other",
      ];
      const relationship = body.patientDetails.relationship || "Self";
      if (!validRelationships.includes(relationship)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid relationship. Must be one of: ${validRelationships.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate postFeeling if provided
    if (body.postFeeling) {
      const validPostFeelings = ["Feeling Better", "No improvements"];
      if (!validPostFeelings.includes(body.postFeeling)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid postFeeling. Must be one of: ${validPostFeelings.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
    }

    // Generate unique ID using Date.now().toString()
    const newId = Date.now().toString();
    const tokenNumber = `T${String(appointmentsData.length + 1).padStart(
      4,
      "0"
    )}`;

    // Create new appointment
    const newAppointment: Appointment = {
      id: newId,
      tokenNo: body.tokenNo || tokenNumber,
      patientId: body.patientId,
      doctorId: body.doctorId,
      day: body.day,
      date: body.date,
      type: body.type,
      time: body.time,
      queuePosition: body.queuePosition,
      patientDetails: body.patientDetails
        ? {
            fullName: body.patientDetails.fullName,
            age: Number(body.patientDetails.age),
            gender: body.patientDetails.gender,
            phone: body.patientDetails.phone,
            weight: body.patientDetails.weight
              ? Number(body.patientDetails.weight)
              : undefined,
            problem: body.patientDetails.problem,
            relationship: body.patientDetails.relationship || "Self",
          }
        : undefined,
      visitType: body.visitType,
      status: body.status,
      paid: body.paid,
      postFeeling: body.postFeeling,
      followUpOf: body.followUpOf,
    };

    // Add to appointments array and save
    appointmentsData.push(newAppointment);
    await writeAppointments(appointmentsData);

    console.log("New appointment created:", newAppointment);

    // Send notifications to both doctor and patient
    // try {
    //   const patientName = `${patient?.firstName || "Patient"} ${
    //     patient?.lastName || ""
    //   }`.trim();

    //   const doctorName = `${doctor.firstName} ${doctor.lastName}`;

    //   // Generate and send notification to doctor
    //   const doctorNotification = generateDoctorNotification({
    //     recipientId: body.doctorId,
    //     doctorName: doctorName,
    //     patientName: patientName,
    //     date: body.date,
    //     time: body.time || "TBD",
    //     appointmentId: newId,
    //   });

    //   const doctorNotificationResponse = await fetch(
    //     process.env.NODE_ENV === "development"
    //       ? "http://localhost:3000/api/notifications"
    //       : "/api/notifications",
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(doctorNotification),
    //     }
    //   );

    //   if (!doctorNotificationResponse.ok) {
    //     console.error("Failed to send notification to doctor");
    //   }

    //   // Generate and send notification to patient
    //   // const patientNotification = generatePatientNotification({
    //   //   recipientId: body.patientId,
    //   //   doctorName: doctorName,
    //   //   patientName: patientName,
    //   //   date: body.date,
    //   //   time: body.time || "TBD",
    //   //   appointmentId: newId,
    //   // });

    //   // const patientNotificationResponse = await fetch(
    //   //   process.env.NODE_ENV === "development"
    //   //     ? "http://localhost:3000/api/notifications"
    //   //     : "/api/notifications",
    //   //   {
    //   //     method: "POST",
    //   //     headers: {
    //   //       "Content-Type": "application/json",
    //   //     },
    //   //     body: JSON.stringify(patientNotification),
    //   //   }
    //   // );

    //   // if (!patientNotificationResponse.ok) {
    //   //   console.error("Failed to send notification to patient");
    //   // }
    // } catch (notificationError) {
    //   console.error("Error sending notifications:", notificationError);
    // }

    // Enrich response with patient and doctor data
    const enrichedAppointment = enrichAppointment(newAppointment);

    return NextResponse.json(
      {
        success: true,
        message: "Appointment created successfully",
        data: enrichedAppointment,
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

// PUT/PATCH - Update appointment details by id
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("req body: ", body);
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Appointment ID is required",
        },
        { status: 400 }
      );
    }

    const appointmentsData = await readAppointments();
    const appointmentIndex = appointmentsData.findIndex(
      (app: Appointment) => app.id === id
    );

    if (appointmentIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Appointment not found",
        },
        { status: 404 }
      );
    }

    // Validate status if being updated
    if (updateData.status) {
      const validStatuses = ["Upcoming", "Completed", "Cancelled"];
      if (!validStatuses.includes(updateData.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Must be one of: ${validStatuses.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate appointment type if being updated
    if (updateData.type) {
      const validTypes = ["In-person", "Virtual"];
      if (!validTypes.includes(updateData.type)) {
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
    }

    // Validate visit type if being updated
    if (updateData.visitType) {
      const validVisitTypes = ["Follow-up", "Report", "First"];
      if (!validVisitTypes.includes(updateData.visitType)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid visit type. Must be one of: ${validVisitTypes.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate postFeeling if being updated
    if (updateData.postFeeling) {
      const validPostFeelings = ["Feeling Better", "No improvements"];
      if (!validPostFeelings.includes(updateData.postFeeling)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid postFeeling. Must be one of: ${validPostFeelings.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate patient details if being updated
    if (updateData.patientDetails) {
      const { fullName, age, gender, phone, weight, problem, relationship } =
        updateData.patientDetails;

      // Validate required fields
      if (fullName && typeof fullName !== "string") {
        return NextResponse.json(
          { success: false, error: "Full name must be a string" },
          { status: 400 }
        );
      }

      if (age && (typeof age !== "number" || age < 0 || age > 150)) {
        return NextResponse.json(
          { success: false, error: "Age must be a number between 0 and 150" },
          { status: 400 }
        );
      }

      if (gender && !["Male", "Female", "Other"].includes(gender)) {
        return NextResponse.json(
          { success: false, error: "Gender must be Male, Female, or Other" },
          { status: 400 }
        );
      }

      if (phone && !/^\d{10}$/.test(phone)) {
        return NextResponse.json(
          { success: false, error: "Phone must be a 10-digit number" },
          { status: 400 }
        );
      }

      if (relationship) {
        const validRelationships = [
          "Self",
          "Son",
          "Daughter",
          "Brother",
          "Sister",
          "Father",
          "Mother",
          "Spouse",
          "Other",
        ];
        if (!validRelationships.includes(relationship)) {
          return NextResponse.json(
            {
              success: false,
              error: `Relationship must be one of: ${validRelationships.join(
                ", "
              )}`,
            },
            { status: 400 }
          );
        }
      }

      // Merge patient details properly
      updateData.patientDetails = {
        ...appointmentsData[appointmentIndex].patientDetails,
        ...updateData.patientDetails,
      };
    }

    // Update appointment with all changes
    appointmentsData[appointmentIndex] = {
      ...appointmentsData[appointmentIndex],
      ...updateData,
      id: appointmentsData[appointmentIndex].id, // Preserve original ID
    };

    // Save changes
    await writeAppointments(appointmentsData);

    console.log("Appointment updated:", appointmentsData[appointmentIndex]);

    // Enrich response with patient and doctor data
    const enrichedAppointment = enrichAppointment(
      appointmentsData[appointmentIndex]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Appointment updated successfully",
        data: enrichedAppointment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating appointment:", error);
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

// PATCH - Same as PUT for partial updates
export async function PATCH(request: NextRequest) {
  return PUT(request);
}

// DELETE - Delete appointment by id
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Appointment ID is required",
        },
        { status: 400 }
      );
    }

    const appointmentsData = await readAppointments();
    const appointmentIndex = appointmentsData.findIndex(
      (app: Appointment) => app.id === id
    );

    if (appointmentIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Appointment not found",
        },
        { status: 404 }
      );
    }

    const deletedAppointment = appointmentsData[appointmentIndex];
    appointmentsData.splice(appointmentIndex, 1);

    // Save changes
    await writeAppointments(appointmentsData);

    console.log("Appointment deleted:", deletedAppointment);

    return NextResponse.json(
      {
        success: true,
        message: "Appointment deleted successfully",
        data: deletedAppointment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting appointment:", error);
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
