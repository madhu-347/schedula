"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Star, Camera, MessageCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import { getDoctorById } from "@/app/services/doctor.api";
import { Doctor } from "@/lib/types/doctor";
import DoctorSummary from "@/components/cards/DoctorSummary";

export default function AppointmentDetailPage() {
  const params = useParams();
  const doctorId = params?.id as string;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDoctor = async (doctorId: string) => {
    setIsLoading(true);
    try {
      const response: any = await getDoctorById(doctorId);
      const doctorData: Doctor = response?.doctor || {};
      console.log("get doctor by id response", doctorData);
      setDoctor(doctorData);
    } catch (error) {
      console.error("Error fetching doctor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor(doctorId);
  }, [doctorId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Heading heading="Book Appointment" />
        <main className="flex-1 max-w-3xl mx-auto p-6">
          <p className="text-gray-700">Loading doctor details...</p>
        </main>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Heading heading="Book Appointment" />
        <main className="flex-1 max-w-3xl mx-auto p-6">
          <p className="text-gray-700">Doctor not found.</p>
          <Link
            href="/user/dashboard"
            className="text-cyan-600 font-medium mt-4 inline-block"
          >
            Go back
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-cyan-500 text-white pt-4 pb-4 rounded-b-3xl shadow-lg">
        <Heading heading={"Doctor Details"} />

        {/* Doctor Summary Card */}
        <DoctorSummary doctor={doctor} />
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-5 py-6 pb-24">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition-all border border-gray-100">
            <Users className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
            <p className="text-cyan-600 text-base font-bold">5,000+</p>
            <p className="text-xs text-gray-600 font-medium">patients</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition-all border border-gray-100">
            <Camera className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
            <p className="text-cyan-600 text-base font-bold">10+</p>
            <p className="text-xs text-gray-600 font-medium">years exp.</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition-all border border-gray-100">
            <Star className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
            <p className="text-cyan-600 text-base font-bold">4.8</p>
            <p className="text-xs text-gray-600 font-medium">rating</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition-all border border-gray-100">
            <MessageCircle className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
            <p className="text-cyan-600 text-base font-bold">4,942</p>
            <p className="text-xs text-gray-600 font-medium">reviews</p>
          </div>
        </div>

        {/* About Doctor */}
        <section className="mb-6 bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3 text-base">
            About Doctor
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            15+ years of experience in all aspects of cardiology, including
            non-invasive and interventional interventional procedures.
          </p>
        </section>

        {/* Service & Specialization */}
        <section className="mb-6 bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 text-base">
            Service & Specialization
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Service</span>
              <span className="text-sm text-gray-900 font-semibold">
                Medicare
              </span>
            </div>
            <div className="border-t border-gray-100"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Specialization</span>
              <span className="text-sm text-gray-900 font-semibold">
                {doctor.specialty}
              </span>
            </div>
          </div>
        </section>

        {/* Availability */}
        <section className="mb-6 bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 text-base">
            Availability For Consulting
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Monday to Friday</span>
            <span className="text-sm text-gray-900 font-semibold">
              10 AM To 5 PM
            </span>
          </div>
        </section>
        <div className="max-w-3xl mx-auto px-5">
          <Button
            asChild
            className="w-full py-6 rounded-xl font-bold text-base shadow-lg cursor-pointer"
          >
            <Link href={`/user/doctor/${doctor.id}/book`}>
              Book Appointment
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
