"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Search, X } from "lucide-react";
import DoctorCard from "@/components/cards/DoctorCard";
import { Doctor } from "@/lib/types/doctor";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types/user";
// import { getUser } from "@/lib/api/user";

export default function DashboardPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [user, setUser] = useState<User | null>(null);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch User from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  // Fetch Doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/doctors");
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        console.log("doctor data from api: ", data);

        const doctorsWithFavorite: Doctor[] = data.doctors.map(
          (doc: Doctor) => ({
            ...doc,
            is_favorited: false,
          })
        );

        setAllDoctors(doctorsWithFavorite);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleToggleLike = (id: number) => {
    setAllDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.id === id
          ? { ...doctor, is_favorited: !doctor.is_favorited }
          : doctor
      )
    );
    console.log(`Toggled like for doctor ID: ${id}`);
  };

  // Filtering Logic
  const specialties = [
    "all",
    ...new Set(allDoctors.map((doctor) => doctor.specialty)),
  ];

  const filteredDoctors = allDoctors.filter((doctor: Doctor) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      doctor.firstName.toLowerCase().includes(lowerSearchTerm) ||
      doctor.lastName.toLowerCase().includes(lowerSearchTerm) ||
      doctor.specialty.toLowerCase().includes(lowerSearchTerm);
    const matchesSpecialty =
      selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  // this logic is in the header
  // const handleLogout = () => {
  //   localStorage.removeItem("user");
  //   localStorage.removeItem("userExpiry");
  //   localStorage.removeItem("pendingUser");
  //   localStorage.removeItem("generatedOtp");
  //   localStorage.removeItem("otpExpiry");
  //   router.push("/user/login");
  // };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
        {/* Main Content */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 md:px-8 lg:px-12 pb-24">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Banner */}
            <div className="bg-linear-to-br from-cyan-500 to-cyan-600 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-white">
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
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
                      selectedSpecialty === specialty
                        ? "bg-cyan-500 border-cyan-500 text-white shadow-sm"
                        : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300"
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
              {isLoading ? (
                <p className="text-center text-gray-500 py-10">
                  Loading doctors...
                </p>
              ) : filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor: Doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onToggleLike={handleToggleLike}
                  />
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
