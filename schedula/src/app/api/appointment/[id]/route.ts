import { NextRequest, NextResponse } from "next/server";
import { getAppointments, setAppointments } from "../route";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params; // ✅ MUST await
  console.log("params:", params);

  const appointmentId = Number(params.id); // ✅ now works
  console.log("appointment id: ", appointmentId);
  const appointments = getAppointments(); // ✅ get same in-memory data
  console.log("All appointments : ", appointments);
  const appointment = appointments.find((app) => app.id === appointmentId);

  if (!appointment) {
    return NextResponse.json(
      { success: false, message: "Appointment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { success: true, data: appointment },
    { status: 200 }
  );
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const appointmentId = Number(params.id);

  const updates = await request.json();

  const appointments = getAppointments();
  const index = appointments.findIndex((a) => a.id === appointmentId);

  if (index === -1) {
    return NextResponse.json(
      { success: false, error: "Appointment not found" },
      { status: 404 }
    );
  }

  const updated = { ...appointments[index], ...updates };
  const newAppointments = [...appointments];
  newAppointments[index] = updated;
  setAppointments(newAppointments);

  return NextResponse.json(
    { success: true, message: "Appointment updated", data: updated },
    { status: 200 }
  );
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const appointmentId = Number(params.id);
  const appointments = getAppointments();
  const exists = appointments.some((a) => a.id === appointmentId);
  if (!exists) {
    return NextResponse.json(
      { success: false, error: "Appointment not found" },
      { status: 404 }
    );
  }
  const filtered = appointments.filter((a) => a.id !== appointmentId);
  setAppointments(filtered);
  return NextResponse.json(
    { success: true, message: "Appointment deleted" },
    { status: 200 }
  );
}
