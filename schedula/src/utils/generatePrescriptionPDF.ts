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
  if (!doctorInfo || !patientInfo) return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = 70;

  // Load stethoscope image from /public
  const steth = new Image();
  steth.src = "/steth.png";

  steth.onload = () => {
    // HEADER BAR
    doc.setFillColor(0, 170, 195);
    doc.rect(0, 0, 600, 80, "F");

    doc.setFont("helvetica", "bold")
      .setFontSize(18)
      .setTextColor("#ffffff");
    doc.text(
      `Dr. ${doctorInfo.firstName} ${doctorInfo.lastName}`,
      margin,
      35
    );

    doc.setFontSize(11);
    doc.text(`${doctorInfo.qualifications}`, margin, 55);

    // ✅ Add stethoscope image (PNG)
    doc.addImage(steth, "PNG", 510, 15, 55, 55);

    doc.setTextColor("#000");
    y = 115;

    // ------------ PATIENT DETAILS --------------
    doc.setFont("helvetica", "bold")
      .setFontSize(13)
      .setTextColor("#007f94");
    doc.text("Patient Details", margin, y);

    doc.setTextColor("#000");
    y += 35;

    const leftX = margin;
    const rightX = margin + 200;

    doc.setFont("helvetica", "normal").setFontSize(12);

    const line = (x: number, y: number, len = 180) => {
      doc.setDrawColor(150);
      doc.setLineWidth(0.5);
      doc.line(x, y + 2, x + len, y + 2);
    };

    doc.text("Name:", leftX, y);
    line(leftX + 45, y);
    doc.text(patientInfo.fullName, leftX + 47, y);
    y += 22;

    doc.text("Age:", leftX, y);
    line(leftX + 35, y, 50);
    doc.text(String(patientInfo.age), leftX + 37, y);

    doc.text("Gender:", rightX, y);
    line(rightX + 55, y, 60);
    doc.text(patientInfo.gender, rightX + 57, y);

    y += 22;

    doc.text("Weight:", leftX, y);
    line(leftX + 55, y, 60);
    doc.text(`${patientInfo.weight || "-"}`, leftX + 57, y);

    y += 22;

    doc.text("Diagnosis:", leftX, y);
    line(leftX + 70, y, 200);
    doc.text(patientInfo.problem || "-", leftX + 72, y);

    y += 55;

    // RX SYMBOL
    doc.setFontSize(30)
      .setFont("helvetica", "bold")
      .setTextColor("#003366");
    doc.text("Rx", leftX, y);

    doc.setTextColor("#000").setFontSize(12);
    y += 30;

    // ------------ VITALS TABLE --------------
    if (rx.vitals) {
      autoTable(doc, {
        head: [["BP (mmHg)", "Pulse (bpm)", "Temp (°F)", "SpO2 (%)", "Weight (Kg)"]],
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
        theme: "grid",
        headStyles: { fillColor: [0, 170, 195] },
      });

      // @ts-ignore
      y = doc.lastAutoTable.finalY + 20;
    }

    // ------------ MEDICINES TABLE --------------
    if (rx.medicines?.length) {
      autoTable(doc, {
        head: [["Medicine", "Dosage", "Frequency", "Duration", "Instructions"]],
        body: rx.medicines.map((m) => [
          m.name,
          m.dosage || "-",
          m.frequency || "-",
          m.duration || "-",
          m.instructions || "-",
        ]),
        startY: y,
        margin: { left: margin },
        theme: "grid",
        headStyles: { fillColor: [0, 102, 150] },
      });
      // @ts-ignore
      y = doc.lastAutoTable.finalY + 30;
    }

    // ------------ TESTS --------------
    if (rx.tests?.length) {
      doc.setFont("helvetica", "bold")
        .setFontSize(12)
        .setTextColor("#007f94");
      doc.text("Recommended Tests:", margin, y);
      doc.setTextColor("#000");

      y += 30;

      doc.setFont("helvetica", "normal").setFontSize(12);
      rx.tests.forEach((t) => {
        doc.text(`• ${t.name}`, margin, y);
        y += 20;
      });
      y += 24;
    }

    // ------------ SIGNATURE --------------
    const sig = `${doctorInfo.firstName} ${doctorInfo.lastName}`;
    const sigX = 400;
    const sigY = 720;

    doc.setFont("times", "italic").setFontSize(16).setTextColor("#333");
    doc.text(sig, sigX, sigY);

    doc.setDrawColor(80).setLineWidth(0.5);
    doc.line(sigX - 10, sigY + 5, sigX + 120, sigY + 5);

    doc.setFont("helvetica", "normal")
      .setFontSize(9)
      .setTextColor("#555");
    doc.text("Doctor Signature", sigX + 20, sigY + 18);

    // ------------ FOOTER --------------
    doc.setDrawColor(180);
    doc.line(margin, 760, 550, 760);

    const footerItems = [
      "Schedula Health Clinic",
      "123 Health Street, Anna Nagar, Chennai – 600040",
      "+91 99999 99999",
    ];

    const footerCenter = 300;
    const footerY = 785;
    const spacing = 20;

    doc.setFont("helvetica", "normal")
      .setFontSize(10)
      .setTextColor("#006d6d");

    footerItems.forEach((txt, i) => {
      doc.text(txt, footerCenter, footerY + i * spacing, { align: "center" });
    });

    doc.save(`Prescription-${patientInfo.fullName}.pdf`);
  };
}
