import jsPDF from "jspdf";
import { Prescription } from "@/lib/types/prescription";

/**
 * Generates and downloads a beautifully formatted PDF for a prescription
 * @param prescription - The prescription data
 * @param prescriptionId - The ID of the prescription
 */
export const downloadPrescriptionPDF = (
  prescription: Prescription,
  prescriptionId: string
) => {
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
      if (y > pageHeight - 120) {
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
    const idText = `Prescription ID: ${prescriptionId}`;
    const idWidth = doc.getTextWidth(idText);
    doc.text(idText, pageWidth - margin - idWidth, 35);

    // Date (top right, below ID)
    const dateText = new Date(prescription.createdAt).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
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
    const doctorName = prescription.doctorDetails?.name || "Doctor Name";
    doc.text(doctorName, margin + 20, y + 18);

    if (prescription.doctorDetails?.specialty) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(prescription.doctorDetails.specialty, margin + 20, y + 33);
      doc.setTextColor(0, 0, 0);
    }

    // Patient Info (Right)
    const midPoint = pageWidth / 2;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Patient", midPoint, y);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const patientName = prescription.patientDetails?.fullName || "Patient Name";
    doc.text(patientName, midPoint, y + 18);

    if (
      prescription.patientDetails?.age ||
      prescription.patientDetails?.gender
    ) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const ageGender = `${prescription.patientDetails?.age || ""}${
        prescription.patientDetails?.age && prescription.patientDetails?.gender
          ? ", "
          : ""
      }${prescription.patientDetails?.gender || ""}`;
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
        { label: "Blood Pressure", value: vitals.bp || "N/A", icon: "◆" },
        { label: "Pulse Rate", value: vitals.pulse || "N/A", icon: "◆" },
        { label: "Temperature", value: vitals.temperature || "N/A", icon: "◆" },
        { label: "SpO", value: vitals.spo2 || "N/A", icon: "◆" },
        { label: "Weight", value: vitals.weight || "N/A", icon: "◆" },
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
    const tests = Array.isArray(prescription.tests) ? prescription.tests : [];
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

    // ===== SIGNATURE SECTION =====
    // Ensure signature is on the last page with enough space
    const signatureHeight = 120;
    if (y > pageHeight - signatureHeight - 60) {
      doc.addPage();
      y = 60;
    } else {
      // Add some space before signature
      y = pageHeight - signatureHeight - 40;
    }

    // Signature divider
    addDivider("thick");

    // Signature box
    doc.setFillColor(252, 252, 253);
    doc.roundedRect(margin, y, contentWidth, 90, 5, 5, "F");
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(1);
    doc.roundedRect(margin, y, contentWidth, 90, 5, 5, "S");

    y += 25;

    // Signature line in the middle
    const sigLineWidth = 200;
    const sigLineX = pageWidth / 2 - sigLineWidth / 2;
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(1);
    doc.line(sigLineX, y + 30, sigLineX + sigLineWidth, y + 30);

    // Signature label
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const sigText = "Doctor's Signature";
    const sigTextWidth = doc.getTextWidth(sigText);
    doc.text(sigText, pageWidth / 2 - sigTextWidth / 2, y + 45);

    // Doctor name below signature
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const doctorNameSig = prescription.doctorDetails?.name || "Doctor Name";
    const doctorNameWidth = doc.getTextWidth(doctorNameSig);
    doc.text(doctorNameSig, pageWidth / 2 - doctorNameWidth / 2, y + 60);

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    const footer =
      "This is a computer-generated prescription. For any queries, please contact your healthcare provider.";
    const footerWidth = doc.getTextWidth(footer);
    doc.text(footer, pageWidth / 2 - footerWidth / 2, pageHeight - 20);

    // Save the PDF
    const fileName = `prescription-${prescriptionId}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};
