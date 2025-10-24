"use client";

import React, { useState, useEffect } from "react";
// Update the path below to the correct relative path where ProtectedRoute exists
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Search,
  MapPin,
  Calendar,
  Clock,
  Star,
  Heart,
  ChevronRight,
} from "lucide-react";
import mockData from "@/lib/mockData.json";
import DoctorCard from "@/components/cards/DoctorCard";

export default function DashboardPage() {
  const [isLiked, setIsLiked] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [user, setUser] = useState<{
    id: number;
    email: string;
    password: string;
    name: string;
  } | null>(null);

  const allDoctors = mockData.doctors || [];

  const specialties = [
    "all",
    ...new Set(allDoctors.map((doctor: any) => doctor.specialty)),
  ];

  const filteredDoctors = allDoctors.filter((doctor: any) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleToggleLike = (doctorId: number) => {
    setIsLiked(!isLiked);
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Image
                  src="/user-profile-pic.png"
                  alt="User Profile"
                  width={48}
                  height={48}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 object-cover ring-2 ring-cyan-100"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">
                  Hello, {user?.name || "User"} 👋
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="inline w-3 h-3" />
                  <span className="hidden sm:inline">Dombivali, Mumbai</span>
                  <span className="sm:hidden">Dombivali</span>
                </p>
              </div>
            </div>
            <button className="relative p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
              Find Your Perfect Doctor
            </h2>
            <p className="text-cyan-50 text-xs sm:text-sm">
              Book appointments with top-rated healthcare professionals
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 mb-4 sm:mb-6 border border-gray-100">
            <div className="relative mb-3 sm:mb-4">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-white transition-all text-sm sm:text-base text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Specialty Filter */}
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    selectedSpecialty === specialty
                      ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {specialty === "all" ? "All Specialties" : specialty}
                </button>
              ))}
            </div>
          </div>

          {/* Results Header */}
          <div className="flex justify-between items-center mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {filteredDoctors.length} Doctor
              {filteredDoctors.length !== 1 ? "s" : ""} Found
            </h2>
          </div>

          {/* Doctor List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor: any) => (
                <Link key={doctor.id} href={`/user/doctor/${doctor.id}`}>
                  <DoctorCard doctor={doctor} onToggleLike={handleToggleLike} />
                </Link>
              ))
            ) : (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-8 sm:p-12 text-center border border-gray-100">
                <div className="bg-gray-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  No doctors found
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
