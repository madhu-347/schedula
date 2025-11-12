import { User } from "@/lib/types/user";

export const userRegister = async (user: User) => {
  try {
    const response = await fetch("/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    const data = await response.json();
    console.log("response for user register: ", data);
    return data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const userLogin = async (email: string, password: string) => {
  try {
    const response = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    console.log("response for user login: ", data);
    return data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

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

export async function getUserById(id: string): Promise<{ data: User }> {
  try {
    const response = await fetch(`/api/user?id=${id}`);
    // if (!response.ok) {
    //   throw new Error("Network response was not ok " + response.statusText);
    // }

    const result = await response.json();

    // Normalize output: always return { data: User }
    if (result?.user) {
      return {
        data: { ...result.user, id: result.user.id || result.user._id || id },
      };
    }

    if (result?.data) {
      return {
        data: { ...result.data, id: result.data.id || result.data._id || id },
      };
    }

    return { data: { ...result, id: result.id || result._id || id } };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function updateUser(user: User) {
  try {
    const response = await fetch(`/api/user?id=${user.id}`, {
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

export const getProfile = async (id: string) => {
  try {
    const response = await fetch(`/api/user/profile?id=${id}`);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    console.log("response for get profile: ", data);
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const updateProfile = async (user: User) => {
  try {
    const response = await fetch(`/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    console.log("response for update profile: ", data);
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
