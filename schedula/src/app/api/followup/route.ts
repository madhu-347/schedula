// app/api/followup/route.ts
import { NextRequest, NextResponse } from "next/server";

let followups: any[] = [];

export async function POST(request: NextRequest) {
  const body = await request.json();

  const entry = {
    id: Date.now().toString(),
    doctorId: body.doctorId,
    patientId: body.patientId,
    appointmentId: body.appointmentId,
    followUpDate: body.followUpDate,
    followUpTime: body.followUpTime, // ✅ FIXED
    status: "Pending"
  };

  followups.push(entry);

  return NextResponse.json({ success: true, data: entry });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, status, followUpTime } = body;

  followups = followups.map(f =>
    f.id === id ? { ...f, status } : f
  );

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: true, data: followups });
  }

  const item = followups.find(f => f.id === id);
  return NextResponse.json({ success: true, data: item || null });
}
