import { useState, useEffect } from "react";

export default function usePrescriptionForm(initialPrescription: any) {
  const [vitals, setVitals] = useState({
    bp: "",
    pulse: "",
    temperature: "",
    spo2: "",
    weight: "",
  });

  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);

  const [tests, setTests] = useState([{ name: "" }]);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);

  // Prefill for edit mode
  useEffect(() => {
    if (initialPrescription) {
      setVitals(initialPrescription.vitals || {});
      setMedicines(initialPrescription.medicines || []);
      setTests(initialPrescription.tests || []);
      setNotes(initialPrescription.notes || "");
      setFiles(initialPrescription.files || []);
    }
  }, [initialPrescription]);

  return {
    vitals, setVitals,
    medicines, setMedicines,
    tests, setTests,
    notes, setNotes,
    files, setFiles
  };
}
