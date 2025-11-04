// get all doctors
// create doctor
// update doctor
// delete doctor
// get doctor by id
"use client";

export async function getAllDoctors() {
  try {
    const res = await fetch(`/api/doctor`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch doctors");
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
}

export async function getDoctorById(id: string) {
  try {
    const res = await fetch(`/api/doctor?id=${id}`, {
      cache: "no-store",
    });
    // console.log("response from getDoctorById", res);
    if (!res.ok) {
      throw new Error("Failed to fetch doctor");
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching doctor:", error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateDoctor(id: string, doctorData: any) {
  try {
    const res = await fetch(`/api/doctor`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...doctorData }),
    });

    if (!res.ok) {
      throw new Error("Failed to update doctor");
    }

    return res.json();
  } catch (error) {
    console.error("Error updating doctor:", error);
    throw error;
  }
}
