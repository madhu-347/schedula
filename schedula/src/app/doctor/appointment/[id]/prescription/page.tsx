"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import { Plus, X, Upload, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { useAuth } from "@/context/AuthContext";
import { getAppointmentById } from "@/app/services/appointments.api";
import { getPrescriptionsByAppointmentId } from "@/app/services/prescription.api";
import usePrescriptionForm from "@/hooks/usePrescriptionForm";
import type { Appointment } from "@/lib/types/appointment";
import { createNotification } from "@/app/services/notifications.api";
import { createPrescription } from "@/app/services/prescription.api";
import Link from "next/link";

export default function PrescriptionFormPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { doctor } = useAuth();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const {
    vitals = { bp: "", pulse: "", temperature: "", spo2: "", weight: "" },
    setVitals,
    medicines,
    setMedicines,
    tests,
    setTests,
    notes,
    setNotes,
    files,
    setFiles,
  } = usePrescriptionForm(undefined);

  const validateForm = () => {
    let newErrors: any = {};

    // vitals
    if (!vitals.bp || !/^\d{2,3}\/\d{2,3}$/.test(vitals.bp))
      newErrors.bp = "Enter valid BP (eg: 120/80)";
    if (!vitals.pulse) newErrors.pulse = "Enter pulse (eg: 75)";
    if (!vitals.temperature) newErrors.temperature = "Enter temp (eg: 98.6°F)";
    if (!vitals.spo2) newErrors.spo2 = "Enter SpO₂ (eg: 98%)";
    if (!vitals.weight) newErrors.weight = "Enter weight (eg: 65kg)";

    // medicines
    medicines.forEach((m, i) => {
      // Name: required
      if (!m.name?.trim()) newErrors[`med-${i}-name`] = "Required";

      // Dosage: must include mg/ml/tablet
      if (!m.dosage?.trim()) newErrors[`med-${i}-dosage`] = "Required";
      else if (!/^\d+(\s?(mg|ml|tablet|tab|capsule|drop))$/i.test(m.dosage))
        newErrors[`med-${i}-dosage`] = "e.g. 500mg or 2 tablet";

      // Frequency: valid patterns
      if (!m.frequency?.trim()) newErrors[`med-${i}-frequency`] = "Required";
      else if (
        !/^(\d{1,2}\/day|\d{1,2}\s?times\/day|morning-evening|night|once daily|twice daily)$/i.test(
          m.frequency
        )
      )
        newErrors[`med-${i}-frequency`] = "e.g. 2/day, morning-evening";

      // Duration: must be like "5 days" or "2 weeks"
      if (!m.duration?.trim()) newErrors[`med-${i}-duration`] = "Required";
      else if (!/^(\d{1,2})\s?(day|days|week|weeks)$/i.test(m.duration))
        newErrors[`med-${i}-duration`] = "e.g. 5 days / 2 weeks";
    });
    // tests
    tests.forEach((t, i) => {
      if (!t.name.trim()) {
        newErrors[`test-${i}`] = "Enter test or remove row";
      } else if (!/^[a-zA-Z0-9\s\-()]+$/.test(t.name)) {
        newErrors[`test-${i}`] = "Invalid characters";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildErrors = () => {
    const newErrors: Record<string, string> = {};

    // BP (90/60 – 180/120)
    if (!vitals.bp) {
      newErrors.bp = "Blood pressure required";
    } else {
      const bpRegex = /^(\d{2,3})\/(\d{2,3})$/;
      if (!bpRegex.test(vitals.bp)) {
        newErrors.bp = "Format must be like 120/80";
      } else {
        const [sys, dia] = vitals.bp.split("/").map(Number);
        if (sys < 90 || sys > 180 || dia < 60 || dia > 120) {
          newErrors.bp = "Unrealistic BP value";
        }
      }
    }

    // Pulse (40–180)
    if (!vitals.pulse) newErrors.pulse = "Pulse required";
    else if (
      isNaN(Number(vitals.pulse)) ||
      Number(vitals.pulse) < 40 ||
      Number(vitals.pulse) > 180
    )
      newErrors.pulse = "Enter valid pulse (40-180)";

    // Temperature (94°F – 108°F or 34°C – 42°C)
    if (!vitals.temperature) newErrors.temperature = "Temperature required";
    else {
      const val = parseFloat(vitals.temperature);
      if (
        isNaN(val) ||
        !((val >= 94 && val <= 108) || (val >= 34 && val <= 42))
      ) {
        newErrors.temperature = "Enter valid temperature";
      }
    }

    // SpO₂ (70–100)
    if (!vitals.spo2) newErrors.spo2 = "SpO₂ required";
    else {
      const sp = parseInt(vitals.spo2);
      if (isNaN(sp) || sp < 70 || sp > 100)
        newErrors.spo2 = "Enter valid SpO₂ (70-100%)";
    }

    // Weight (1–300kg)
    if (!vitals.weight) newErrors.weight = "Weight required";
    else {
      const w = parseInt(vitals.weight);
      if (isNaN(w) || w < 1 || w > 300)
        newErrors.weight = "Enter valid weight (1-300kg)";
    }

    // medicines
    medicines.forEach((m, i) => {
      // Name: required
      if (!m.name?.trim()) newErrors[`med-${i}-name`] = "Required";

      // Dosage: must include mg/ml/tablet
      if (!m.dosage?.trim()) newErrors[`med-${i}-dosage`] = "Required";
      else if (!/^\d+(\s?(mg|ml|tablet|tab|capsule|drop))$/i.test(m.dosage))
        newErrors[`med-${i}-dosage`] = "e.g. 500mg or 2 tablet";

      // Frequency: valid patterns
      if (!m.frequency?.trim()) newErrors[`med-${i}-frequency`] = "Required";
      else if (
        !/^(\d{1,2}\/day|\d{1,2}\s?times\/day|morning-evening|night|once daily|twice daily)$/i.test(
          m.frequency
        )
      )
        newErrors[`med-${i}-frequency`] = "e.g. 2/day, morning-evening";

      // Duration: must be like "5 days" or "2 weeks"
      if (!m.duration?.trim()) newErrors[`med-${i}-duration`] = "Required";
      else if (!/^(\d{1,2})\s?(day|days|week|weeks)$/i.test(m.duration))
        newErrors[`med-${i}-duration`] = "e.g. 5 days / 2 weeks";
    });

    tests.forEach((t, i) => {
      if (!t.name.trim()) {
        newErrors[`test-${i}`] = "Enter test or remove row";
      } else if (!/^[a-zA-Z0-9\s\-()]+$/.test(t.name)) {
        newErrors[`test-${i}`] = "Invalid characters";
      }
    });

    return newErrors;
  };
  useEffect(() => {
    if (!submitted) return; // ✅ don't validate until submit clicked

    const e = buildErrors();
    setErrors(e);
    setIsFormValid(Object.keys(e).length === 0);
  }, [submitted, vitals, medicines, tests]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const appt = await getAppointmentById(String(id));

        //  Fetch prescriptions for this appointment
        const prescriptions = await getPrescriptionsByAppointmentId(String(id));
        const latestRx =
          prescriptions && prescriptions.length > 0
            ? prescriptions[prescriptions.length - 1]
            : null;

        setAppointment({
          ...appt,
          prescription: latestRx || null,
        });
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to load appointment data.",
          variant: "destructive",
        });
      }
    })();
  }, [id]);

  const addMedicine = () =>
    setMedicines([
      ...medicines,
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
  const removeMedicine = (i: number) =>
    setMedicines(medicines.filter((_, idx) => idx !== i));
  const addTest = () => setTests([...tests, { name: "" }]);
  const removeTest = (i: number) =>
    setTests(tests.filter((_, idx) => idx !== i));

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);

    const prepared = await Promise.all(
      incoming.map(
        async (file) =>
          ({
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: await new Promise<string>((res, rej) => {
              const r = new FileReader();
              r.onload = () => res(r.result as string);
              r.onerror = (err) => rej(err);
              r.readAsDataURL(file);
            }),
          } as {
            name: string;
            type: string;
            size: number;
            dataUrl: string;
          })
      )
    );

    setFiles((prevFiles) => [...prevFiles, ...prepared]);
  };

  const isEdit = false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) return;

    setSaving(true);

    try {
      const prescriptionData = await createPrescription({
        appointmentId: id,
        patientId: appointment?.patientId,
        doctorId: doctor?.id,
        vitals,
        medicines,
        tests,
        notes,
        files: files.map((f) => ({ name: f.name })),
      } as any);

      console.log("Prescription created:", prescriptionData);

      // Send notification to patient
      if (appointment?.patientId && doctor) {
        try {
          const notification = {
            recipientId: appointment.patientId,
            recipientRole: "user",
            title: "New Prescription",
            message: isEdit
              ? "Your prescription has been updated."
              : "A new prescription has been added by your doctor.",
            type: "prescription",
            targetUrl: `/user/prescription/${prescriptionData.id}`,
            relatedId: prescriptionData.id,
          };

          await createNotification(notification as any);
        } catch (notificationError) {
          console.error("Failed to send notification:", notificationError);
          // Don't fail the whole operation if notification fails
        }
      }

      toast({
        title: isEdit ? "Prescription Updated " : "Prescription Saved ",
        description: "Changes have been stored.",
      });

      router.push(`/doctor/appointment/${id}/prescription/view`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Save failed",
        description: "Could not save prescription. Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const inputErrorClass = (key: string) =>
    errors[key] ? "border-red-500 focus:border-red-500 focus:ring-red-400" : "";

  if (!appointment) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/doctor/dashboard"
              className="p-2 -ml-2 rounded-full hover:bg-cyan-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold ">
                {isEdit ? "Edit Prescription" : "Add Prescription"}
              </h1>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Vitals */}
          <div className="bg-white p-4 rounded-lg shadow border space-y-2">
            <h2 className="text-sm font-medium mb-1">Vitals</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <label className="text-gray-600 w-15">BP</label>
                <div className="flex flex-col">
                  <InputFieldComponent
                    type="text"
                    placeholder="120/80"
                    value={vitals.bp}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^\d]/g, ""); // numbers only
                      if (val.length > 3)
                        val = val.slice(0, 3) + "/" + val.slice(3);
                      setVitals({ ...vitals, bp: val });
                    }}
                    className={`${inputErrorClass("bp")}`}
                  />
                  {errors.bp && (
                    <p className="text-red-500 text-xs">{errors.bp}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <label className=" text-gray-600 w-15">Pulse</label>
                <div className="flex flex-col">
                  <InputFieldComponent
                    type="text"
                    placeholder="75"
                    value={vitals.pulse}
                    onChange={(e) =>
                      setVitals({ ...vitals, pulse: e.target.value })
                    }
                    className={`${inputErrorClass("pulse")}`}
                  />
                  {submitted && errors.pulse && (
                    <p className="text-xs text-red-500">{errors.pulse}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <label className=" text-gray-600 w-15">Temp</label>
                <div className="flex flex-col">
                  <InputFieldComponent
                    type="text"
                    placeholder="98.6°F"
                    value={vitals.temperature}
                    onChange={(e) =>
                      setVitals({ ...vitals, temperature: e.target.value })
                    }
                    className={`${inputErrorClass("temperature")}`}
                  />
                  {submitted && errors.temperature && (
                    <p className="text-xs text-red-500">{errors.temperature}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <label className=" text-gray-600 w-15">SpO₂</label>
                <div className="flex flex-col">
                  <InputFieldComponent
                    type="text"
                    placeholder="98%"
                    value={vitals.spo2}
                    onChange={(e) =>
                      setVitals({ ...vitals, spo2: e.target.value })
                    }
                    className={`${inputErrorClass("spo2")}`}
                  />
                  {submitted && errors.spo2 && (
                    <p className="text-xs text-red-500">{errors.spo2}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <label className=" text-gray-600 w-15">Wt</label>
                <div className="flex flex-col">
                  <InputFieldComponent
                    type="text"
                    placeholder="65kg"
                    value={vitals.weight}
                    onChange={(e) =>
                      setVitals({ ...vitals, weight: e.target.value })
                    }
                    className={`${inputErrorClass("weight")}`}
                  />
                  {submitted && errors.weight && (
                    <p className="text-xs text-red-500">{errors.weight}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Medicines */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex justify-between">
              <h2 className="font-medium mb-2">Medicines</h2>
              <Button type="button" size="sm" onClick={addMedicine}>
                <Plus className="w-4" />
              </Button>
            </div>
            {medicines.map((m, i) => (
              <div key={i} className="rounded-lg p-3 space-y-3 mb-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    Medicine Name
                  </label>
                  <InputFieldComponent
                    type="text"
                    placeholder="Paracetamol"
                    value={m.name}
                    className={`${inputErrorClass(`med-${i}-name`)}`}
                    onChange={(e) =>
                      setMedicines(
                        medicines.map((x, idx) =>
                          idx === i ? { ...x, name: e.target.value } : x
                        )
                      )
                    }
                  />
                  {errors[`med-${i}-name`] && (
                    <p className="text-xs text-red-500">
                      {errors[`med-${i}-name`]}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      Dosage
                    </label>
                    <InputFieldComponent
                      type="text"
                      placeholder="500mg"
                      value={m.dosage}
                      onChange={(e) =>
                        setMedicines(
                          medicines.map((x, idx) =>
                            idx === i ? { ...x, dosage: e.target.value } : x
                          )
                        )
                      }
                    />
                    {errors[`med-${i}-dosage`] && (
                      <p className="text-xs text-red-500">
                        {errors[`med-${i}-dosage`]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      Frequency
                    </label>
                    <InputFieldComponent
                      type="text"
                      placeholder="2/day"
                      value={m.frequency}
                      onChange={(e) =>
                        setMedicines(
                          medicines.map((x, idx) =>
                            idx === i ? { ...x, frequency: e.target.value } : x
                          )
                        )
                      }
                    />
                    {errors[`med-${i}-frequency`] && (
                      <p className="text-xs text-red-500">
                        {errors[`med-${i}-frequency`]}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      Duration
                    </label>
                    <InputFieldComponent
                      type="text"
                      placeholder="5 days"
                      value={m.duration}
                      onChange={(e) =>
                        setMedicines(
                          medicines.map((x, idx) =>
                            idx === i ? { ...x, duration: e.target.value } : x
                          )
                        )
                      }
                    />
                    {errors[`med-${i}-duration`] && (
                      <p className="text-xs text-red-500">
                        {errors[`med-${i}-duration`]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      Instructions
                    </label>
                    <InputFieldComponent
                      type="text"
                      placeholder="After food"
                      value={m.instructions}
                      onChange={(e) =>
                        setMedicines(
                          medicines.map((x, idx) =>
                            idx === i
                              ? { ...x, instructions: e.target.value }
                              : x
                          )
                        )
                      }
                    />
                    {errors[`med-${i}-name`] && (
                      <p className="text-xs text-red-500">
                        {errors[`med-${i}-name`]}
                      </p>
                    )}
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
              <Button type="button" size="sm" onClick={addTest}>
                +
              </Button>
            </div>
            {tests.map((t, i) => (
              <div key={i} className="flex gap-3 items-center mb-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600">
                    Test Name
                  </label>
                  <InputFieldComponent
                    type="text"
                    placeholder="CBC / X-Ray"
                    value={t.name}
                    className={`${inputErrorClass(`test-${i}`)}`}
                    onChange={(e) =>
                      setTests(
                        tests.map((x, idx) =>
                          idx === i ? { name: e.target.value } : x
                        )
                      )
                    }
                  />
                  {errors[`test-${i}`] && (
                    <p className="text-xs text-red-500">
                      {errors[`test-${i}`]}
                    </p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeTest(i)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <h2 className="font-medium mb-2">Doctor Notes</h2>
            <InputFieldComponent
              type="textarea"
              rows={4}
              placeholder="Example: Drink water, avoid cold food..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Attachments */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <h2 className="font-medium mb-2">Attachments</h2>
            <label className="border p-2 rounded cursor-pointer block w-max bg-gray-50">
              <Upload className="w-5 inline-block mr-2" />
              Upload Files
              <InputFieldComponent
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {files.map((f, i) => (
                  <div key={i} className="border p-1 rounded">
                    {f.type?.startsWith("image/") && f.dataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.dataUrl}
                        alt={f.name}
                        className="h-24 w-full object-cover rounded"
                      />
                    ) : (
                      <div className="text-xs text-center pt-8">{f.name}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={saving} className="w-full mt-6">
            {saving
              ? "Saving..."
              : isEdit
              ? "Update Prescription"
              : "Save Prescription"}
          </Button>
        </form>
      </div>
    </div>
  );
}
