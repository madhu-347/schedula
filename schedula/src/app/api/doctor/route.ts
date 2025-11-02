// src/app/api/doctor/route.ts

import { NextResponse, NextRequest } from "next/server";
import mockData from "@/lib/mockData.json";
import { writeFileSync } from "fs";
import { join } from "path";

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

    // In a real app, you would update the database
    // For now, we'll update the mock data
    const { doctors } = mockData;
    const doctorIndex = doctors.findIndex((doc) => doc.id === id);

    if (doctorIndex === -1) {
      return new NextResponse(`Doctor with id ${id} not found`, {
        status: 404,
      });
    }

    // Update the doctor data
    doctors[doctorIndex] = { ...doctors[doctorIndex], ...updateData };

    // In a real application, you would save to a database
    // For mock data, we'll just return the updated doctor
    return NextResponse.json({
      success: true,
      doctor: doctors[doctorIndex],
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to update doctor:", error.message);
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
