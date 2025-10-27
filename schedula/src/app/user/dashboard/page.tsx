"use client";

import React, { useState, useEffect } from "react";
// Update the path below to the correct relative path where ProtectedRoute exists
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Image from "next/image";
import Link from "next/link"; // Single correct import for Link
import { Bell, Search, MapPin, X } from "lucide-react"; // Make sure X is imported
import DoctorCard from "@/components/cards/DoctorCard"; // Use the imported card
import { Doctor } from "@/lib/types/doctor";
// --- ADD TYPE DEFINITIONS HERE ---

type User = {
  id?: number; // Make ID optional as it might not be in mockData.users
  email?: string; // Make email optional if not always present
  mobile?: string; // Add mobile if it exists
  name: string;
  location?: string; // Optional location
};
// --- END TYPE DEFINITIONS ---

export default function DashboardPage() {
  // --- State Variables ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [user, setUser] = useState<User | null>(null);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]); // State for doctors fetched from API
  const [isLoading, setIsLoading] = useState(true); // Loading state for API fetch
  // Use 'showNotifications' from the merged code for consistency
  const [showNotifications, setShowNotifications] = useState(false);
  // --- End State Variables ---

  // --- Fetch User from localStorage ---
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
  // --- End Fetch User ---

  // --- Fetch Doctors from API ---
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/doctors");
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        console.log("doctor data from api: ", data);
        // Use correct ApiDoctor type here
        const doctorsWithFavorite: Doctor[] = data.doctors.map(
          (doc: Doctor) => ({
            ...doc,
            is_favorited: false, // Initialize as not favorited
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
  }, []); // Run only once on mount
  // --- End Fetch Doctors ---

  // --- Handle Like Toggle (Keep ONLY this version) ---
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
  // --- End Handle Like Toggle ---

  // --- DELETE THE DUPLICATE handleToggleLike FUNCTION ---
  // The incorrect one using setIsLiked should be removed

  // --- Filtering Logic ---
  const specialties = [
    "all",
    ...new Set(allDoctors.map((doctor) => doctor.specialty)),
  ];

  // Use correct Doctor type here
  const filteredDoctors = allDoctors.filter((doctor: Doctor) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      doctor.name.toLowerCase().includes(lowerSearchTerm) ||
      doctor.specialty.toLowerCase().includes(lowerSearchTerm);
    const matchesSpecialty =
      selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });
  // --- End Filtering Logic ---

  // --- Notification Panel Toggle ---
  // Use setShowNotifications directly in onClick
  // --- End Notification Panel Toggle ---

  // --- Render UI ---
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
        {/* Enhanced Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          {/* Adjusted padding and added max-w-7xl mx-auto for responsiveness */}
          <div className="px-4 py-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <Image
                    src="/user-profile-pic.png" // Use consistent image
                    alt="User Profile"
                    width={48}
                    height={48}
                    className="rounded-full w-10 h-10 sm:w-12 sm:h-12 object-cover ring-2 ring-cyan-100"
                  />
                  {/* Removed green online dot */}
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-gray-900">
                    Hello, {user?.name ? user.name.split(" ")[0] : "User"} 👋
                  </h1>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="inline w-3 h-3" />
                    <span className="hidden sm:inline">
                      {user?.location || "Dombivali, Mumbai"}
                    </span>
                    <span className="sm:hidden">
                      {user?.location?.split(",")[0] || "Dombivali"}
                    </span>
                  </p>
                </div>
              </div>
              {/* Corrected Notification Button */}
              <button
                onClick={() => setShowNotifications(true)} // Use state setter directly
                className="relative p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" // Correct classes
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>{" "}
              {/* Ensured button is closed */}
            </div>
          </div>
        </header>

        {/* Notifications Panel */}
        <div
          // Use showNotifications state
          className={`fixed top-4 right-4 w-[90%] max-w-[300px] h-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-40 overflow-hidden transform transition-transform duration-300 ease-in-out ${
            showNotifications
              ? "translate-x-0 pointer-events-auto"
              : "translate-x-[120%] pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
            <h2 className="text-base font-semibold text-gray-900">
              Notifications
            </h2>
            <button
              onClick={() => setShowNotifications(false)} // Use state setter
              className="p-2 rounded-full hover:bg-gray-100 cursor-pointer shrink-0"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="text-sm text-gray-600 text-center">
              No notifications now
            </div>
          </div>
        </div>
        {/* Overlay */}
        {showNotifications && (
          <div
            className="fixed inset-0 bg-transparent bg-opacity-30 z-30"
            onClick={() => setShowNotifications(false)} // Use state setter
          ></div>
        )}

        {/* Main Content - SINGLE CORRECT VERSION */}
        {/* Added pb-24 for bottom nav space */}
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
                // Use correct Doctor type and pass correct props
                filteredDoctors.map((doctor: Doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onToggleLike={handleToggleLike} // Pass correct handler
                  />
                  // Removed extra Link wrapper
                ))
              ) : (
                // No doctors found message
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
