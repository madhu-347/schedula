export interface Prescription {
  createdAt: string;
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
 

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
