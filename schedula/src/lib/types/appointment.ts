export interface Appointment {
  id: number;
  tokenNo: string;
  doctorName: string;
  doctorImage: string;
  specialty: string;
  day: string;
  date: string;
  timeSlot: string;
  status: "Upcoming" | "Completed" | "Canceled";
  paymentStatus: "Paid" | "Not paid";
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
  };
}
