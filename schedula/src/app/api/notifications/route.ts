// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";

interface Notification {
  id: number;
  recipientId?: string | number; // user who should receive the notification
  doctorName: string;
  message: string;
  appointmentId?: string | number;
  targetUrl?: string; // client route to open when clicked
  timestamp: string;
  read: boolean;
}

// In-memory notifications store (replace with DB in prod)
let notifications: Notification[] = [];

// GET - fetch notifications. Optional query: recipientId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get("recipientId");

    const filtered = recipientId
      ? notifications.filter((n) => String(n.recipientId) === String(recipientId))
      : notifications;

    // return newest first
    const sorted = filtered.slice().sort((a, b) => Number(b.id) - Number(a.id));

    return NextResponse.json({ success: true, data: sorted });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - create new notification
// Expected body: { recipientId, doctorName, message, appointmentId?, targetUrl? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientId, doctorName, message, appointmentId, targetUrl } = body;

    if (!recipientId || !doctorName || !message) {
      return NextResponse.json(
        { success: false, error: "recipientId, doctorName and message are required" },
        { status: 400 }
      );
    }

    const newNotification: Notification = {
      id: Date.now(),
      recipientId,
      doctorName,
      message,
      appointmentId,
      targetUrl,
      timestamp: new Date().toISOString(),
      read: false,
    };

    notifications.push(newNotification);

    return NextResponse.json(
      {
        success: true,
        message: "Notification added successfully",
        data: newNotification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - mark notification as read (body: { id })
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    notifications = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
