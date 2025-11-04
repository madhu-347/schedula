"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Users, Star, MessageCircle } from "lucide-react";
import mockData from "@/lib/mockData.json";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

// --- START TYPE DEFINITIONS (FIXED) ---
type MockDoctorEntry = {
    id: number;
    [key: string]: unknown; // Use unknown instead of any
};

// Type for the Doctor object used in the component
type DoctorData = {
  id: number;
  name: string;
  specialty: string;
  profilePicture?: string;
  imageUrl?: string;
  time: string;
  bio?: string; // Added bio as optional
};
// --- END TYPE DEFINITIONS ---


export default function AppointmentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const doctorId = Number(id);

  // Find the doctor data
  const doctor: DoctorData | undefined = (mockData.doctors as unknown as MockDoctorEntry[] || []).find(
    (d: MockDoctorEntry) => d.id === doctorId
  ) as DoctorData | undefined;

  // --- Fallback for Doctor Not Found ---
  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-cyan-500 text-white p-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Link href="/user/dashboard" className="p-2 -ml-2 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold">Doctor Details</h1>
          </div>
        </header>
        <main className="flex-1 max-w-3xl mx-auto p-6">
          <p className="text-gray-700">Doctor not found for ID: {id}</p>
          <Link
            href="/user/dashboard"
            className="text-cyan-600 font-medium mt-4 inline-block"
          >
            Go back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-cyan-500 text-white pt-6 pb-5 rounded-b-3xl md:rounded-b-md shadow-md">
        <div className="max-w-3xl mx-auto px-5 flex items-center gap-3">
          <Link
            href="/user/dashboard"
            className="p-2 -ml-2 rounded-full hover:bg-cyan-600/30 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">Doctor Details</h1>
        </div>

        {/* Doctor Summary Card */}
        <div className="max-w-3xl mx-auto px-5 mt-4 -mb-12 relative z-10">
          <div className="bg-white text-gray-900 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <h2 className="text-lg font-bold leading-tight">{doctor.name}</h2>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
              <p className="text-sm text-cyan-600 font-medium mt-1">
                MBBS ,MS (Surgeon)
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Fellow of Sanskara netralaya, chennai
              </p>
            </div>
            {/* Conditional Image */}
            {doctor.imageUrl || doctor.profilePicture ? (
              <Image
                src={doctor.imageUrl || doctor.profilePicture || "/doctor-card-pic.png"}
                alt={doctor.name || 'Doctor'}
                width={64}
                height={64}
                className="rounded-lg w-16 h-16 object-cover flex-shrink-0"
              />
            ) : (
               <div className="rounded-lg w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">Img</div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-5 py-6 pb-24 pt-20 w-full"> {/* Adjusted pb */}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {/* Example Stat Cards */}
          <div className="bg-cyan-50 rounded-xl p-4 text-center hover:bg-cyan-100 transition"> <Users className="w-5 h-5 text-cyan-600 mx-auto mb-2" /> <p className="text-cyan-600 text-sm font-semibold">5,000+</p> <p className="text-xs text-gray-600">patients</p> </div>
          <div className="bg-cyan-50 rounded-xl p-4 text-center hover:bg-cyan-100 transition"> <Users className="w-5 h-5 text-cyan-600 mx-auto mb-2" /> <p className="text-cyan-600 text-sm font-semibold">10+</p> <p className="text-xs text-gray-600">years exper..</p> </div>
          <div className="bg-cyan-50 rounded-xl p-4 text-center hover:bg-cyan-100 transition"> <Star className="w-5 h-5 text-cyan-600 mx-auto mb-2" /> <p className="text-cyan-600 text-sm font-semibold">4.8</p> <p className="text-xs text-gray-600">rating</p> </div>
          <div className="bg-cyan-50 rounded-xl p-4 text-center hover:bg-cyan-100 transition"> <MessageCircle className="w-5 h-5 text-cyan-600 mx-auto mb-2" /> <p className="text-cyan-600 text-sm font-semibold">4,942</p> <p className="text-xs text-gray-600">reviews</p> </div>
        </div>

        {/* About Doctor */}
        <section className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">About Doctor</h3>
          <p className="text-gray-700 text-sm leading-6">
            {/* FIX: Removed 'as any' */}
            { doctor.bio || '15+ years of experience in all aspects of cardiology...' }
          </p>
        </section>

        {/* Service & Specialization */}
        <section className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Service & Specialization</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-600">Service</div>
            <div className="text-gray-900 font-medium">Medicare</div>
            <div className="text-gray-600">Specialization</div>
            <div className="text-gray-900 font-medium">{doctor.specialty}</div>
          </div>
        </section>

        {/* Availability */}
        <section className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Availability For Consulting</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-600">Monday to Friday</div>
            <div className="text-gray-900 font-medium">{doctor.time}</div>
          </div>
        </section>
      </main>

      {/* Floating Action Button (FAB) for Chat */}
      <Link
        href={`/user/chat/${doctor.id}`}
        className="fixed bottom-3 right-5 md:bottom-4 md:right-8 z-30 p-4 bg-cyan-500 text-white rounded-full shadow-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-transform hover:scale-105"
        aria-label="Start chat with doctor"
      >
        <MessageCircle size={24} /> {/* Chat Icon */}
      </Link>

    </div> // Closing root div
  );
}