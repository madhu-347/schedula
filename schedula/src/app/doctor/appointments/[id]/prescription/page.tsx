"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import { toast } from "@/hooks/useToast";
import { Plus, X, Upload } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { getAppointmentById, updateAppointment } from "@/app/services/appointments.api";

export default function PrescriptionPage() {
  const { doctor } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);

console.log("prescription for appointment:", id);

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
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const addTest = () => setTests([...tests, { name: "" }]);
  const removeTest = (index: number) => setTests(tests.filter((_, i) => i !== index));

  const handleFileUpload = (e: any) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handleSubmit = async (e: any) => {
  e.preventDefault();
  if (!appointment){ 
    console.error("No appointment data available.");
    return};

  // Build prescription object
  const prescriptionData = {
    appointmentId: appointment.id,
    patientDetails: appointment.patientDetails,
    doctorDetails: {
      id: doctor?.id,
      name: `${doctor?.firstName} ${doctor?.lastName}`,
    },
    vitals,
    medicines,
    tests,
    notes,
    files,
    createdAt: new Date().toISOString(),
  };

  setSaving(true);

  try {
    const response = await updateAppointment(appointment.id, {
      // ✅ storing prescription INSIDE appointment
      ...appointment,
      prescription: prescriptionData,
    });

    if (response?.success) {
      toast({
        title: "Prescription Saved ✅",
        description: "This prescription has been added to the appointment record.",
      });
      router.push("/doctor/appointments");
      return;
      // Mark locally
      setAppointment((prev: any) => ({
        ...prev,
        prescription: prescriptionData,
      }));
    } else {
      throw new Error("Save failed");
    }
  } catch (err) {
    toast({
      title: "Error",
      description: "Unable to save prescription. Try again.",
      variant: "destructive",
    });
  }

  setSaving(false);
};
  useEffect(() => {
  async function loadData() {
    const appt = await getAppointmentById(id as string);
    setAppointment(appt);
  }
  loadData();
}, [id]);


  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Add Prescription</h1>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Vitals */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Patient Vitals</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InputFieldComponent type="text" placeholder="BP (mmHg)" value={vitals.bp} onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}/>
            <InputFieldComponent type="text" placeholder="Pulse (bpm)" value={vitals.pulse} onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}/>
            <InputFieldComponent type="text" placeholder="Temperature (°F)" value={vitals.temperature} onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}/>
            <InputFieldComponent type="text" placeholder="SpO₂ (%)" value={vitals.spo2} onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}/>
            <InputFieldComponent type="text" placeholder="Weight (kg)" value={vitals.weight} onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}/>
          </div>
        </div>

        {/* Medicines */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Medicines</h2>
            <Button size="sm" onClick={addMedicine}><Plus className="w-4 h-4 mr-1" />Add</Button>
          </div>

          {medicines.map((med, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 border-b pb-4">
              <InputFieldComponent type="text" placeholder="Medicine Name" value={med.name} onChange={(e) => setMedicines(medicines.map((m, i) => i === index ? { ...m, name: e.target.value } : m))}/>
              <InputFieldComponent type="text"placeholder="Dosage (mg)" value={med.dosage} onChange={(e) => setMedicines(medicines.map((m, i) => i === index ? { ...m, dosage: e.target.value } : m))}/>
              <InputFieldComponent type="text"placeholder="Frequency (2x/day)" value={med.frequency} onChange={(e) => setMedicines(medicines.map((m, i) => i === index ? { ...m, frequency: e.target.value } : m))}/>
              <InputFieldComponent type="text" placeholder="Duration (5 days)" value={med.duration} onChange={(e) => setMedicines(medicines.map((m, i) => i === index ? { ...m, duration: e.target.value } : m))}/>
              <InputFieldComponent type="text" placeholder="Instructions" value={med.instructions} onChange={(e) => setMedicines(medicines.map((m, i) => i === index ? { ...m, instructions: e.target.value } : m))}/>
              <Button variant="destructive" size="icon" onClick={() => removeMedicine(index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Tests */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recommended Tests</h2>
            <Button size="sm" onClick={addTest}><Plus className="w-4 h-4 mr-1" />Add</Button>
          </div>

          {tests.map((test, index) => (
            <div key={index} className="flex gap-2 mb-3">
              <InputFieldComponent type="text" placeholder="Test Name" value={test.name} onChange={(e) => setTests(tests.map((t, i) => i === index ? { ...t, name: e.target.value } : t))}/>
              <Button variant="destructive" size="icon" onClick={() => removeTest(index)}><X className="w-4 h-4"/></Button>
            </div>
          ))}
        </div>

        {/* File attachments */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-3">Upload Reports / X-Rays</h2>
          <label className="border p-3 rounded-lg flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100">
            <Upload className="w-5 h-5" />
            <span>Upload Files</span>
            <input type="file" multiple className="hidden" onChange={handleFileUpload}/>
          </label>

          <div className="mt-3 space-y-2">
            {files.map((file, i) => (
              <p key={i} className="text-sm text-gray-600">{file.name}</p>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-3">Doctor Notes</h2>
          <InputFieldComponent type="textarea" rows={4} placeholder="Write clinical notes..." value={notes} onChange={(e) => setNotes(e.target.value)}/>
        </div>
        <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Prescription"}
        </Button>
      </form>
    </div>
  );
}
