"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Calendar,
  FileText,
  Stethoscope,
  Activity,
  ArrowLeft,
  Filter,
  Download,
  Pill,
  TestTube,
} from "lucide-react";
import { getAppointmentsByPatient } from "@/app/services/appointments.api";
import { getPrescriptionByPatient } from "@/app/services/prescription.api";
import type { PrescriptionResponse } from "@/lib/types/prescription";
import Link from "next/link";

interface TimelineItem {
  id: string;
  type: "appointment" | "prescription";
  date: number;
  dateString: string;
  data: any;
}

export default function MedicalHistoryPage() {
  const router = useRouter();
  const { id: patientId } = useParams() as { id: string };

  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>(
    []
  );
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [filteredTimeline, setFilteredTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Patient info (from first appointment or prescription)
  const [patientInfo, setPatientInfo] = useState<any>(null);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      if (!patientId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch both appointments and prescriptions in parallel
        const [appointmentsData, prescriptionsData] = await Promise.all([
          getAppointmentsByPatient(patientId),
          getPrescriptionByPatient(patientId),
        ]);

        console.log("Appointments:", appointmentsData);
        console.log("Prescriptions:", prescriptionsData);

        setAppointments(appointmentsData || []);
        setPrescriptions(prescriptionsData || []);

        // Extract patient info from first appointment
        if (appointmentsData && appointmentsData.length > 0) {
          const firstAppt = appointmentsData[0];
          setPatientInfo(firstAppt.patientDetails || firstAppt.patient);
        } else if (prescriptionsData && prescriptionsData.length > 0) {
          setPatientInfo(prescriptionsData[0].patient);
        }

        // Build timeline
        const timelineItems: TimelineItem[] = [];

        // Add appointments to timeline
        (appointmentsData || []).forEach((appt: any) => {
          const dateTime = new Date(appt.date);
          timelineItems.push({
            id: appt.id,
            type: "appointment",
            date: dateTime.getTime(),
            dateString: appt.date,
            data: appt,
          });
        });

        // Add prescriptions to timeline
        (prescriptionsData || []).forEach((rx: any) => {
          const dateTime = new Date(rx.createdAt);
          timelineItems.push({
            id: rx.id,
            type: "prescription",
            date: dateTime.getTime(),
            dateString: rx.createdAt,
            data: rx,
          });
        });

        // Sort by date descending (most recent first)
        timelineItems.sort((a, b) => b.date - a.date);

        setTimeline(timelineItems);
        setFilteredTimeline(timelineItems);
      } catch (err) {
        console.error("Error fetching medical history:", err);
        setError("Failed to load medical history");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, [patientId]);

  // Apply date filters
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredTimeline(timeline);
      return;
    }

    const filtered = timeline.filter((item) => {
      const itemDate = new Date(item.dateString);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return itemDate >= start && itemDate <= end;
      } else if (start) {
        return itemDate >= start;
      } else if (end) {
        return itemDate <= end;
      }
      return true;
    });

    setFilteredTimeline(filtered);
  }, [startDate, endDate, timeline]);

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const totalAppointments = appointments.length;
  const totalPrescriptions = prescriptions.length;
  const completedAppointments = appointments.filter(
    (a: any) => a.status === "Completed"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading medical history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Error</h3>
          <p className="text-gray-500">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Medical History
                </h1>
                {patientInfo && (
                  <p className="text-sm text-gray-600 mt-1">
                    {patientInfo.fullName} • {patientInfo.age} years •{" "}
                    {patientInfo.gender}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {totalAppointments}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {completedAppointments} completed
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Prescriptions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {totalPrescriptions}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All records</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Timeline Entries</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {filteredTimeline.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {filteredTimeline.length !== timeline.length
                      ? "Filtered"
                      : "All entries"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Filter by Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Timeline</h2>

          {filteredTimeline.length === 0 ? (
            <Card className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No records found
              </h3>
              <p className="text-gray-500">
                {startDate || endDate
                  ? "Try adjusting your filters"
                  : "No medical history available"}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTimeline.map((item) => (
                <Card
                  key={`${item.type}-${item.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    {item.type === "appointment" ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Appointment
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(item.data.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                                {item.data.time && ` • ${item.data.time}`}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.data.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : item.data.status === "Upcoming"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.data.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-13">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Diagnosis / Problem
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {item.data.patientDetails?.problem ||
                                "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Visit Type
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {item.data.visitType || "General"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Type
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {item.data.type || "In-person"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Payment Status
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {item.data.paid ? "Paid" : "Pending"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 pl-13">
                          <Link
                            href={`/doctor/appointment`}
                            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Prescription
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(
                                  item.data.createdAt
                                ).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          {item.data.doctor && (
                            <p className="text-sm text-gray-600">
                              Dr. {item.data.doctor.firstName}{" "}
                              {item.data.doctor.lastName}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-13">
                          <div className="flex items-center gap-2">
                            <Pill className="w-4 h-4 text-cyan-600" />
                            <div>
                              <p className="text-xs text-gray-500">
                                Medications
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {item.data.medicines?.length || 0} prescribed
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TestTube className="w-4 h-4 text-cyan-600" />
                            <div>
                              <p className="text-xs text-gray-500">Tests</p>
                              <p className="text-sm font-medium text-gray-900">
                                {item.data.tests?.length || 0} recommended
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-600" />
                            <div>
                              <p className="text-xs text-gray-500">Vitals</p>
                              <p className="text-sm font-medium text-gray-900">
                                BP: {item.data.vitals?.bp || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {item.data.notes && (
                          <div className="pl-13">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Doctor's Notes
                            </p>
                            <p className="text-sm text-gray-700">
                              {item.data.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pl-13">
                          <Link
                            href={`/doctor/appointment/${item.data.appointmentId}/prescription/view`}
                            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                          >
                            View Prescription →
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
