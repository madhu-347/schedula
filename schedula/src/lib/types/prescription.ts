export interface Prescription {
  createdAt: string;
  doctorDetails?: {
    id?: string; // ✅ Add this line
    name?: string;
    qualifications?: string;
    specialty?: string;
  };
  patientDetails?: {
    fullName?: string;
    age?: number;
    gender?: string;
  };
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
