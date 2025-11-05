import {
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
} from "./appointments.api";
import { Appointment } from "@/lib/types/appointment";

export const getPrescriptionByPatient = async (patientId: string) => {
  const appointments: Appointment[] = await getAppointmentsByPatient(patientId);
  if (appointments.length === 0) return null; // Return null if no appointments found
  return appointments.map((appointment) => appointment.prescription || null);
};
