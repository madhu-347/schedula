"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAppointmentsByDoctor } from "@/app/services/appointments.api";
import { Appointment } from "@/lib/types/appointment";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { User, Phone, Calendar, ChevronRight, HeartPulse , Search, Filter,ArrowLeft , Hospital  } from "lucide-react";
import { format } from  'date-fns'

export default function DoctorPatientsPage() {
  const { doctor } = useAuth();
  const router = useRouter();

  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("All");
  const [ageGroup, setAgeGroup] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

useEffect(() => {
  if (!doctor?.id) return;

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const appointments: Appointment[] = await getAppointmentsByDoctor(doctor.id);

      const uniquePatients = new Map();

      appointments.forEach((apt: Appointment) => {
        if (apt?.patientId && !uniquePatients.has(apt?.patientId)) {
          uniquePatients.set(apt?.patientId, {
            id: apt?.patientId,
            fullName: apt?.patientDetails?.fullName || "N/A",
            age: apt?.patientDetails?.age,
            gender: apt?.patientDetails?.gender,
            phone: apt?.patientDetails?.phone,
            problem: apt?.patientDetails?.problem,
            status: apt?.status,
            totalVisits: appointments.filter((a) => a.patientId === apt?.patientId).length,
            lastVisit: apt.date,
          });
        }
      });

      setPatients(Array.from(uniquePatients.values()));
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchPatients();
}, [doctor?.id]);

   const filteredPatients = patients.filter((p) => {
    const matchesSearch =
        p.fullName.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.toLowerCase().includes(search.toLowerCase());

    const matchesGender = gender === "All" || p.gender === gender;
    const matchesAge =
        ageGroup === "All" ||
        (ageGroup === "18-30" && p.age >= 18 && p.age <= 30) ||
        (ageGroup === "30-50" && p.age > 30 && p.age <= 50) ||
        (ageGroup === "50+" && p.age > 50);

    // Date filtering
    const visitDate = new Date(p.lastVisit);
    const matchesDate =
        (!startDate || visitDate >= new Date(startDate)) &&
        (!endDate || visitDate <= new Date(endDate));

    return matchesSearch && matchesGender && matchesAge && matchesDate;
});

  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
        <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Go back"
        >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8 flex flex-wrap gap-3 items-center justify-between border border-gray-100">
        
        <div className="flex items-center bg-gray-50 px-3 py-2 rounded-md w-full md:w-1/3">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
            type="text"
            placeholder="Search by name or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent w-full outline-none text-sm text-gray-700"
            />
        </div>

        <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="rounded-md px-3 py-2 text-sm text-gray-700"
        >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
        </select>

        <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-700"
        >
            <option value="All">All Ages</option>
            <option value="18-30">18–30</option>
            <option value="30-50">30–50</option>
            <option value="50+">50+</option>
        </select>
        <div className="flex items-center gap-2">
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-700"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700"
            />
            </div>
            {/* Clear Filters */}
            <button
                onClick={() => {
                setSearch("");
                setGender("All");
                setAgeGroup("All");
                setStartDate("");
                setEndDate("");
                }}
                className="text-sm bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-md transition-colors"
            >
                Clear Filters
            </button>
        </div>
        {filteredPatients.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No patients found yet.
          </div>
        ) : (
         <div className="space-y-6">
            {filteredPatients.map((p) => (
                <Card
                key={p.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 p-6 flex justify-between items-start min-h-[180px]"
                >
                {/* Left Section - Patient Info */}
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center">
                    <User className="w-6 h-6 text-cyan-600" />
                    </div>

                    <div>
                    <h2 className="text-lg font-semibold text-gray-900">{p.fullName}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {p.age} yrs • {p.gender} • {p.phone}
                    </p>

                    {p.problem && (
                        <p className="text-sm text-gray-700 mt-2 flex items-center gap-1">
                        <HeartPulse className="w-4 h-4 text-red-400" /> {p.problem}
                        </p>
                    )}

                    <div className="flex flex-col gap-2 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-cyan-500" />
                            <span>{" "}
                            {p.lastVisit
                                ? format(new Date(p.lastVisit), "EEEE, MMMM d, yyyy ")
                                : "—"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Hospital className="w-4 h-4 text-cyan-500" />
                            <span>Total Visits: {p.totalVisits}</span>
                        </div>
                        </div>
                                
                    {/* View Info link - only this is clickable */}
                    <button
                        onClick={() => router.push(`/doctor/patient/${p.id}`)}
                        className="text-sm text-cyan-600 cursor-pointer font-medium mt-4 flex items-center gap-1 hover:underline focus:outline-none"
                    >
                        View Info →
                    </button>
                    </div>
                </div>

                {/* Right Section - Status */}
                <div className="flex flex-col items-end justify-start">
                    <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        p.status === "Upcoming"
                        ? "bg-blue-100 text-blue-700"
                        : p.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : p.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                    >
                    {p.status || "Unknown"}
                    </span>
                </div>
                </Card>
            ))}
            </div>
        )}
      </div>
    </div>
  );
}
