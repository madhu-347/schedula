import { NextRequest, NextResponse } from "next/server";

interface Notification {
  id: number;
  doctorName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// In-memory notifications store
let notifications: Notification[] = [];

// --------------------
// GET - Fetch notifications
// --------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorName = searchParams.get("doctorName");

    // If doctorName is provided → filter for that doctor
    const filtered = doctorName
      ? notifications.filter((n) => n.doctorName === doctorName)
      : notifications;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// --------------------
// POST - Create new notification
// --------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorName, message } = body;

    if (!doctorName || !message) {
      return NextResponse.json(
        { success: false, error: "doctorName and message are required" },
        { status: 400 }
      );
    }

    const newNotification: Notification = {
      id: Date.now(),
      doctorName,
      message,
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

// --------------------
// PUT - Mark notification as read
// --------------------
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
