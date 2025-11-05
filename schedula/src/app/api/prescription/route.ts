let prescriptions: any[] = [];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const appointmentId = url.searchParams.get("appointmentId");

  //  Get specific prescription by ID
  if (id) {
    const prescription = prescriptions.find(p => p.id === id);
    if (!prescription) {
      return Response.json({ success: false, data: null, message: "Not found" });
    }
    return Response.json({ success: true, data: prescription });
  }

  // Get all prescriptions for an appointment
  if (appointmentId) {
    const data = prescriptions.filter(p => p.appointmentId === appointmentId);
    return Response.json({ success: true, data });
  }

  return Response.json({ success: true, data: prescriptions });
}


export async function POST(request: Request) {
  const body = await request.json();
  const newPrescription = { id: crypto.randomUUID(), createdAt: Date.now(), ...body };
  prescriptions.push(newPrescription);
  return Response.json({ success: true, data: newPrescription });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  prescriptions = prescriptions.filter(p => p.id !== id);
  return Response.json({ success: true });
}

export async function PUT(request: Request) {
  const body = await request.json();
  prescriptions = prescriptions.map(p => p.id === body.id ? body : p);
  return Response.json({ success: true, data: body });
}
