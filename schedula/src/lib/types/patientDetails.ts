export interface PatientDetails {
  id: string;
  patientId: string;
  appointmentId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  weight: number;
  problem: string;
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
}
