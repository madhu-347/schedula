export async function getUpcomingAppointments() {
  try {
    const response = await fetch("/api/appointment?status=Upcoming");
    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch upcoming appointments:", error);
    return [];
  }
}

export async function getAllAppointments() {
  try {
    const response = await fetch("/api/appointment");
    const result = await response.json();

    if (result.success) {
      console.log(`Found ${result.count} appointments`);
      console.log(result.data);
      return result.data;
    } else {
      console.error("Error:", result.error);
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return [];
  }
}

export async function getAppointmentsByDoctor(doctorName: string) {
  try {
    const response = await fetch(
      `/api/appointment?doctorName=${encodeURIComponent(doctorName)}`
    );
    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch doctor appointments:", error);
    return [];
  }
}

export async function getAppointmentsByDate(date: string) {
  try {
    const response = await fetch(`/api/appointment?date=${date}`);
    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch appointments by date:", error);
    return [];
  }
}

export async function getAppointmentById(id: string) {
  try {
    const response = await fetch(`/api/appointment/${id}`);
    console.log("get appt by id res: ", response);
    if (!response.ok) {
      console.error("Appointment not found");
      return null;
    }

    const appointment = await response.json();
    return appointment?.data;
  } catch (error) {
    console.error("Failed to fetch appointment:", error);
    return null;
  }
}

export async function createAppointment(appointmentData: InitialAppointment) {
  try {
    const response = await fetch("/api/appointment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    });

    const result = await response.json();

    if (result.success) {
      console.log("Appointment created successfully!");
      console.log("Appointment ID:", result.data.id);
      console.log("Token No:", result.data.tokenNo);
      return result.data;
    } else {
      console.error("Failed to create appointment:", result.error);
      alert(result.error);
      return null;
    }
  } catch (error) {
    console.error("Error creating appointment:", error);
    alert("Failed to create appointment. Please try again.");
    return null;
  }
}

interface InitialAppointment {
  id: string;
  tokenNo: string;
  doctorName: string;
  doctorImage: string;
  specialty: string;
  qualifications?: string;
  day: string;
  date: string;
  timeSlot: string;
  status: string;
  paymentStatus: string;
}

export async function bookAppointment(appointment: InitialAppointment) {
  const newAppointment = await createAppointment(appointment);
  // add appointment details to the mockdata file
  if (newAppointment) {
    // Redirect to appointment details page
    window.location.href = `/appointments/${newAppointment.id}`;
  }
}

export async function updateAppointment(id: number, updates: Partial<any>) {
  try {
    const response = await fetch(`/api/appointment/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const updatedAppointment = await response.json();
      console.log("Appointment updated successfully!");
      return updatedAppointment;
    } else {
      const error = await response.json();
      console.error("Failed to update:", error.error);
      return null;
    }
  } catch (error) {
    console.error("Error updating appointment:", error);
    return null;
  }
}

export async function cancelAppointment(id: number) {
  const result = await updateAppointment(id, { status: "Canceled" });
  if (result) {
    alert("Appointment cancelled successfully");
  }
}

// Example: Mark as paid
export async function markAsPaid(id: number) {
  const result = await updateAppointment(id, { paymentStatus: "Paid" });
  if (result) {
    alert("Payment marked as completed");
  }
}

// Example: Reschedule appointment
export async function rescheduleAppointment(
  id: number,
  newDate: string,
  newTimeSlot: string
) {
  const result = await updateAppointment(id, {
    date: newDate,
    timeSlot: newTimeSlot,
    status: "Upcoming",
  });
  if (result) {
    alert("Appointment rescheduled successfully");
  }
}

// ============================================
// 6. DELETE APPOINTMENT
// ============================================
export async function deleteAppointment(id: number) {
  try {
    const response = await fetch(`/api/appointment/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result.message);
      alert("Appointment deleted successfully");
      return true;
    } else {
      const error = await response.json();
      console.error("Failed to delete:", error.error);
      return false;
    }
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return false;
  }
}
