// API Route: /api/user
// CRUD Operations: Create, Read, Update, Delete users

import { NextRequest, NextResponse } from "next/server";
import mockData from "@/lib/mockData.json";
import { User } from "@/lib/types/user";

// In-memory storage (simulating database)
// Note: This will reset on server restart. For persistence, use a real database.
const usersData: User[] = JSON.parse(JSON.stringify(mockData.users)) as User[];

// GET - Retrieve user(s)
export async function GET(req: NextRequest) {
  try {
    // If no parameters, return all users
    if (req.nextUrl.searchParams.size === 0) {
      return NextResponse.json({
        success: true,
        data: usersData,
        count: usersData.length,
      });
    }

    // api/user?id=123
    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      const user = usersData.find((user) => user.id === id);

      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: user,
      });
    }

    // If email parameter exists, find by email
    const email = req.nextUrl.searchParams.get("email");
    if (email) {
      const user = usersData.find((user) => user.email === email);

      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: user,
      });
    }

    return NextResponse.json({
      success: true,
      data: usersData,
      count: usersData.length,
    });
  } catch (error) {
    console.error("Error in GET /api/user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = usersData.find((user) => user.email === body.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
      phone: body.phone || "",
      location: body.location || "",
    };

    usersData.push(newUser);

    console.log("New user created:", newUser);

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT/PATCH - Update user details
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const userIndex = usersData.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Update user data
    usersData[userIndex] = {
      ...usersData[userIndex],
      ...updateData,
      id: id, // Ensure ID doesn't change
    };

    console.log("User updated:", usersData[userIndex]);

    return NextResponse.json({
      success: true,
      data: usersData[userIndex],
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error in PUT /api/user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (same as PUT in this case)
export async function PATCH(req: NextRequest) {
  return PUT(req);
}

// DELETE - Delete user
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const userIndex = usersData.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const deletedUser = usersData[userIndex];
    usersData.splice(userIndex, 1);

    console.log("User deleted:", deletedUser);

    return NextResponse.json({
      success: true,
      data: deletedUser,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
