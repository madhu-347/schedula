import { Prescription } from "@/lib/types/prescription";
import { createNotification } from "./notifications.api";

// ✅ Create prescription
export async function createPrescription(p: Prescription) {
  console.log("Creating prescription:", p);
  const response = await fetch("/api/prescription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  const result = await response.json();
  console.log("Prescription created:", result);
  return result.data;
}

// ✅ Get prescription by prescription ID
export async function getPrescriptionById(id: string) {
  console.log("Getting prescription by ID:", id);
  const response = await fetch(`/api/prescription?id=${id}`);
  const result = await response.json();
  return result.success ? result.data : null;
}

// ✅ Get all prescriptions for a patient
export async function getPrescriptionByPatient(patientId: string) {
  const response = await fetch(`/api/prescription?patientId=${patientId}`);
  console.log("prescr response : ", response);
  const result = await response.json();
  console.log("prescriptions for patient", result);
  return result.data || [];
}

// ✅ Get all prescriptions for a doctor
export async function getPrescriptionByDoctor(doctorId: string) {
  const response = await fetch(`/api/prescription?doctorId=${doctorId}`);
  const result = await response.json();
  return result.data || [];
}

// ✅ Get prescriptions for an appointment
export async function getPrescriptionsByAppointmentId(appointmentId: string) {
  console.log("Fetching prescription for appointmentId:", appointmentId);
  const response = await fetch(
    `/api/prescription?appointmentId=${appointmentId}`
  );
  const result = await response.json();
  console.log("Prescription API response:", result);
  return result.success ? result : null;
}

// ✅ Get all prescriptions
export async function getAllPrescriptions() {
  const response = await fetch("/api/prescription");
  const result = await response.json();
  return result.data || [];
}

// ✅ Delete one prescription
export async function deletePrescription(id: string): Promise<boolean> {
  const response = await fetch(`/api/prescription?id=${id}`, {
    method: "DELETE",
  });
  const result = await response.json();
  return result.success;
}

// ✅ Update prescription
export async function updatePrescription(updated: Prescription) {
  const response = await fetch("/api/prescription", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });
  const result = await response.json();
  return result.data;
}
