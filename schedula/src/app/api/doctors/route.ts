import { NextResponse } from 'next/server';
import mockData from '@/lib/mockData.json'; // Your existing mock data

// This function handles GET requests to /api/doctors
export async function GET() {
  try {
    // We're just returning the mock data for now
    const { doctors } = mockData;
    
    // Return a successful JSON response
    return NextResponse.json({ doctors: doctors, total: doctors.length });
    
  } catch (error) {
    // Return an error response if something goes wrong
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}