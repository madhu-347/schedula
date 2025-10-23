"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Bell, Search, MapPin, X } from "lucide-react"; // Import X
import DoctorCard from "@/components/cards/DoctorCard"; // Use the imported card

// --- Define Types (Fixes 'any') ---
// Type for data coming from /api/doctors
type ApiDoctor = {
  id: number;
  name: string;
  specialty: string;
  status: string;
  bio: string;
  time: string;
  imageUrl: string;
  // Add other fields from mockData if needed by DoctorCard
};

// Type for our page's state, which adds the 'is_favorited' flag
type Doctor = ApiDoctor & {
  is_favorited: boolean;
};

// Type for user data from localStorage
type User = {
  id: number; // Assuming user ID exists, adjust if needed
  email: string;
  name: string;
  location?: string; // Optional location
};
// --- End Types ---


export default function DashboardPage() {
  // --- State Variables ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [user, setUser] = useState<User | null>(null);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]); // State for doctors fetched from API
  const [isLoading, setIsLoading] = useState(true); // Loading state for API fetch
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // State for notification panel
  // --- End State Variables ---

  // --- Fetch User from localStorage ---
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) { console.error("Failed to parse user from localStorage", e); }
    }
  }, []);
  // --- End Fetch User ---

  // --- Fetch Doctors from API ---
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/doctors'); // Fetch from API
        if (!response.ok) throw new Error('Failed to fetch doctors');
        const data = await response.json();

        const doctorsWithFavorite: Doctor[] = data.doctors.map((doc: ApiDoctor) => ({
          ...doc,
          is_favorited: false, // Initialize as not favorited
        }));

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


  // --- Handle Like Toggle ---
  const handleToggleLike = (id: number) => {
    setAllDoctors(prevDoctors =>
      prevDoctors.map(doctor =>
        doctor.id === id
          ? { ...doctor, is_favorited: !doctor.is_favorited }
          : doctor
      )
    );
    console.log(`Toggled like for doctor ID: ${id}`);
  };
  // --- End Handle Like Toggle ---


  // --- Filtering Logic ---
  const specialties = [
    "all",
    // Use Set on fetched doctors
    ...new Set(allDoctors.map((doctor) => doctor.specialty)),
  ];

  const filteredDoctors = allDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });
  // --- End Filtering Logic ---

  // --- Notification Panel Toggle ---
   const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };
  // --- End Notification Panel Toggle ---


  // --- Render UI ---
  // --- Render UI ---
  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 relative overflow-x-hidden">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="p-5 max-w-md mx-auto">
          <div className="flex justify-between items-center">
            {/* ... (Header content remains the same) ... */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/user-profile-pic.png" // Use consistent image
                  alt="User Profile"
                  width={48}
                  height={48}
                  className="rounded-full w-12 h-12 object-cover ring-2 ring-cyan-100"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Hello, {user?.name ? user.name.split(' ')[0] : "User"} 👋
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="inline w-3 h-3" />
                  {user?.location || "Dombivali, Mumbai"}
                </p>
              </div>
            </div>
            <button className="relative p-3 hover:bg-gray-100 rounded-full transition-colors" onClick={toggleNotifications}>
              <Bell className="w-6 h-6 text-gray-700" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-5 max-w-md mx-auto pb-24">
        {/* Welcome Banner - Reduced padding */}
        <div className="bg-linear-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg p-4 mb-5 text-white"> {/* CHANGE: p-6 to p-4, mb-6 to mb-5 */}
          <h2 className="text-xl font-bold mb-1">Find Your Perfect Doctor</h2> {/* CHANGE: text-2xl to text-xl, mb-2 to mb-1 */}
          <p className="text-cyan-50 text-sm">
            Book appointments with top-rated healthcare professionals
          </p>
        </div>

        {/* Search Section - Added padding and curve */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-5 border border-gray-100"> {/* CHANGE: p-5 to p-4, mb-6 to mb-5 */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" /> {/* Added z-10 */}
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // CHANGE: Adjusted padding and border, added focus shadow
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-200 transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Specialty Filter - Adjusted spacing */}
          <div className="flex flex-wrap gap-2"> {/* No change needed here, gap-2 looks good */}
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                 // CHANGE: Adjusted padding, border, and added subtle shadow on hover/active
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  selectedSpecialty === specialty
                    ? "bg-cyan-500 border-cyan-500 text-white shadow-sm"
                    : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300 active:bg-cyan-50 active:text-cyan-700 active:border-cyan-200"
                }`}
              >
                {specialty === "all" ? "All Specialties" : specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-4"> {/* CHANGE: mb-5 to mb-4 */}
          <h2 className="text-lg font-bold text-gray-900"> {/* CHANGE: text-xl to text-lg */}
            {filteredDoctors.length} Doctor
            {filteredDoctors.length !== 1 ? "s" : ""} Found
          </h2>
          {/* Optional: Add a 'See All' link if needed later */}
        </div>

        {/* Doctor List */}
        <div>
          {isLoading ? (
             <p className="text-center text-gray-500 py-10">Loading doctors...</p>
          ) : filteredDoctors.length > 0 ? (
            // The DoctorCard component itself will be updated next
            filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onToggleLike={handleToggleLike}
              />
            ))
          ) : (
            // No doctors found message - Added padding
            <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-gray-100"> {/* CHANGE: p-12 to p-6 */}
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"> {/* CHANGE: w/h-20 to w/h-16, mb-4 to mb-3 */}
                <Search className="w-8 h-8 text-gray-400" /> {/* CHANGE: w/h-10 to w/h-8 */}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1"> {/* CHANGE: text-xl to text-lg, mb-2 to mb-1 */}
                No doctors found
              </h3>
              <p className="text-gray-600 text-sm"> {/* Added text-sm */}
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>
      </div>

       {/* --- Notification Panel (No changes needed) --- */}
       <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <button onClick={toggleNotifications} className="p-2 text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 text-center text-gray-500">
          No Notifications for now
        </div>
      </div>
      {isNotificationsOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleNotifications}
        ></div>
      )}
    </main>
  );
}