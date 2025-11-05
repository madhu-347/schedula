import {
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
} from "./appointments.api";

export const getPrescriptionByPatient  = async (patientId: string) => {
  const appointments = await getAppointmentsByPatient(patientId);
  if (!appointments.length) return [];

  const prescriptions = await Promise.all(
    appointments.map(async (appt) => {
      const rx = await getPrescriptionsByAppointmentId(appt.id);
      return rx?.length ? rx[rx.length - 1] : null; // latest prescription only
    })
  );

  return prescriptions.filter(Boolean); // Remove nulls
};
import { Prescription } from "@/lib/types/prescription";

const LS_KEY = "prescriptions";

function loadPrescriptions(): Prescription[] {
  return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
}

function savePrescriptions(data: Prescription[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// ✅ Create prescription
export function createPrescription(p: Prescription) {
  const all = loadPrescriptions();
  all.push(p);
  savePrescriptions(all);
  return p;
}

// ✅ Get prescriptions for an appointment
export function getPrescriptionsByAppointmentId(appointmentId: string) {
  const all = loadPrescriptions();
  return all.filter(p => p.appointmentId === appointmentId);
}

// ✅ Delete one prescription
export function deletePrescription(id: string): boolean {
  const all = loadPrescriptions();
  const updated = all.filter((p) => p.id !== id);
  savePrescriptions(updated);

  return true; 
}
// ✅ Update prescription
export function updatePrescription(updated: Prescription) {
  const all = loadPrescriptions();
  const idx = all.findIndex(p => p.id === updated.id);
  if (idx !== -1) {
    all[idx] = updated;
    savePrescriptions(all);
  }
}
