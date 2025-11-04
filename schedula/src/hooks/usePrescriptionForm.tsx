// src/hooks/usePrescriptionForm.tsx
import { useState, useEffect } from "react";
import { Prescription } from "@/lib/types/prescription";

// --- Define types for the form state ---
// Make all properties optional to match backend model
interface Vitals {
  bp?: string;
  pulse?: string;
  temperature?: string;
  spo2?: string;
  weight?: string;
}

interface Medicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

interface Test {
  name: string;
}

// Match Prescription.files shape but allow missing size
interface AttachedFile {
  name: string;
  type?: string;
  size?: number;
  dataUrl?: string;
}
// --- End types ---

export default function usePrescriptionForm(initialPrescription?: Prescription) {
  const [vitals, setVitals] = useState<Vitals>({
    bp: "",
    pulse: "",
    temperature: "",
    spo2: "",
    weight: "",
  });
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);

  const [tests, setTests] = useState<Test[]>([{ name: "" }]);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<AttachedFile[]>([]);

  // Prefill for edit mode
  useEffect(() => {
  if (initialPrescription) {
    // Defer state updates to avoid React’s “synchronous setState” warning
    queueMicrotask(() => {
      setVitals({
        bp: initialPrescription.vitals?.bp ?? "",
        pulse: initialPrescription.vitals?.pulse ?? "",
        temperature: initialPrescription.vitals?.temperature ?? "",
        spo2: initialPrescription.vitals?.spo2 ?? "",
        weight: initialPrescription.vitals?.weight ?? "",
      });

      setMedicines(
        initialPrescription.medicines?.map((m) => ({
          name: m.name,
          dosage: m.dosage ?? "",
          frequency: m.frequency ?? "",
          duration: m.duration ?? "",
          instructions: m.instructions ?? "",
        })) ?? [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }]
      );

      setTests(initialPrescription.tests ?? [{ name: "" }]);
      setNotes(initialPrescription.notes ?? "");
      setFiles(
        initialPrescription.files?.map((f) => ({
          name: f.name,
          type: f.type ?? "",
          dataUrl: f.dataUrl ?? "",
          size: 0,
        })) ?? []
      );
    });
  }
}, [initialPrescription]);


  return {
    vitals,
    setVitals,
    medicines,
    setMedicines,
    tests,
    setTests,
    notes,
    setNotes,
    files,
    setFiles,
  };
}
