//get prescription by id
// get all prescriptions for patient (using patient id)
// get all prescriptions for doctor (using doctor id)
// there'll be only one prescription per appointment so no point of getting prescription for appt id.
import mockData from "@/lib/mockData.json";
import { NextResponse, NextRequest } from "next/server";
import { Doctor } from "@/lib/types/doctor";
import { User } from "@/lib/types/user";
import { Appointment } from "@/lib/types/appointment";
import { Prescription } from "@/lib/types/prescription";
import { getAppointmentById } from "@/app/services/appointments.api";
import { promises as fs } from "fs";
import path from "path";

// File-based persistence helpers
const dataDir = path.join(process.cwd(), "data");
const prescriptionsFile = path.join(dataDir, "prescriptions.json");
const appointmentsFile = path.join(dataDir, "appointments.json");
const usersFile = path.join(dataDir, "users.json");
const doctorsFile = path.join(dataDir, "doctors.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {}
}

async function readPrescriptions(): Promise<any[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(prescriptionsFile, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writePrescriptions(data: any[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(prescriptionsFile, JSON.stringify(data, null, 2), "utf8");
}

async function readAppointments(): Promise<Appointment[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(appointmentsFile, "utf8");
    return JSON.parse(data);
  } catch {
    return JSON.parse(JSON.stringify(mockData.appointments)) as Appointment[];
  }
}

async function readUsers(): Promise<User[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(usersFile, "utf8");
    return JSON.parse(data);
  } catch {
    return JSON.parse(JSON.stringify(mockData.users)) as User[];
  }
}

async function readDoctors(): Promise<Doctor[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(doctorsFile, "utf8");
    return JSON.parse(data);
  } catch {
    return JSON.parse(JSON.stringify(mockData.doctors)) as Doctor[];
  }
}

// Helper function to enrich prescription with doctor and patient data
const enrichPrescription = async (prescription: any) => {
  console.log("enrichPrescription called with prescription:", prescription);

  try {
    // Read data directly from file system instead of HTTP request
    const appointments = await readAppointments();
    const users = await readUsers();
    const doctors = await readDoctors();

    // Find the appointment
    const appointment = appointments.find(
      (a) => a.id === prescription.appointmentId
    );

    if (!appointment) {
      console.warn(`Appointment ${prescription.appointmentId} not found`);
      return {
        ...prescription,
        doctor: null,
        patient: null,
      };
    }

    // Find doctor
    const doctor = doctors.find((d) => d.id === prescription.doctorId) || null;

    // Get patient details from appointment or find user
    let patient = appointment.patientDetails || null;

    // If patientDetails not in appointment, try to get from users
    if (!patient && prescription.patientId) {
      const user = users.find((u) => u.id === prescription.patientId);
      if (user) {
        patient = {
          id: user.id,
          fullName: `${user.firstName} ${user.lastName}`,
          age: 0, // Default values
          gender: "Other" as const,
          phone: user.phone || "",
          relationship: "Self" as const,
        };
      }
    }

    return {
      ...prescription,
      doctor,
      patient,
    };
  } catch (error) {
    console.error("Error enriching prescription:", error);
    return {
      ...prescription,
      doctor: null,
      patient: null,
    };
  }
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const patientId = url.searchParams.get("patientId");
  const doctorId = url.searchParams.get("doctorId");
  const appointmentId = url.searchParams.get("appointmentId");

  const prescriptions = await readPrescriptions();

  // Get specific prescription by ID
  if (id) {
    const prescription = prescriptions.find((p) => p.id === id);
    if (!prescription) {
      return NextResponse.json({
        success: false,
        data: null,
        message: "Not found",
      });
    }
    const enrichedData = await enrichPrescription(prescription);
    return NextResponse.json({
      success: true,
      data: enrichedData,
    });
  }

  // Get prescription by appointment ID
  if (appointmentId) {
    const prescription = prescriptions.find(
      (p) => p.appointmentId === appointmentId
    );
    if (!prescription) {
      return NextResponse.json({
        success: false,
        data: null,
        message: "No prescription found for this appointment",
      });
    }
    const enrichedData = await enrichPrescription(prescription);
    return NextResponse.json({
      success: true,
      data: enrichedData,
    });
  }

  // Get all prescriptions for a patient
  if (patientId) {
    const filtered = prescriptions.filter((p) => p.patientId === patientId);
    const data = await Promise.all(filtered.map(enrichPrescription));
    // console.log("all prescriptions for patient", data);
    return NextResponse.json({ success: true, data });
  }

  // Get all prescriptions for a doctor
  if (doctorId) {
    const filtered = prescriptions.filter((p) => p.doctorId === doctorId);
    const data = await Promise.all(filtered.map(enrichPrescription));
    return NextResponse.json({ success: true, data });
  }

  // Get all prescriptions
  const data = await Promise.all(prescriptions.map(enrichPrescription));
  return NextResponse.json({
    success: true,
    data,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const prescriptions = await readPrescriptions();

  const newPrescription = {
    ...body,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  prescriptions.push(newPrescription);
  await writePrescriptions(prescriptions);

  console.log("New prescription added:", newPrescription);
  console.log("All prescriptions:", prescriptions);

  const enrichedData = await enrichPrescription(newPrescription);
  return NextResponse.json({
    success: true,
    data: enrichedData,
  });
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  const prescriptions = await readPrescriptions();
  const updated = prescriptions.filter((p) => p.id !== id);
  await writePrescriptions(updated);

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  const prescriptions = await readPrescriptions();
  const index = prescriptions.findIndex((p) => p.id === body.id);

  if (index === -1) {
    return NextResponse.json(
      {
        success: false,
        message: "Prescription not found",
      },
      { status: 404 }
    );
  }

  prescriptions[index] = body;
  await writePrescriptions(prescriptions);

  const enrichedData = await enrichPrescription(body);
  return NextResponse.json({ success: true, data: enrichedData });
}
