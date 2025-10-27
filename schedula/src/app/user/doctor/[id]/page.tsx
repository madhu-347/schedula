"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Users, Star, Camera, MessageCircle } from "lucide-react";
import mockData from "@/lib/mockData.json";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AppointmentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const doctorId = Number(id);
  const doctor = (mockData.doctors || []).find((d) => d.id === doctorId);

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-cyan-500 text-white p-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Link href="/dashboard" className="p-2 -ml-2 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold">Book Appointment</h1>
          </div>
        </header>
        <main className="flex-1 max-w-3xl mx-auto p-6">
          <p className="text-gray-700">Doctor not found.</p>
          <Link
            href="/dashboard"
            className="text-cyan-600 font-medium mt-4 inline-block"
          >
            Go back
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-cyan-500 text-white pt-6 pb-5 rounded-b-3xl md:rounded-b-md shadow-md">
        <div className="max-w-3xl mx-auto px-5 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 -ml-2 rounded-full hover:bg-cyan-600/30 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">Book Appointment</h1>
        </div>

        {/* Doctor Summary Card */}
        <div className="max-w-3xl mx-auto px-5 mt-4">
          <div className="bg-white text-gray-900 rounded-2xl p-4 flex items-center justify-between shadow">
            <div>
              <h2 className="text-lg font-bold leading-tight">{doctor.name}</h2>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
              <p className="text-sm text-cyan-600 font-medium mt-1">
                MBBS, MS (Surgeon)
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Fellow of Sanskara netralaya, chennai
              </p>
            </div>
            <Image
              src={doctor.profilePicture || "/male-doctor.png"}
              alt={doctor.name}
              width={64}
              height={64}
              className="rounded-lg w-25 h-25 object-cover"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-5 py-6 pb-28">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-cyan-50 rounded-xl p-4 text-center hover:bg-cyan-100 transition">
            <Users className="w-5 h-5 text-cyan-600 mx-auto mb-2" />
            <p className="text-cyan-600 text-sm font-semibold">5,000+</p>
            <p className="text-xs text-gray-600">patients</p>
          </div>
          <div className="bg-cyan-50 rounded-xl p-4 text-center hover:bg-cyan-100 transition">
            <Camera className="w-5 h-5 text-cyan-600 mx-auto mb-2" />
            <p className="text-cyan-600 text-sm font-semibold">10+</p>
            <p className="text-xs text-gray-600">years exper..</p>
          </div>
          <div className="bg-cyan-50 rounded-xl p-4 text-center hover:bg-cyan-100 transition">
            <Star className="w-5 h-5 text-cyan-600 mx-auto mb-2" />
            <p className="text-cyan-600 text-sm font-semibold">4.8</p>
            <p className="text-xs text-gray-600">rating</p>
          </div>
          <div className="bg-cyan-50 rounded-xl p-4 text-center hover:bg-cyan-100 transition">
            <MessageCircle className="w-5 h-5 text-cyan-600 mx-auto mb-2" />
            <p className="text-cyan-600 text-sm font-semibold">4,942</p>
            <p className="text-xs text-gray-600">reviews</p>
          </div>
        </div>

        {/* About Doctor */}
        <section className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">About Doctor</h3>
          <p className="text-gray-700 text-sm leading-6">
            15+ years of experience in all aspects of cardiology, including
            non-invasive and interventional interventional procedures.
          </p>
        </section>

        {/* Service & Specialization */}
        <section className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Service & Specialization
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-600">Service</div>
            <div className="text-gray-900 font-medium">Medicare</div>
            <div className="text-gray-600">Specialization</div>
            <div className="text-gray-900 font-medium">{doctor.specialty}</div>
          </div>
        </section>

        {/* Availability */}
        <section className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Availability For Consulting
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-600">Monday to Friday</div>
            <div className="text-gray-900 font-medium">10 PM To 5 PM</div>
          </div>
        </section>
      </main>

      {/* Floating CTA button (no background bar) */}
      {/* Floating CTA buttons (Chat and Book) */}
      {/* ADJUSTED: bottom-20 to clear nav bar, added flex gap */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4">
        <div className="flex gap-4">
          {/* Chat Button */}
          <div className="flex-1">
            <Link href={`/user/chat/${doctor.id}`} className="flex-1" passHref>
              <Button
                variant="outline" // Secondary style
                size="lg"
                className="w-full text-cyan-600 border-cyan-600 hover:bg-cyan-50/50" // Example styling
              >
                Chat Now
              </Button>
            </Link>
          </div>

          {/* Book Appointment Button */}
          <div className="flex-1">
            <Button
              asChild
              size="lg"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              <Link href={`/user/doctor/${doctor.id}/book`}>
                Book Appointment
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
