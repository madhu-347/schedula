export interface Appointment {
  id: number;
  tokenNo: string;
  doctorName: string;
  doctorImage: string;
  specialty: string;
  qualification?: string;
  day: string;
  date: string;
  timeSlot: string;
  problem?: string;
  status: "Upcoming" | "Completed" | "Cancelled" | "Waiting";
  type?: "In-person" | "Online";
  paymentStatus: "Paid" | "Not paid";
  queuePosition?: number;
  expectedTime?: string;
  patientDetails: {
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
}
