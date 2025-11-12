// User Registration API Route: /api/user/register
// POST - Create new user account

import { NextRequest, NextResponse } from "next/server";
import { User } from "@/lib/types/user";
import { promises as fs } from "fs";
import path from "path";
import mockData from "@/lib/mockData.json";

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");
const doctorsFile = path.join(dataDir, "doctors.json");

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

// POST - Register new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation
    if (
      !body.firstName ||
      !body.lastName ||
      !body.email ||
      !body.password ||
      !body.phone
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(body.phone)) {
      return NextResponse.json(
        { success: false, error: "Phone number must be 10 digits" },
        { status: 400 }
      );
    }

    // Get existing users
    const usersData = await readUsers();

    // Check if email already exists
    const existingUser = usersData.find((user) => user.email === body.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Check if phone already exists
    const existingPhone = usersData.find((user) => user.phone === body.phone);
    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: "User with this phone number already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password, // In production, this should be hashed
      phone: body.phone,
      location: body.location || "",
    };

    usersData.push(newUser);
    await writeUsers(usersData);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    console.log("New user registered:", userWithoutPassword);

    return NextResponse.json(
      {
        success: true,
        data: userWithoutPassword,
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/user/register:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
