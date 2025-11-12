// User Profile API: GET (by id) and PUT (update)
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import mockData from "@/lib/mockData.json";
import type { User } from "@/lib/types/user";

export const runtime = "nodejs";

// File-based persistence helpers
const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {}
}

async function readUsers(): Promise<User[]> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(usersFile, "utf8");
    return JSON.parse(raw) as User[];
  } catch {
    // Fallback to mockData on first run
    return JSON.parse(JSON.stringify(mockData.users)) as User[];
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");
}

// GET /api/user/profile?id=USER_ID
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    const users = await readUsers();

    if (!id) {
      return NextResponse.json(
        { success: false, data: null, error: "Missing 'id' parameter" },
        { status: 400 }
      );
    }

    const user = users.find((u) => u.id === id) || null;

    if (!user) {
      return NextResponse.json(
        { success: false, data: null, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile
// Body: { id, firstName?, lastName?, email?, phone?, location? }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, firstName, lastName, email, phone, location } =
      body as Partial<User>;

    if (!id) {
      return NextResponse.json(
        { success: false, data: null, error: "User ID is required" },
        { status: 400 }
      );
    }

    const users = await readUsers();
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, data: null, error: "User not found" },
        { status: 404 }
      );
    }

    // Basic validations (optional, can be expanded)
    if (email && typeof email !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: "Invalid email" },
        { status: 400 }
      );
    }
    if (phone && typeof phone !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: "Invalid phone" },
        { status: 400 }
      );
    }

    const updated: User = {
      ...users[index],
      ...(firstName !== undefined ? { firstName } : {}),
      ...(lastName !== undefined ? { lastName } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(location !== undefined ? { location } : {}),
    };

    users[index] = updated;
    await writeUsers(users);

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
