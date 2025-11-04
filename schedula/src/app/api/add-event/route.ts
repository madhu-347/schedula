import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/options";

// Extend the Session type to include our custom properties
interface CustomSession {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(
      authOptions
    )) as CustomSession | null;

    if (!session || !session.accessToken) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // get the details from request body
    const { appointment, doctor, patient } = body;

    // Validate required data
    if (!appointment || !doctor || !patient) {
      return Response.json(
        {
          success: false,
          error: "Missing required data: appointment, doctor, or patient",
        },
        { status: 400 }
      );
    }

    // Validate appointment data
    if (!appointment.date || !appointment.time || !appointment.id) {
      return Response.json(
        {
          success: false,
          error: "Missing required appointment fields: date, time, or id",
        },
        { status: 400 }
      );
    }

    // Validate doctor data
    if (!doctor.firstName || !doctor.lastName || !doctor.specialty) {
      return Response.json(
        {
          success: false,
          error:
            "Missing required doctor fields: firstName, lastName, or specialty",
        },
        { status: 400 }
      );
    }

    // Validate patient data
    if (!patient.firstName || !patient.lastName) {
      return Response.json(
        {
          success: false,
          error: "Missing required patient fields: firstName or lastName",
        },
        { status: 400 }
      );
    }

    // Set up OAuth2 client with credentials
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI ||
        "http://localhost:3000/api/auth/callback/google"
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Parse date and time from appointment with validation
    console.log("Appointment date:", appointment.date);
    console.log("Appointment time:", appointment.time);

    const dateParts = appointment.date.split("-");

    // Handle time format - could be "09:30" or "09:30 AM - 10:00 AM"
    let timeString = appointment.time;
    if (timeString.includes(" - ")) {
      // Extract just the start time from "09:30 AM - 10:00 AM"
      timeString = timeString.split(" - ")[0];
      // Remove AM/PM if present
      timeString = timeString.replace(/ AM| PM/g, "");
    }

    const timeParts = timeString.split(":");

    if (dateParts.length !== 3 || timeParts.length !== 2) {
      return Response.json(
        {
          success: false,
          error: `Invalid date or time format. Date: ${appointment.date}, Time: ${appointment.time}`,
        },
        { status: 400 }
      );
    }

    const [year, month, day] = dateParts.map(Number);
    const [hours, minutes] = timeParts.map(Number);

    // Validate parsed values
    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      isNaN(hours) ||
      isNaN(minutes)
    ) {
      return Response.json(
        {
          success: false,
          error: `Invalid date or time values. Year: ${year}, Month: ${month}, Day: ${day}, Hours: ${hours}, Minutes: ${minutes}`,
        },
        { status: 400 }
      );
    }

    // Create dates with proper validation
    const startDate = new Date(year, month - 1, day, hours, minutes);

    // Check if the date is valid
    if (isNaN(startDate.getTime())) {
      return Response.json(
        {
          success: false,
          error: "Invalid date or time values result in invalid Date object",
        },
        { status: 400 }
      );
    }

    const endDate = new Date(startDate.getTime() + 30 * 60000); // Add 30 minutes

    const event = {
      summary: `Doctor Appointment with Dr. ${doctor.firstName} ${doctor.lastName}`,
      location: "Wellora Health Center, Chennai",
      description: `Appointment with Dr. ${doctor.firstName} ${doctor.specialty}\nPatient: ${patient.firstName} ${patient.lastName}\nAppointment ID: ${appointment.id}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "Asia/Kolkata",
      },
      attendees: [{ email: patient.email || "patient@example.com" }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return Response.json({
      success: true,
      eventId: response.data.id,
      link: response.data.htmlLink,
    });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Failed to create calendar event",
      },
      { status: 500 }
    );
  }
}
