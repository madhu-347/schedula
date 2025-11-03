"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import { Plus, X, Upload } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { useAuth } from "@/context/AuthContext";
import { getAppointmentById, updateAppointment } from "@/app/services/appointments.api";
import usePrescriptionForm from "@/hooks/usePrescriptionForm";

export default function PrescriptionFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const { doctor } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const appt = await getAppointmentById(String(id));
      setAppointment(appt);
    })();
  }, [id]);

  const {
    vitals, setVitals,
    medicines, setMedicines,
    tests, setTests,
    notes, setNotes,
    files, setFiles
  } = usePrescriptionForm(appointment?.prescription);

  // Add Medicine
  const addMedicine = () => setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  const removeMedicine = (i: number) => setMedicines(medicines.filter((_, idx) => idx !== i));

  // Add Test
  const addTest = () => setTests([...tests, { name: "" }]);
  const removeTest = (i: number) => setTests(tests.filter((_, idx) => idx !== i));

  // Files
  const handleFileUpload = async (e: any) => {
    const incoming = Array.from(e.target.files || []);
    const prepared = await Promise.all(
      incoming.map(async (file: any) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: await new Promise(res => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.readAsDataURL(file);
        })
      }))
    );
    setFiles([...files, ...prepared]);
  };

  const isEdit = Boolean(appointment?.prescription);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      appointmentId: id,
      patientDetails: appointment?.patientDetails,
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

    await updateAppointment(String(id), { prescription: payload });

    toast({
      title: isEdit ? "Prescription Updated ✅" : "Prescription Saved ✅",
      description: "Changes have been stored.",
    });

    router.push("/doctor/appointments");
  };

  if (!appointment) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Prescription" : "Add Prescription"}
      </h1>

      <form className="space-y-6" onSubmit={handleSubmit}>

        {/* Vitals */}
        <div className="bg-white p-4 rounded-lg shadow border space-y-2">
            <h2 className="text-sm font-medium mb-1">Vitals</h2>

            <div className="grid grid-cols-2 gap-2">

                {/* BP */}
                <div className="flex items-center gap-1">
                <label className="text-gray-600 w-15">BP</label>
                <InputFieldComponent
                    type="text"
                    placeholder="120/80"
                    value={vitals.bp}
                    onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                />
                </div>

                {/* Pulse */}
                <div className="flex items-center gap-1">
                <label className=" text-gray-600 w-15">Pulse</label>
                <InputFieldComponent
                    type="text"   
                    placeholder="75"
                    value={vitals.pulse}
                    onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                />
                </div>

                {/* Temperature */}
                <div className="flex items-center gap-1">
                <label className=" text-gray-600 w-15">Temp</label>
                <InputFieldComponent
                    type="text"
                    placeholder="98.6°F"
                    value={vitals.temperature}
                    onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                />
                </div>

                {/* SpO2 */}
                <div className="flex items-center gap-1">
                <label className=" text-gray-600 w-15">SpO₂</label>
                <InputFieldComponent
                    type="text"
                    placeholder="98%"
                    value={vitals.spo2}
                    onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                />
                </div>

                {/* Weight */}
                <div className="flex items-center gap-1">
                <label className=" text-gray-600 w-15">Wt</label>
                <InputFieldComponent
                    type="text"
                    placeholder="65kg"
                    value={vitals.weight}
                    onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                />
                </div>

            </div>
            </div>


        {/* Medicines */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between">
            <h2 className="font-medium mb-2">Medicines</h2>
            <Button type="button" size="sm" onClick={addMedicine}><Plus className="w-4" /></Button>
          </div>

         {medicines.map((m, i) => (
            <div key={i} className=" rounded-lg p-3 space-y-3 mb-3">

                {/* Medicine Name */}
                <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Medicine Name</label>
                <InputFieldComponent
                    type="text"
                    placeholder="Paracetamol"
                    value={m.name}
                    onChange={(e) =>
                    setMedicines(medicines.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))
                    }
                />
                </div>

                <div className="grid grid-cols-2 gap-2">
                {/* Dosage */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Dosage</label>
                    <InputFieldComponent
                     type="text"
                    placeholder="500mg"
                    value={m.dosage}
                    onChange={(e) =>
                        setMedicines(medicines.map((x, idx) => idx === i ? { ...x, dosage: e.target.value } : x))
                    }
                    />
                </div>

                {/* Frequency */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Frequency</label>
                    <InputFieldComponent
                        type="text"
                        placeholder="2 times/day"
                        value={m.frequency}
                        onChange={(e) =>
                        setMedicines(medicines.map((x, idx) => idx === i ? { ...x, frequency: e.target.value } : x))
                    }
                    />
                </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                {/* Duration */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Duration</label>
                    <InputFieldComponent
                     type="text"
                    placeholder="5 days"
                    value={m.duration}
                    onChange={(e) =>
                        setMedicines(medicines.map((x, idx) => idx === i ? { ...x, duration: e.target.value } : x))
                    }
                    />
                </div>

                {/* Instructions */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Instructions</label>
                    <InputFieldComponent
                     type="text"
                    placeholder="After food"
                    value={m.instructions}
                    onChange={(e) =>
                        setMedicines(medicines.map((x, idx) => idx === i ? { ...x, instructions: e.target.value } : x))
                    }
                    />
                </div>
                </div>

                <button
                type="button"
                onClick={() => removeMedicine(i)}
                className="text-red-600 text-xs font-medium hover:underline"
                >
                Remove Medicine
                </button>

            </div>
            ))}
        </div>

        {/* Tests */}
        <div className="bg-white p-4 rounded-lg shadow border space-y-3">
        <div className="flex justify-between items-center">
            <h2 className="font-medium mb-2">Test Suggestions</h2>
            <Button type="button" size="sm" onClick={addTest}>+</Button>
        </div>

        {tests.map((t, i) => (
            <div key={i} className="flex gap-3 items-center mb-2">
            <div className="flex-1">
                <label className="text-xs font-medium text-gray-600">Test Name</label>
                <InputFieldComponent
                placeholder="CBC, Thyroid, X-Ray"
                value={t.name}
                onChange={(e) =>
                    setTests(tests.map((x, idx) => idx === i ? { name: e.target.value } : x))
                }
                />
            </div>

            <Button variant="destructive" size="sm" onClick={() => removeTest(i)}>
                ✕
            </Button>
            </div>
        ))}
        </div>


        {/* Notes */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h2 className="font-medium mb-2">Doctor Notes</h2>
          <InputFieldComponent type="textarea" rows={4} placeholder="Example: Drink water, avoid cold food..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {/* Attachments */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h2 className="font-medium mb-2">Attachments</h2>
          <label className="border p-2 rounded cursor-pointer block w-max bg-gray-50">
            <Upload className="w-5 inline-block mr-2"/>Upload Files
            <InputFieldComponent type="file" multiple className="hidden" onChange={handleFileUpload}/>
          </label>

          {!!files.length && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {files.map((f:any,i:number)=>(
                <div key={i} className="border p-1 rounded">
                  {f.type?.startsWith("image/") ?
                    <img src={f.dataUrl} className="h-24 w-full object-cover rounded"/> :
                    <div className="text-xs text-center pt-8">{f.name}</div>
                  }
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={saving} className="w-full mt-6">
          {saving ? "Saving..." : isEdit ? "Update Prescription" : "Save Prescription"}
        </Button>
      </form>
    </div>
  );
}
