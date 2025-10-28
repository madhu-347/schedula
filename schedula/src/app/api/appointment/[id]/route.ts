import { NextRequest, NextResponse } from "next/server";
import { getAppointments } from "../route";

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
