// src/app/api/doctor/route.ts

import { NextResponse, NextRequest } from "next/server";
import { Doctor } from "@/lib/types/doctor";
import { promises as fs } from "fs";
import path from "path";

// File-based persistence helpers
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
    const data = await fs.readFile(doctorsFile, "utf8");
    return JSON.parse(data);
  } catch {
    // Return empty array if no data exists
    return [] as Doctor[];
  }
}

async function writeDoctors(data: Doctor[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(doctorsFile, JSON.stringify(data, null, 2), "utf8");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password, specialty } = body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get existing doctors from file
    const doctorsData = await readDoctors();

    // Check for duplicate email
    const existingDoctor = doctorsData.find(
      (doc) => doc.email.toLowerCase() === email.toLowerCase()
    );
    if (existingDoctor) {
      return NextResponse.json(
        { success: false, message: "Doctor with this email already exists" },
        { status: 409 }
      );
    }

    // Create new doctor record
    const newDoctor: Doctor = {
      id: `doc-${Date.now()}`, // Unique ID
      firstName,
      lastName,
      email,
      phone,
      password,
      specialty: specialty || "",
      isAvailable: true,
      image: "",
      availableDays: [],
      availableTime: {
        morning: { from: "", to: "" },
        evening: { from: "", to: "" },
      },
    };

    // Save to doctors.json
    doctorsData.push(newDoctor);
    await writeDoctors(doctorsData);

    return NextResponse.json({
      success: true,
      data: newDoctor,
      message: "Doctor registered successfully",
    });
  } catch (error) {
    console.error("Error registering doctor:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the search parameters from the request URL
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id"); // Look for '?id=...'

    const doctorsData = await readDoctors();

    if (id) {
      // --- THIS IS THE NEW LOGIC ---
      // If an ID is provided, find that one doctor
      console.log(`API: Looking for single doctor with ID: ${id}`);
      const doctor = doctorsData.find((doc) => doc.id === id);

      console.log("login doctor data: ", doctor);
      if (doctor) {
        return NextResponse.json({ doctor });
      } else {
        return new NextResponse(`Doctor with id ${id} not found`, {
          status: 404,
        });
      }
    } else {
      // --- THIS IS THE OLD LOGIC ---
      // If no ID is provided, return all doctors
      console.log("API: Returning all doctors");
      return NextResponse.json({
        doctors: doctorsData,
        total: doctorsData.length,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch doctors:", error.message);
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const doctorsData = await readDoctors();
    const doctorIndex = doctorsData.findIndex((doc) => doc.id === id);

    if (doctorIndex === -1) {
      return new NextResponse(`Doctor with id ${id} not found`, {
        status: 404,
      });
    }

    // ✅ Update the doctor data
    doctorsData[doctorIndex] = { ...doctorsData[doctorIndex], ...updateData };

    // ✅ Persist the changes to doctors.json
    await writeDoctors(doctorsData);

    return NextResponse.json({
      success: true,
      doctor: doctorsData[doctorIndex],
    });
  } catch (error) {
    console.error("Failed to update doctor:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
