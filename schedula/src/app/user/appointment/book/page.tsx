"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Patient {
  fullName: string;
  age: number;
  weight?: number;
  relationship?: string;
  problem?: string;
  mobileNumber: string;
}

export default function PatientDetailsPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitType, setVisitType] = useState<string>(""); // 🆕 Visit type state

  useEffect(() => {
    // Simulate short loading delay for smoother UI
    const timer = setTimeout(() => {
      const storedPatient = localStorage.getItem("patientDetails");
      const storedVisitType = localStorage.getItem("visitType");

      if (storedPatient) setPatient(JSON.parse(storedPatient));
      if (storedVisitType) setVisitType(storedVisitType);

      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Save visit type in localStorage whenever it changes
  const handleVisitTypeChange = (value: string) => {
    setVisitType(value);
    localStorage.setItem("visitType", value);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w mx-auto px-5 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/user/appointment/patient-details"
              className="p-2 -ml-2 rounded-full hover:bg-cyan-600/30 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              Patient Details & Appointment
            </h1>
          </div>
        </div>
      </header>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center h-[80vh] bg-gray-50">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#46C2DE] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 text-sm">Loading patient details...</p>
          </div>
        </div>
      ) : !patient ? (
        // No Data Found
        <div className="flex justify-center items-center h-[80vh] text-gray-500 text-lg">
          No patient details found.
        </div>
      ) : (
        // Patient Details Layout
        <div className="min-h-screen bg-gray-50 flex justify-center p-6">
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Patient Details Card */}
            <Card className="shadow-sm border border-gray-200 bg-white rounded-2xl">
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-gray-700">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{patient.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Relation</p>
                    <p className="font-medium">
                      {patient.relationship || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">{patient.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-medium">{patient.weight || "—"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-500">Problem</p>
                    <p className="font-medium leading-relaxed">
                      {patient.problem || "—"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{patient.mobileNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visit Type + Payment Section */}
            <Card className="shadow-sm border border-gray-200 bg-white rounded-2xl">
              <CardContent className="p-8 space-y-6">
                {/* Visit Type */}
                <div>
                  <label
                    htmlFor="visitType"
                    className="block text-sm text-gray-500 mb-1"
                  >
                    Visit Type
                  </label>
                  <select
                    id="visitType"
                    value={visitType} // 🆕 controlled input
                    onChange={(e) => handleVisitTypeChange(e.target.value)} // 🆕 save to state + localStorage
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#46C2DE]"
                  >
                    <option value="">Select visit type</option>
                    <option value="clinic">Clinic Visit</option>
                    <option value="online">Online Consultation</option>
                    <option value="home">Home Visit</option>
                  </select>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Payment</h3>
                  <p className="text-red-500 text-sm leading-relaxed">
                    Reduce your waiting time by paying the consulting fee
                    upfront.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button className="bg-[#46C2DE] hover:bg-[#3AB4CF] text-white font-semibold rounded-xl w-full sm:w-1/2">
                    Pay Consulting Fee
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#46C2DE] text-[#46C2DE] font-semibold rounded-xl w-full sm:w-1/2 hover:bg-[#E6F7FA]"
                  >
                    Quick Query
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
