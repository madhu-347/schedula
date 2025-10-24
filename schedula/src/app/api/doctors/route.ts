// src/app/api/doctors/route.ts

import { NextResponse, NextRequest } from 'next/server';
import mockData from '@/lib/mockData.json';

export async function GET(request: NextRequest) {
  try {
    // Get the search parameters from the request URL
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id'); // Look for '?id=...'

    const { doctors } = mockData;

    if (id) {
      // --- THIS IS THE NEW LOGIC ---
      // If an ID is provided, find that one doctor
      console.log(`API: Looking for single doctor with ID: ${id}`);
      const doctor = doctors.find(doc => doc.id === parseInt(id, 10));

      if (doctor) {
        return NextResponse.json({ doctor });
      } else {
        return new NextResponse(`Doctor with id ${id} not found`, { status: 404 });
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