import { Appointment } from "@/lib/types/appointment";

export async function createAppointment(appointmentData: Appointment) {
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

export async function getAppointmentsByStatus(status: string) {
  try {
    const response = await fetch(`/api/appointment?status=${status}`);
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

export async function getAppointmentsByDoctor(doctorId: string) {
  try {
    const response = await fetch(
      `/api/appointment?doctorId=${encodeURIComponent(doctorId)}`
    );
    const result = await response.json();
    console.log("all appts: ", result);
    if (result.success) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch doctor appointments:", error);
    return [];
  }
}

export async function getAppointmentsByPatient(patientId: string) {
  try {
    const response = await fetch(
      `/api/appointment?patientId=${encodeURIComponent(patientId)}`
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

export async function getLatestAppointmentsForDoctor(doctorId: string) {
  try {
    const response = await fetch(
      `/api/appointment?doctorId=${doctorId}&limit=4`
    );
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch latest appointments for doctor:", error);
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
    const response = await fetch(`/api/appointment?id=${id}`);

    const result = await response.json();
    // console.log("get appt by id res: ", result);

    if (result.success) {
      return result.data;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch appointment:", error);
    return null;
  }
}

export async function updateAppointment(
  appointmentId: string,
  updates: Partial<Appointment>
) {
  try {
    const response = await fetch(`/api/appointment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: appointmentId,
        ...updates,
      }),
    });

    if (response.ok) {
      const updatedAppointment = await response.json();
      // console.log("Appointment updated successfully!", updateAppointment);
      return updatedAppointment;
    } else {
      const error = await response.json();
      console.error(
        "Failed to update appointment:",
        error.error || response.statusText
      );
      return null;
    }
  } catch (error) {
    console.error("Error updating appointment:", error);
    return null;
  }
}

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
