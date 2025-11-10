// src/lib/types/appointment.ts

export interface Appointment {
  id: string;
  tokenNo: string;
  patientId: string;
  doctorId: string;

  // Added based on usage in your UI
  doctor?: {
    firstName?: string;
    lastName?: string;
    specialty?: string;
    qualifications?: string;
    image?: string;
  };

  day: string;
  date: string;
  time: string;
  timeSlot?: string;
  type?: "In-person" | "Virtual";
  queuePosition?: number;

  patientDetails?: {
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
  };

  visitType?: "Follow-up" | "Report" | "First";
  status: "Upcoming" | "Completed" | "Cancelled" | "Waiting";
  paid?: boolean;
  paymentStatus?: "Paid" | "Not paid";

  feedback?: {
    consulting: number;
    hospital: number;
    waitingTime: number;
    wouldRecommend: boolean;
    feedbackText?: string;
    submittedAt: string;
  };

  postFeeling?: "Feeling Better" | "No improvements";

  prescriptionId?: string;

  followUpOf?: string; // appointment id for which this is a follow-up
}
