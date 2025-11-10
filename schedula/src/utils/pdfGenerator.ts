import jsPDF from "jspdf";
import { Prescription, PrescriptionResponse } from "@/lib/types/prescription";

/**
 * Generates and downloads a beautifully formatted PDF for a prescription
 * @param prescription - The prescription data
 */
export const downloadPrescriptionPDF = (prescription: PrescriptionResponse) => {
  console.log("prescription data for pdf: ", prescription);
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;
    let y = 60;

    // Blue-cyan color (cyan-500)
    const primaryColor = { r: 6, g: 182, b: 212 }; // cyan-500

    // Helper function to add page break if needed
    const checkPageBreak = (requiredSpace: number = 80) => {
      if (y > pageHeight - 180) {
        doc.addPage();
        y = 60;
        return true;
      }
      return false;
    };

    // Helper function to draw a section divider
    const addDivider = (style: "thick" | "thin" = "thin") => {
      doc.setDrawColor(style === "thick" ? 100 : 220);
      doc.setLineWidth(style === "thick" ? 1 : 0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += style === "thick" ? 20 : 15;
    };

    // ===== HEADER SECTION =====
    // Add header background
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(0, 0, pageWidth, 70, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PRESCRIPTION", margin, 40);

    // Prescription ID (top right)
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const idText = `Prescription ID: ${prescription.id}`;
    const idWidth = doc.getTextWidth(idText);
    doc.text(idText, pageWidth - margin - idWidth, 35);

    // Date (top right, below ID)
    const dateText = new Date(
      prescription.createdAt
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, pageWidth - margin - dateWidth, 50);

    y = 100;
    doc.setTextColor(0, 0, 0);

    // ===== DOCTOR & PATIENT INFO SECTION =====
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 80, 5, 5, "F");

    y += 25;

    // Doctor Info (Left)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Doctor", margin + 20, y);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const doctorName =
      `Dr. ${prescription.doctor?.firstName} ${prescription.doctor?.lastName}` ||
      "Doctor Name";
    doc.text(doctorName, margin + 20, y + 18);

    if (prescription.doctor?.specialty) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(prescription.doctor?.specialty, margin + 20, y + 33);
      doc.setTextColor(0, 0, 0);
    }

    // Patient Info (Right)
    const midPoint = pageWidth / 2;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Patient", midPoint, y);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const patientName = prescription.patient?.fullName || "Patient Name";
    doc.text(patientName, midPoint, y + 18);

    if (prescription.patient?.age || prescription.patient?.gender) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const ageGender = `${prescription.patient?.age || ""}${
        prescription.patient?.age && prescription.patient?.gender ? ", " : ""
      }${prescription.patient?.gender || ""}`;
      doc.text(ageGender, midPoint, y + 33);
      doc.setTextColor(0, 0, 0);
    }

    y += 80;

    // ===== VITALS SECTION (only if data available) =====
    const vitals = prescription.vitals || {};
    const hasVitals =
      vitals.bp ||
      vitals.pulse ||
      vitals.temperature ||
      vitals.spo2 ||
      vitals.weight;

    if (hasVitals) {
      checkPageBreak();
      y += 10;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text("Vital Signs", margin, y);
      doc.setTextColor(0, 0, 0);
      y += 20;

      const vitalsList = [
        {
          label: "Blood Pressure",
          value: vitals.bp ? `${vitals.bp} mmHg` : "N/A",
          icon: "◆",
        },
        {
          label: "Pulse Rate",
          value: vitals.pulse ? `${vitals.pulse} bpm` : "N/A",
          icon: "◆",
        },
        {
          label: "Temperature",
          value: vitals.temperature ? `${vitals.temperature}°F` : "N/A",
          icon: "◆",
        },
        {
          label: "SpO₂",
          value: vitals.spo2 ? `${vitals.spo2}%` : "N/A",
          icon: "◆",
        },
        {
          label: "Weight",
          value: vitals.weight ? `${vitals.weight} kg` : "N/A",
          icon: "◆",
        },
      ];

      // Display vitals in a clean grid
      vitalsList.forEach((vital, index) => {
        const col = index % 2;
        const xPos = margin + col * (contentWidth / 2);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(vital.label, xPos + 15, y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(vital.value, xPos + 150, y);

        if (index % 2 === 1 || index === vitalsList.length - 1) {
          y += 18;
        }
      });

      y += 10;
      addDivider("thin");
    }

    // ===== MEDICINES SECTION (only if data available) =====
    const medicines = Array.isArray(prescription.medicines)
      ? prescription.medicines
      : [];

    if (medicines.length > 0) {
      checkPageBreak(100);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text("Prescribed Medications", margin, y);
      doc.setTextColor(0, 0, 0);
      y += 25;

      medicines.forEach((medicine, idx) => {
        checkPageBreak(80);

        // Medicine card background
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(margin, y - 12, contentWidth, 65, 3, 3, "F");

        // Medicine number circle
        doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.circle(margin + 18, y, 10, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${idx + 1}`, margin + 15, y + 3);
        doc.setTextColor(0, 0, 0);

        // Medicine name
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(medicine.name || "Unnamed Medication", margin + 35, y);

        // Details in columns
        y += 18;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        const details = [
          { label: "Dosage:", value: medicine.dosage || "N/A" },
          { label: "Frequency:", value: medicine.frequency || "N/A" },
          { label: "Duration:", value: medicine.duration || "N/A" },
        ];

        details.forEach((detail, i) => {
          const xPos = margin + 35 + i * 180;
          doc.setFont("helvetica", "bold");
          doc.text(detail.label, xPos, y);
          doc.setFont("helvetica", "normal");
          doc.text(detail.value, xPos + 52, y);
        });

        // Instructions
        if (medicine.instructions) {
          y += 25;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(80, 80, 80);
          const instructionText = `Instructions: ${medicine.instructions}`;
          const instructionSplit = doc.splitTextToSize(
            instructionText,
            contentWidth - 40
          );
          doc.text(instructionSplit, margin + 35, y);
          doc.setTextColor(0, 0, 0);
        }

        y += 35;
      });

      addDivider("thin");
    }

    // ===== TESTS SECTION (only if data available) =====
    const tests = Array.isArray(prescription.tests)
      ? prescription.tests
      : [];
    const hasTests = tests.length > 0 && tests[0]?.name;

    if (hasTests) {
      checkPageBreak(60);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text("Recommended Tests", margin, y);
      doc.setTextColor(0, 0, 0);
      y += 20;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      tests.forEach((test, i) => {
        checkPageBreak();
        doc.text(`${i + 1}.`, margin + 15, y);
        doc.text(test.name || "Unnamed Test", margin + 35, y);
        y += 16;
      });
      y += 10;

      addDivider("thin");
    }

    // ===== NOTES SECTION (only if data available) =====
    if (prescription.notes) {
      checkPageBreak(60);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text("Doctor's Notes", margin, y);
      doc.setTextColor(0, 0, 0);
      y += 20;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const notesSplit = doc.splitTextToSize(
        prescription.notes,
        contentWidth - 20
      );
      doc.text(notesSplit, margin + 15, y);
      y += notesSplit.length * 14 + 20;

      addDivider("thin");
    }

    // ===== DOCTOR DETAILS SECTION (Bottom Right) =====
    // Calculate position for doctor details in bottom right
    const doctorBoxWidth = 250;
    const doctorBoxHeight = 100;
    const doctorBoxX = pageWidth - margin - doctorBoxWidth;
    const doctorBoxY = pageHeight - margin - doctorBoxHeight - 30;

    // Add some space before doctor details if content is too close
    if (y > doctorBoxY - 30) {
      doc.addPage();
    }

    // Doctor details box (subtle border)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.setFillColor(252, 252, 253);
    doc.roundedRect(
      doctorBoxX,
      doctorBoxY,
      doctorBoxWidth,
      doctorBoxHeight,
      3,
      3,
      "FD"
    );

    // Doctor name
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const doctorFullName = `Dr. ${prescription.doctor?.firstName || ""} ${
      prescription.doctor?.lastName || ""
    }`;
    doc.text(doctorFullName, doctorBoxX + 15, doctorBoxY + 30);

    // Qualifications
    if (prescription.doctor?.qualifications) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const qualifications = doc.splitTextToSize(
        prescription.doctor.qualifications,
        doctorBoxWidth - 30
      );
      doc.text(qualifications, doctorBoxX + 15, doctorBoxY + 50);
    }

    // "Prescribing Doctor" label at bottom of box
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Prescribing Doctor",
      doctorBoxX + 15,
      doctorBoxY + doctorBoxHeight - 15
    );

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    const footer =
      "This is a computer-generated prescription. For any queries, please contact your healthcare provider.";
    const footerWidth = doc.getTextWidth(footer);
    doc.text(footer, pageWidth / 2 - footerWidth / 2, pageHeight - 20);

    // Save the PDF
    const fileName = `prescription-${prescription.id}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};
