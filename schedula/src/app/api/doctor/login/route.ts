// Doctor Login API Route: /api/doctor/login
// POST - Authenticate doctor credentials

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

// POST - Authenticate doctor
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get doctors from file
    const doctorsData = await readDoctors();

    // Find doctor by email
    const doctor = doctorsData.find((d) => d.email === email);

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password (in a real app, you'd use bcrypt)
    if (doctor.password !== password) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...doctorWithoutPassword } = doctor;

    console.log("Doctor logged in:", doctorWithoutPassword);

    return NextResponse.json(
      {
        success: true,
        data: doctorWithoutPassword,
        message: "Login successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/doctor/login:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
