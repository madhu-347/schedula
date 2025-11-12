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
import type { Appointment } from "@/lib/types/appointment";
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
  const [loading, setLoading] = useState(true);

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
            onClick={() =>router.push("/doctor/dashboard")}
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
                      onClick={() => router.push(`/doctor/appointment/${apt.id}`)}
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
    </div>
  );
}