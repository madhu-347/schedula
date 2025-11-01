import { User } from "@/lib/types/user";

export async function getAllUsers() {
  try {
    const response = await fetch("/api/user");
    console.log("response for get all users: ", response);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function createUser(user: User) {
  try {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user), //convert user object to JSON string
    });
    console.log("response for create user: ", response);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(user: User) {
  try {
    const response = await fetch(`/api/user/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    console.log("response for update user: ", response);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}
