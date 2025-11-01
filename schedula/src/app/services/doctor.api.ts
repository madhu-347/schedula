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
