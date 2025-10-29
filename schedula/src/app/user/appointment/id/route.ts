// src/app/api/appointments/[apptId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getAppointmentById, updateAppointment } from '@/lib/appointmentStore'; // Import from our store

// --- GET Handler (Fetch one appointment) ---
export async function GET(
  request: NextRequest,
  { params }: { params: { apptId: string } }
) {
  try {
    const id = params.apptId; // ID can be string or number
    const appointment = getAppointmentById(id);

    if (appointment) {
      return NextResponse.json({ appointment });
    } else {
      return new NextResponse('Appointment not found', { status: 404 });
    }
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// --- PUT Handler (Update an appointment) ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { apptId: string } }
) {
  try {
    const id = params.apptId;
    const body = await request.json();

    // Only update fields we allow
    const updatedData = {
        date: body.date,
        time: body.time,
        reason: body.reason,
        // You can add more editable fields here
    };

    const updatedAppointment = updateAppointment(id, updatedData);

    if (updatedAppointment) {
      return NextResponse.json({ appointment: updatedAppointment });
    } else {
      return new NextResponse('Appointment not found', { status: 404 });
    }
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}