//create user
// get user with id
// get all users
// update user details
// delete user

import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/mockData.json";
import { User } from "@/lib/types/user";

export function GET(req: NextRequest) {
  const allUsers: User[] = JSON.parse(JSON.stringify(users)) as User[];
  // if there is no parameters in the url if it's just get /api/user then return all users
  if (req.nextUrl.searchParams.size === 0) {
    return NextResponse.json(allUsers);
  }
  // if search parameter has id, then we should return the user with id
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    return NextResponse.json(allUsers.find((user) => user.id === id));
  }
  return NextResponse.json(allUsers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newUser: User = JSON.parse(JSON.stringify(body)) as User;
  newUser.id = Date.now().toString();
  console.log("New user created: ", newUser);
  users.push(newUser);
  return NextResponse.json(newUser, { status: 201 });
}
