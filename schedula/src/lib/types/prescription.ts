import { Appointment } from "./appointment";
import { Doctor } from "./doctor";
import { User } from "./user";
export interface Prescription {
  createdAt: string;
  id: string;
  appointmentId: string;
  patientId?: string;
  doctorId?: string;

  vitals: {
    bp?: string;
    pulse?: string;
    temperature?: string;
    spo2?: string;
    weight?: string;
  };
  medicines: {
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }[];
  tests?: { name: string }[];
  notes?: string;
  files?: { name: string; type?: string; dataUrl?: string }[];
}

export interface PrescriptionResponse extends Prescription {
  doctor: Doctor | null;
  patient: {
    id?: string | number;
    fullName: string;
    age: number;
    gender: "Male" | "Female" | "Other";
    phone: string;
    weight?: number;
    problem?: string;
    relationship:
      | "Self"
      | "Son"
      | "Daughter"
      | "Brother"
      | "Sister"
      | "Father"
      | "Mother"
      | "Spouse"
      | "Other";
    location?: string;
  } | null;
}
