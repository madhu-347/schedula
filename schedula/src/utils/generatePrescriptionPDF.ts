import { Doctor } from "@/lib/types/doctor";
import { Prescription } from "@/lib/types/prescription";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PropType {
  doctorInfo: Doctor | null;
  patientInfo: {
    id: string;
    fullName: string;
    age: number;
    gender: "Male" | "Female" | "Other";
    phone: string;
    weight?: number;
    problem?: string;
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
    location?: string;
  } | null;
  rx: Prescription;
}

export default function generatePrescriptionPDF({
  doctorInfo,
  patientInfo,
  rx,
}: PropType) {
  if (!doctorInfo || !patientInfo) {
    console.error("Missing doctor or patient information");
    return;
  }

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = 50;

  // HEADER
  doc.setFontSize(18).setFont("helvetica", "bold");
  doc.text("Medical Prescription", margin, y);
  y += 30;

  // DOCTOR INFO
  doc
    .setFontSize(12)
    .setFont("helvetica", "bold")
    .text("Doctor Information", margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.text(`Dr. ${doctorInfo.firstName} ${doctorInfo.lastName}`, margin, y);
  y += 15;
  doc.text(`Specialty: ${doctorInfo.specialty}`, margin, y);
  y += 15;
  doc.text(`Qualifications: ${doctorInfo.qualifications}`, margin, y);
  y += 25;

  // PATIENT INFO
  doc.setFont("helvetica", "bold").text("Patient Information", margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${patientInfo.fullName}`, margin, y);
  y += 15;
  doc.text(`Age: ${patientInfo.age} years`, margin, y);
  y += 15;
  doc.text(`Gender: ${patientInfo.gender}`, margin, y);
  y += 25;

  // VITALS TABLE
  if (rx.vitals) {
    autoTable(doc, {
      head: [["BP", "Pulse", "Temp", "SpO2", "Weight"]],
      body: [
        [
          rx.vitals.bp ? `${rx.vitals.bp} mmHg` : "-",
          rx.vitals.pulse ? `${rx.vitals.pulse} bpm` : "-",
          rx.vitals.temperature ? `${rx.vitals.temperature} °F` : "-",
          rx.vitals.spo2 ? `${rx.vitals.spo2} %` : "-",
          rx.vitals.weight ? `${rx.vitals.weight} kg` : "-",
        ],
      ],
      startY: y,
      margin: { left: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 30;
  }

  // MEDICINES TABLE
  if (rx.medicines?.length > 0) {
    autoTable(doc, {
      head: [["Medicine", "Dosage", "Freq", "Duration", "Instructions"]],
      body: rx.medicines.map((m) => [
        m.name,
        m.dosage || "-",
        m.frequency || "-",
        m.duration || "-",
        m.instructions || "-",
      ]),
      startY: y,
      margin: { left: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 30;
  }

  // TESTS
  if (rx.tests?.length) {
    doc.setFont("helvetica", "bold").text("Suggested Tests:", margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    rx.tests.forEach((t) => {
      doc.text(`• ${t.name}`, margin, y);
      y += 14;
    });
    y += 15;
  }

  // NOTES
  if (rx.notes) {
    doc.setFont("helvetica", "bold").text("Doctor Notes:", margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(rx.notes, 500);
    doc.text(splitText, margin, y);
  }

  // FOOTER LINE
  doc.setDrawColor(180);
  doc.line(margin, 800, 550, 800);
  doc.setFontSize(10).text("Generated via Wellora System", margin, 820);

  doc.save(`Prescription-${patientInfo.fullName}.pdf`);
}
