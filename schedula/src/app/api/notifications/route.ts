// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Notification } from "@/lib/types/notification";

// In-memory notifications store (replace with DB in prod)
let notifications: Notification[] = [];

// GET - fetch notifications. Optional query: recipientId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get("recipientId");

    const filtered = notifications.filter((n) => n.recipientId === recipientId);

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
    const { recipientId, recipientRole, title, message, type, targetUrl } =
      body;

    if (
      !recipientId ||
      !recipientRole ||
      !title ||
      !message ||
      !type ||
      !targetUrl
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "recipientId, recipientRole, title, message, type, and targetUrl are required",
        },
        { status: 400 }
      );
    }

    const newNotification: Notification = {
      id: String(Date.now()),
      recipientId,
      recipientRole,
      title,
      message,
      type,
      targetUrl,
      createdAt: new Date().toISOString(),
      read: false,
    };

    if (body.relatedId) {
      newNotification.relatedId = body.relatedId;
    }

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
