// src/app/api/doctor/route.ts

import { NextResponse, NextRequest } from "next/server";
import mockData from "@/lib/mockData.json";
import { writeFileSync } from "fs";
import { join } from "path";

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

    // Get existing doctors from mock data
    const { doctors } = mockData;

    // Check for duplicate email
    const existingDoctor = doctors.find(
      (doc) => doc.email.toLowerCase() === email.toLowerCase()
    );
    if (existingDoctor) {
      return NextResponse.json(
        { success: false, message: "Doctor with this email already exists" },
        { status: 409 }
      );
    }

    // Create new doctor record
    const newDoctor = {
      id: `doc-${Date.now()}`,
      firstName,
      lastName,
      email,
      phone,
      password, // ⚠️ In production, hash this
      specialty,
      type: "doctor",
      image: "",
      availableDays: [],
      availableTime: { morning: null, evening: null },
      createdAt: new Date().toISOString(),
    };

    // Save to mockData.json
    doctors.push(newDoctor);
    const filePath = join(process.cwd(), "src/lib/mockData.json");
    writeFileSync(filePath, JSON.stringify(mockData, null, 2));

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

    const { doctors } = mockData;

    if (id) {
      // --- THIS IS THE NEW LOGIC ---
      // If an ID is provided, find that one doctor
      console.log(`API: Looking for single doctor with ID: ${id}`);
      const doctor = doctors.find((doc) => doc.id === id);

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
      return NextResponse.json({ doctors: doctors, total: doctors.length });
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

    const { doctors } = mockData;
    const doctorIndex = doctors.findIndex((doc) => doc.id === id);

    if (doctorIndex === -1) {
      return new NextResponse(`Doctor with id ${id} not found`, { status: 404 });
    }

    // ✅ Update the doctor data
    doctors[doctorIndex] = { ...doctors[doctorIndex], ...updateData };

    // ✅ Persist the changes to mockData.json
    const filePath = join(process.cwd(), "src/lib/mockData.json");
    writeFileSync(filePath, JSON.stringify(mockData, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      doctor: doctors[doctorIndex],
    });
  } catch (error) {
    console.error("Failed to update doctor:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
