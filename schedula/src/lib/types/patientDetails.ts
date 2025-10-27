export interface PatientDetails {
  fullName: string;
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
