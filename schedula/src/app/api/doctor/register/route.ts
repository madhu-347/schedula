// Doctor Registration API Route: /api/doctor/register
// POST - Create new doctor account

import { NextRequest, NextResponse } from "next/server";
import { Doctor } from "@/lib/types/doctor";
import { promises as fs } from "fs";
import path from "path";
import mockData from "@/lib/mockData.json";

const dataDir = path.join(process.cwd(), "data");
const doctorsFile = path.join(dataDir, "doctors.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {}
}

async function readDoctors(): Promise<Doctor[]> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(doctorsFile, "utf8");
    return JSON.parse(raw) as Doctor[];
  } catch {
    // Fallback to mockData on first run
    return JSON.parse(JSON.stringify(mockData.doctors)) as Doctor[];
  }
}

async function writeDoctors(doctors: Doctor[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(doctorsFile, JSON.stringify(doctors, null, 2), "utf8");
}

// POST - Register new doctor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation
    if (
      !body.firstName ||
      !body.lastName ||
      !body.email ||
      !body.password ||
      !body.phone ||
      !body.specialty
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(body.phone)) {
      return NextResponse.json(
        { success: false, error: "Phone number must be 10 digits" },
        { status: 400 }
      );
    }

    // Get existing doctors
    const doctorsData = await readDoctors();

    // Check if email already exists
    const existingDoctor = doctorsData.find(
      (doctor) => doctor.email === body.email
    );
    if (existingDoctor) {
      return NextResponse.json(
        { success: false, error: "Doctor with this email already exists" },
        { status: 409 }
      );
    }

    // Check if phone already exists
    const existingPhone = doctorsData.find(
      (doctor) => doctor.phone === body.phone
    );
    if (existingPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "Doctor with this phone number already exists",
        },
        { status: 409 }
      );
    }

    // Create new doctor
    const newDoctor: Doctor = {
      id: Date.now().toString(),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password, // In production, this should be hashed
      phone: body.phone,
      specialty: body.specialty,
      isAvailable: body.isAvailable || true,
    };

    doctorsData.push(newDoctor);
    await writeDoctors(doctorsData);

    // Remove password from response
    const { password: _, ...doctorWithoutPassword } = newDoctor;

    console.log("New doctor registered:", doctorWithoutPassword);

    return NextResponse.json(
      {
        success: true,
        data: doctorWithoutPassword,
        message: "Doctor registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/doctor/register:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
