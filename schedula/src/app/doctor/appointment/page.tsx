"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User2,
  CheckCircle2,
  Edit,
  X,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { getAppointmentsByDoctor } from "@/app/services/appointments.api";
import { getPrescriptionsByAppointmentId } from "@/app/services/prescription.api";
import type { Appointment } from "@/lib/types/appointment";
import DatePicker from "react-datepicker";
import { createFollowUpAppointment } from "@/app/services/appointments.api";
import "react-datepicker/dist/react-datepicker.css";

const StatusBadge = ({ status }: { status: string }) => {
  const cls =
    status === "Upcoming"
      ? "bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100"
      : status === "Completed"
      ? "bg-green-50 text-green-600 ring-1 ring-green-100"
      : status === "Cancelled"
      ? "bg-red-50 text-red-600 ring-1 ring-red-100"
      : "bg-amber-50 text-amber-600 ring-1 ring-amber-100";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
};

const Row = ({
  icon: Icon,
  children,
}: {
  icon: typeof Calendar;
  children: React.ReactNode;
}) => (
  <p className="flex items-center gap-2 text-gray-700 text-sm">
    <Icon className="w-4 h-4 text-gray-400" />
    <span>{children}</span>
  </p>
);

const subtitleOf = (apt: Appointment): string => {
  if (apt.visitType === "Follow-up") return "Follow-up consultation";
  if (apt.visitType === "Report") return "Report review";
  if (apt.visitType === "First") return "Regular checkup";
  if (apt.patientDetails?.problem) return apt.patientDetails.problem;
  return "";
};

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const { doctor } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<
    "Upcoming" | "Completed" | "Cancelled"
  >("Upcoming");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [hasPrescription, setHasPrescription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [attemptedSave, setAttemptedSave] = useState(false);

  useEffect(() => {
    if (!doctor?.id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getAppointmentsByDoctor(doctor.id);
        setAppointments(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [doctor?.id]);

  const filtered = useMemo(
    () => appointments.filter((a) => a.status === activeTab),
    [appointments, activeTab]
  );

  const openDetails = async (apt: Appointment) => {
    const rx = await getPrescriptionsByAppointmentId(apt.id);
    setHasPrescription(!!rx && rx.length > 0);
    setSelected(apt);
  };

  const markCompleted = async (id: string) => {
    setBusy(true);
    try {
      await fetch("/api/appointment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Completed" }),
      });

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Completed" } : a))
      );

      setSelected((prev) =>
        prev && prev.id === id ? { ...prev, status: "Completed" } : prev
      );

      setShowFollowUpModal(true);
    } finally {
      setBusy(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    setBusy(true);
    try {
      await fetch("/api/appointment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Cancelled" }),
      });

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" } : a))
      );
      setSelected((prev) =>
        prev && prev.id === id ? { ...prev, status: "Cancelled" } : prev
      );
    } finally {
      setBusy(false);
    }
  };

  const closeModal = () => setSelected(null);

const handleSaveFollowUp = async () => {
  if (!followUpDate || !followUpTime) return setAttemptedSave(true);
  if (!selected || !doctor) return;

  try {
    const newAppointment: Appointment = {
      id: String(Date.now()),
      tokenNo: `TKN-${Math.floor(Math.random() * 9000 + 1000)}`,
      patientId: selected.patientId,
      doctorId: doctor.id,
      doctor: {
        firstName: doctor.firstName, lastName: doctor.lastName,
        specialty: doctor.specialty, qualifications: doctor.qualifications, image: doctor.image
      },
      patientDetails: selected.patientDetails,
      day: new Date(followUpDate).toLocaleDateString("en-US", { weekday: "long" }),
      date: followUpDate, time: followUpTime,
      type: selected.type || "In-person", status: "Upcoming",
      visitType: "Follow-up", paid: false, paymentStatus: "Not paid",
      queuePosition: 0, followUpOf: selected.id
    };
      await createFollowUpAppointment({
        ...newAppointment,
        visitType: "Follow-up",
      });

        setAttemptedSave(false); setShowFollowUpModal(false);
        setSelected(null); setFollowUpDate(""); setFollowUpTime("");
      } catch (err) {
        console.error("Follow-up creation failed:", err);
      }
    };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading appointments…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---- Appointments List ---- */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-start gap-3 mb-4">
          <button
            aria-label="Back"
            onClick={() => router.push("doctor/dashboard")}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Appointments
            </h1>
            <p className="text-sm text-gray-500">
              Dr. {doctor?.firstName} {doctor?.lastName}
            </p>
          </div>
        </div>

        <div className="px-1">
          <div className="flex items-center gap-8 overflow-hidden">
            {(["Upcoming", "Completed", "Cancelled"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-3 font-semibold ${
                  activeTab === tab
                    ? "text-cyan-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {filtered.length > 0 ? (
            filtered.map((apt) => {
              const patient = apt.patientDetails;
              const name = patient?.fullName || "Patient";
              const sub = subtitleOf(apt);
              const dateStr = apt.date
                ? format(new Date(apt.date), "EEEE, yyyy-MM-dd")
                : "—";

              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <User2 className="w-4 h-4 text-cyan-600" />
                          <h3 className="text-lg font-extrabold text-gray-900">
                            {name}
                          </h3>
                        </div>
                        {sub && (
                          <p className="text-sm text-gray-500 mt-1">{sub}</p>
                        )}
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>

                    <div className="mt-4 space-y-2">
                      <Row icon={Calendar}>{dateStr}</Row>
                      <Row icon={Clock}>{apt.time || "—"}</Row>
                      <Row icon={CheckCircle}>{apt.type || "In-person"}</Row>

                      <p className="text-sm">
                        <span className="text-gray-600">Token:</span>{" "}
                        <span className="text-cyan-600 font-semibold">
                          #{apt.tokenNo}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 flex justify-end">
                    <Button
                      variant="outline"
                      className="border-cyan-600 text-cyan-600 hover:bg-cyan-50"
                      onClick={() => openDetails(apt)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 text-gray-500">
              No {activeTab.toLowerCase()} appointments
            </div>
          )}
        </div>
      </div>

      {/* ==== Appointment Details Modal ==== */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-20"
            onClick={closeModal}
          />

          <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative max-h-[90vh] flex flex-col">
              <div className="p-6 overflow-y-auto">
                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center pr-6">
                  Appointment Details
                </h2>

                <div className="bg-cyan-50 rounded-lg p-3 border text-center">
                  <p className="text-cyan-800 font-semibold">
                    Token No: #{selected.tokenNo}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mt-4">
                  <div className="flex justify-between">
                    <span>Patient:</span>
                    <span className="font-medium">
                      {selected.patientDetails?.fullName || "—"}
                    </span>
                  </div>

                  {selected.patientDetails?.age && (
                    <div className="flex justify-between">
                      <span>Age:</span>
                      <span className="font-medium">
                        {selected.patientDetails.age}
                      </span>
                    </div>
                  )}

                  {selected.patientDetails?.gender && (
                    <div className="flex justify-between">
                      <span>Gender:</span>
                      <span className="font-medium">
                        {selected.patientDetails.gender}
                      </span>
                    </div>
                  )}

                  {selected.patientDetails?.phone && (
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="font-medium">
                        {selected.patientDetails.phone}
                      </span>
                    </div>
                  )}

                  {selected.patientDetails?.relationship && (
                    <div className="flex justify-between">
                      <span>Relationship:</span>
                      <span className="font-medium">
                        {selected.patientDetails.relationship}
                      </span>
                    </div>
                  )}

                  {selected.patientDetails?.weight && (
                    <div className="flex justify-between">
                      <span>Weight:</span>
                      <span className="font-medium">
                        {selected.patientDetails.weight} kg
                      </span>
                    </div>
                  )}

                  {selected.patientDetails?.problem && (
                    <div className="flex justify-between">
                      <span>Problem:</span>
                      <span className="font-medium">
                        {selected.patientDetails.problem}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">
                      {(selected.day ? selected.day + ", " : "") +
                        (selected.date || "—")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{selected.time || "—"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">
                      {selected.type || "In-person"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span
                      className={`font-medium ${
                        selected.paid ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {selected.paid ? "Paid" : "Not Paid"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  {selected.status === "Upcoming" && (
                    <>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => markCompleted(selected.id)}
                        disabled={busy}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {busy ? "Completing..." : "Mark as Completed"}
                      </Button>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="border-cyan-600 text-cyan-600 hover:bg-cyan-50"
                          onClick={() =>
                            router.push(
                              `/doctor/appointment/${selected.id}/edit`
                            )
                          }
                          disabled={busy}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => cancelAppointment(selected.id)}
                          disabled={busy}
                        >
                          <X className="w-4 h-4 mr-2" />
                          {busy ? "Cancelling..." : "Cancel"}
                        </Button>
                      </div>
                    </>
                  )}

                  {selected.status === "Completed" && hasPrescription && (
                    <Button
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                      onClick={() =>
                        router.push(
                          `/doctor/appointment/${selected.id}/prescription/view`
                        )
                      }
                    >
                      View Prescription
                    </Button>
                  )}

                  {selected.status === "Completed" && !hasPrescription && (
                    <Button
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                      onClick={() =>
                        router.push(
                          `/doctor/appointment/${selected.id}/prescription`
                        )
                      }
                    >
                      Add Prescription
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ==== FOLLOW-UP MODAL ==== */}
      {showFollowUpModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowFollowUpModal(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative overflow-y-auto"
              style={{
                maxHeight: "90vh",
                overflowY: "auto",
                overflowX: "visible",
              }}
            >
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Schedule Follow-up Appointment
              </h2>

              {/* ---- Date Picker ---- */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Choose Date
                </label>

                <div className="flex justify-center">
                  <DatePicker
                    selected={followUpDate ? new Date(followUpDate) : null}
                    onChange={(date) => {
                      if (!date) {
                        setFollowUpDate("");
                        return;
                      }
                      const localDate = new Date(
                        date.getTime() - date.getTimezoneOffset() * 60000
                      )
                        .toISOString()
                        .split("T")[0];
                      setFollowUpDate(localDate);
                    }}
                    minDate={new Date()}
                    filterDate={(date: Date) => {
                      if (!(date instanceof Date) || isNaN(date.getTime()))
                        return false;

                      const dayName = date.toLocaleDateString("en-US", {
                        weekday: "long",
                      });
                      return !!doctor?.availableDays?.includes(dayName);
                    }}
                    inline
                    calendarClassName="mx-auto rounded-lg shadow border border-gray-200"
                  />
                </div>
              </div>

              {/* ---- Time Slots ---- */}
              {followUpDate && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Choose Time Slot
                  </label>

                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                  >
                    <option value="">Select a time slot</option>

                    {doctor?.availableTime?.morning && (
                      <optgroup label="Morning">
                        {generateTimeSlots(
                          doctor.availableTime.morning.from,
                          doctor.availableTime.morning.to
                        ).map((slot) => (
                          <option key={`m-${slot}`} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {doctor?.availableTime?.evening && (
                      <optgroup label="Evening">
                        {generateTimeSlots(
                          doctor.availableTime.evening.from,
                          doctor.availableTime.evening.to
                        ).map((slot) => (
                          <option key={`e-${slot}`} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              )}

              {/* ---- Buttons ---- */}
              <div className="flex flex-col gap-2 mt-6">
                {!followUpDate && attemptedSave && (
                  <p className="text-sm text-red-500">
                    Please select a follow-up date.
                  </p>
                )}
                {followUpDate && !followUpTime && attemptedSave && (
                  <p className="text-sm text-red-500">
                    Please select a time slot.
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                    onClick={handleSaveFollowUp}
                  >
                    Save Follow-up
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setAttemptedSave(false);
                      setShowFollowUpModal(false);
                    }}
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function generateTimeSlots(from: string, to: string): string[] {
  const slots: string[] = [];
  let [h, m] = from.split(":").map(Number);
  const [endH, endM] = to.split(":").map(Number);

  while (h < endH || (h === endH && m < endM)) {
    const hour = String(h).padStart(2, "0");
    const minute = String(m).padStart(2, "0");
    slots.push(`${hour}:${minute}`);
    m += 30;
    if (m >= 60) {
      m = 0;
      h++;
    }
  }
  return slots;
}
