//get prescription by id
// get all prescriptions for patient (using patient id)
// get all prescriptions for doctor (using doctor id)
// there'll be only one prescription per appointment so no point of getting prescription for appt id.
import mockData from "@/lib/mockData.json";

let prescriptions: any[] = [];

// Helper function to enrich prescription with doctor and patient data
function enrichPrescription(prescription: any) {
  const doctor = mockData.doctors.find((d) => d.id === prescription.doctorId);
  const patient = mockData.users.find((p) => p.id === prescription.patientId);

  return {
    ...prescription,
    doctor: doctor || null,
    patient: patient || null,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const patientId = url.searchParams.get("patientId");
  const doctorId = url.searchParams.get("doctorId");

  // Get specific prescription by ID
  if (id) {
    const prescription = prescriptions.find((p) => p.id === id);
    if (!prescription) {
      return Response.json({
        success: false,
        data: null,
        message: "Not found",
      });
    }
    return Response.json({
      success: true,
      data: enrichPrescription(prescription),
    });
  }

  // Get all prescriptions for a patient
  if (patientId) {
    const data = prescriptions
      .filter((p) => p.patientId === patientId)
      .map(enrichPrescription);
    // console.log("all prescriptions for patient", data);
    return Response.json({ success: true, data });
  }

  // Get all prescriptions for a doctor
  if (doctorId) {
    const data = prescriptions
      .filter((p) => p.doctorId === doctorId)
      .map(enrichPrescription);
    return Response.json({ success: true, data });
  }

  // Get all prescriptions
  return Response.json({
    success: true,
    data: prescriptions.map(enrichPrescription),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const newPrescription = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    ...body,
  };
  prescriptions.push(newPrescription);
  return Response.json({
    success: true,
    data: enrichPrescription(newPrescription),
  });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  prescriptions = prescriptions.filter((p) => p.id !== id);
  return Response.json({ success: true });
}

export async function PUT(request: Request) {
  const body = await request.json();
  prescriptions = prescriptions.map((p) => (p.id === body.id ? body : p));
  return Response.json({ success: true, data: enrichPrescription(body) });
}
