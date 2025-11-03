"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAppointmentById } from "@/app/services/appointments.api";
import jsPDF from "jspdf";
import { Download } from "lucide-react";

/**
 * User Prescription View
 * - Sky-blue outer card
 * - White inner blocks
 * - Attachments inline (images) / downloadable (other files)
 * - Download PDF button (includes inline images when dataUrl present)
 */

export default function UserPrescriptionView() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const appt = await getAppointmentById(String(id));
        setAppointment(appt);
      } catch (err) {
        console.error("Failed to load appointment", err);
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!appointment) return <p className="p-6">Appointment not found</p>;

  const prescription = appointment?.prescription;
  if (!prescription) return <p className="p-6">No prescription available for this appointment</p>;

  const doctorName = prescription.doctorDetails?.name ?? appointment?.doctor?.name ?? "Doctor";
  const patientName = prescription.patientDetails?.fullName ?? appointment?.patient?.name ?? "Patient";
  const createdAt = prescription.createdAt ?? new Date().toISOString();

  const safe = (v: any) => (v !== undefined && v !== null ? v : "");

  const isDataUrl = (s: string) => typeof s === "string" && s.startsWith("data:");
  const isHttpUrl = (s: string) => typeof s === "string" && (s.startsWith("http://") || s.startsWith("https://"));

  // Generate PDF. Includes text sections and attempts to embed image files if present as data URLs or remote images.
  const downloadPDF = async () => {
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      let y = 48;

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Prescription Details", margin, y);
      y += 24;

      // Header row: Doctor + Date (right aligned)
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Doctor: ${doctorName}`, margin, y);
      const dateText = `Date: ${new Date(createdAt).toLocaleString()}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, pageWidth - margin - dateWidth, y);
      y += 20;

      // Patient row
      doc.text(`Patient: ${patientName}`, margin, y);
      const apptIdText = `Appointment ID: ${appointment?.id ?? ""}`;
      const apptIdWidth = doc.getTextWidth(apptIdText);
      doc.text(apptIdText, pageWidth - margin - apptIdWidth, y);
      y += 18;

      // Divider
      y += 6;
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 14;

      // Vitals
      doc.setFont("helvetica", "bold");
      doc.text("Vitals", margin, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      const vitals = prescription.vitals ?? {};
      const vitalsList = [
        `BP: ${safe(vitals.bp)}`,
        `Pulse: ${safe(vitals.pulse)}`,
        `Temperature: ${safe(vitals.temperature)}`,
        `SpO₂: ${safe(vitals.spo2)}`,
        `Weight: ${safe(vitals.weight)}`
      ];
      // print two columns if space allows
      const colGap = 220;
      for (let i = 0; i < vitalsList.length; i += 2) {
        const left = vitalsList[i];
        const right = vitalsList[i + 1] ?? "";
        doc.text(left, margin, y);
        if (right) doc.text(right, margin + colGap, y);
        y += 14;
      }

      y += 8;
      doc.setDrawColor(230);
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;

      // Medicines
      doc.setFont("helvetica", "bold");
      doc.text("Medicines", margin, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      const medicines = Array.isArray(prescription.medicines) ? prescription.medicines : [];
      if (medicines.length === 0) {
        doc.text("No medicines prescribed.", margin, y);
        y += 14;
      } else {
        medicines.forEach((m: any, idx: number) => {
          const line = `${idx + 1}. ${safe(m.name)}${m.dosage ? ` — ${safe(m.dosage)}` : ""}${m.frequency ? `, ${safe(m.frequency)}` : ""}${m.duration ? `, ${safe(m.duration)}` : ""}`;
          // wrap text if needed
          const split = doc.splitTextToSize(line, pageWidth - margin * 2);
          doc.text(split, margin, y);
          y += split.length * 12 + 6;
          // page break if near bottom
          if (y > doc.internal.pageSize.getHeight() - 100) {
            doc.addPage();
            y = 60;
          }
        });
      }

      y += 6;
      doc.setDrawColor(230);
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;

      // Tests
      doc.setFont("helvetica", "bold");
      doc.text("Test Suggestions", margin, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      const tests = Array.isArray(prescription.tests) ? prescription.tests : [];
      if (tests.length === 0) {
        doc.text("No tests suggested.", margin, y);
        y += 14;
      } else {
        tests.forEach((t: any, i: number) => {
          const text = `• ${safe(t.name)}`;
          const split = doc.splitTextToSize(text, pageWidth - margin * 2);
          doc.text(split, margin, y);
          y += split.length * 12 + 6;
        });
      }

      y += 6;
      doc.setDrawColor(230);
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;

      // Notes
      if (prescription.notes) {
        doc.setFont("helvetica", "bold");
        doc.text("Doctor Notes", margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        const notesSplit = doc.splitTextToSize(String(prescription.notes), pageWidth - margin * 2);
        doc.text(notesSplit, margin, y);
        y += notesSplit.length * 12 + 8;
      }

      // Attachments - list filenames and try to embed images (data URLs or http images)
      const files = Array.isArray(prescription.files) ? prescription.files : [];
      if (files.length > 0) {
        doc.setDrawColor(230);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;
        doc.setFont("helvetica", "bold");
        doc.text("Attachments", margin, y);
        y += 16;
        for (const file of files) {
          const name = file.name ?? "file";
          // Show filename
          doc.setFont("helvetica", "normal");
          doc.text(`• ${name}`, margin, y);
          y += 14;

          // If it's an image and we have a dataUrl or http url, try to embed
          const url = file.dataUrl ?? file.url ?? file.data ?? null;
          const type = file.type ?? (typeof url === "string" && url.startsWith("data:") ? url.split(";")[0].replace("data:", "") : "");
          if (url && (isDataUrl(url) || isHttpUrl(url)) && (type.startsWith("image/") || isDataUrl(url))) {
            try {
              // Add small inline image if fits
              const maxImgW = pageWidth - margin * 2;
              const imgY = y;
              // we try to add an image with width 300pt max
              const imgW = Math.min(300, maxImgW);
              const imgH = 160; // approximate; doc.addImage will preserve ratio from dataURL
              // If the URL is remote http(s) and not a data url, we attempt to fetch it as blob and convert to dataURL
              let dataUrl = url;
              if (isHttpUrl(url) && !isDataUrl(url)) {
                // fetch remote image and convert to base64
                try {
                  const res = await fetch(url);
                  const blob = await res.blob();
                  const reader = await new Promise<string | null>((resolve) => {
                    const r = new FileReader();
                    r.onload = () => resolve(r.result as string);
                    r.onerror = () => resolve(null);
                    r.readAsDataURL(blob);
                  });
                  if (reader) dataUrl = reader;
                } catch (e) {
                  // can't fetch remote image, skip embedding
                  dataUrl = null;
                }
              }
              if (dataUrl) {
                // doc.addImage accepts dataURL
                // fit image width to imgW and compute height preserving ratio is not trivial without image object,
                // we will let jsPDF scale it using width and height heuristics
                doc.addImage(dataUrl, "JPEG", margin, imgY, imgW, imgH);
                y += imgH + 8;
              }
            } catch (err) {
              // ignore image embedding errors
              console.warn("Failed to embed attachment image in PDF", err);
            }
          }

          if (y > doc.internal.pageSize.getHeight() - 100) {
            doc.addPage();
            y = 60;
          }
        }
      }

      // Footer or save
      doc.setFontSize(10);
      const fileName = `prescription-${appointment?.id ?? id}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 py-8 pb-28 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-semibold text-slate-800">Prescription Details</h1>
          <button
            onClick={downloadPDF}
            disabled={generatingPdf}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded shadow text-white ${generatingPdf ? "bg-sky-300" : "bg-sky-600 hover:bg-sky-700"}`}
          >
            <Download className="w-4 h-4" />
            {generatingPdf ? "Generating..." : "Download PDF"}
          </button>
        </div>

        {/* Sky-blue card */}
        <div className="bg-[#E8F4FF] rounded-2xl p-6 shadow-md border border-sky-100">
          {/* White inner card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            {/* Header row */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-slate-600"><span className="font-medium text-slate-800">Doctor:</span> {doctorName}</p>
                <p className="text-sm text-slate-600"><span className="font-medium text-slate-800">Patient:</span> {patientName}</p>
              </div>
              <div className="text-right text-sm text-slate-600">
                <p><span className="font-medium text-slate-800">Date:</span> {new Date(createdAt).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Appointment ID: {appointment?.id}</p>
              </div>
            </div>

            {/* Vitals */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-800 mb-3">Vitals</h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                <div>BP: <span className="font-medium">{safe(prescription.vitals?.bp)}</span></div>
                <div>Pulse: <span className="font-medium">{safe(prescription.vitals?.pulse)}</span></div>
                <div>Temperature: <span className="font-medium">{safe(prescription.vitals?.temperature)}</span></div>
                <div>SpO₂: <span className="font-medium">{safe(prescription.vitals?.spo2)}</span></div>
                <div>Weight: <span className="font-medium">{safe(prescription.vitals?.weight)}</span></div>
              </div>
            </div>

            {/* Medicines */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-800 mb-3">Medicines</h3>
              {Array.isArray(prescription.medicines) && prescription.medicines.length > 0 ? (
                <div className="space-y-3">
                  {prescription.medicines.map((m: any, idx: number) => (
                    <div key={idx} className="rounded-lg border p-4 bg-slate-50">
                      <div className="text-sm text-slate-800 font-semibold mb-1">{safe(m.name) || "—"}</div>
                      <div className="text-sm text-slate-700">
                        <div>Dosage: <span className="font-medium">{safe(m.dosage)}</span></div>
                        <div>Frequency: <span className="font-medium">{safe(m.frequency)}</span></div>
                        <div>Duration: <span className="font-medium">{safe(m.duration)}</span></div>
                        <div>Instructions: <span className="font-medium">{safe(m.instructions)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No medicines prescribed.</div>
              )}
            </div>

            {/* Tests */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-800 mb-3">Test Suggestions</h3>
              {Array.isArray(prescription.tests) && prescription.tests.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-slate-700">
                  {prescription.tests.map((t: any, i: number) => <li key={i}>{safe(t.name)}</li>)}
                </ul>
              ) : (
                <div className="text-sm text-gray-500">No tests suggested.</div>
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-800 mb-3">Doctor Notes</h3>
              <div className="bg-slate-50 rounded p-3 text-sm text-slate-700">
                {safe(prescription.notes) || <span className="text-gray-400">No notes provided.</span>}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-3">Attachments</h3>
              {Array.isArray(prescription.files) && prescription.files.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {prescription.files.map((file: any, i: number) => {
                    const url = file.dataUrl ?? file.url ?? file.data ?? null;
                    const name = file.name ?? `file-${i + 1}`;
                    const type = (file.type ?? "").toString();
                    if (url && (isDataUrl(url) || isHttpUrl(url)) && (type.startsWith("image/") || isDataUrl(url))) {
                      // image preview
                      return (
                        <a key={i} href={url} download={name} className="block border rounded overflow-hidden bg-white shadow-sm">
                          <img src={url} alt={name} className="object-cover h-28 w-full" />
                          <div className="text-xs text-center p-2 text-slate-700">{name}</div>
                        </a>
                      );
                    } else {
                      // non-image
                      return (
                        <div key={i} className="border rounded p-3 bg-white flex flex-col items-center justify-center text-xs text-slate-700">
                          <div className="mb-2">{name}</div>
                          {url ? (
                            <a href={url} download={name} className="text-sm text-sky-600 hover:underline">Download</a>
                          ) : (
                            <div className="text-xs text-gray-400">No file URL</div>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No attachments provided.</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
