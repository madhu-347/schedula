export interface Appointment {
  id: string;
  tokenNo: string;
  patientId: string;
  doctorId: string;
  day: string;
  date: string;
  time: string;
  type?: "In-person" | "Virtual";
  queuePosition?: number;

  patientDetails?: {
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
  };

  visitType?: "Follow-up" | "Report" | "First";
  status: "Upcoming" | "Completed" | "Cancelled";
  paid?: boolean;
  feedback?: {
    consulting: number;
    hospital: number;
    waitingTime: number;
    wouldRecommend: boolean;
    feedbackText?: string;
    submittedAt: string;
  };
  postFeeling?: "Feeling Better" | "No improvements";
}
