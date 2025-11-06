import { Prescription } from "@/lib/types/prescription";

// ✅ Create prescription
export async function createPrescription(p: Prescription) {
  const response = await fetch("/api/prescription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  const result = await response.json();
  return result.data;
}

// ✅ Get prescription by prescription ID
export async function getPrescriptionById(id: string) {
  const response = await fetch(`/api/prescription?id=${id}`);
  const result = await response.json();
  return result.success ? result.data : null;
}

// ✅ Get all prescriptions for a patient
export async function getPrescriptionByPatient(patientId: string) {
  const response = await fetch(`/api/prescription?patientId=${patientId}`);
  const result = await response.json();
  console.log("prescriptions for patient", result.data);
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
  // Since the API doesn't have a direct endpoint for appointmentId,
  // we'll fetch all prescriptions and filter client-side
  const allPrescriptions = await getAllPrescriptions();
  return allPrescriptions.filter(
    (p: Prescription) => p.appointmentId === appointmentId
  );
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
