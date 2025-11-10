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

// Helper function to enrich prescription with doctor and patient data
const enrichPrescription = async (prescription: Prescription) => {
  console.log("enrichPrescription called with prescription:", prescription);

  try {
    const response = await fetch(
      `http://localhost:3000/api/appointment?id=${prescription.appointmentId}`
    );
    const result = await response.json();
    const appointment = result.success ? result.data : null;

    const doctor = appointment?.doctor || null;
    const patient = appointment?.patientDetails || null;

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
  const updated = prescriptions.map((p) => (p.id === body.id ? body : p));
  await writePrescriptions(updated);

  const enrichedData = await enrichPrescription(body);
  return NextResponse.json({ success: true, data: enrichedData });
}
