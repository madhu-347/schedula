"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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

// Enhanced Doctor Card Component
// const DoctorCard = ({
//   doctor,
// }: {
//   doctor: {
//     id: number;
//     name: string;
//     specialty: string;
//     status: string;
//     bio: string;
//     time: string;
//     imageUrl?: string;
//   };
// }) => {
// const [isLiked, setIsLiked] = useState(false);

//   return (
//     <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 mb-4 border border-gray-100">
//       <div className="flex gap-4">
//         <div className="relative shrink-0">
//           <Image
//             src={doctor.imageUrl || "/male-doctor-avatar.png"}
//             alt={doctor.name}
//             width={90}
//             height={90}
//             className="rounded-xl w-[90px] h-[90px] object-cover ring-2 ring-cyan-100"
//           />
//           <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
//             {/* <div className="w-3 h-3 bg-green-500 rounded-full"></div> */}
//           </div>
//         </div>

//         <div className="flex-1 min-w-0">
//           <div className="flex justify-between items-start mb-2">
//             <div className="flex-1">
//               <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight">
//                 {doctor.name}
//               </h3>
//               <p className="text-sm font-semibold text-cyan-600 mb-1">
//                 {doctor.specialty}
//               </p>
//             </div>
//             <button
//               onClick={() => setIsLiked(!isLiked)}
//               className={`p-2 rounded-full transition-all ${
//                 isLiked
//                   ? "bg-red-50 text-red-500"
//                   : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
//               }`}
//             >
//               <Heart
//                 className="w-5 h-5"
//                 fill={isLiked ? "currentColor" : "none"}
//               />
//             </button>
//           </div>

//           <div className="flex items-center gap-2 mb-2">
//             <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
//               <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
//               {doctor.status}
//             </span>
//             <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
//               <Clock className="w-3 h-3" />
//               {doctor.time}
//             </span>
//           </div>

//           <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
//             {doctor.bio}
//           </p>

//           <button className="bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
//             Book Appointment
//             <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

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

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="p-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/user-profile-pic.png"
                  alt="User Profile"
                  width={48}
                  height={48}
                  className="rounded-full w-12 h-12 object-cover ring-2 ring-cyan-100"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Hello, {user?.name || "User"} 👋
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="inline w-3 h-3" />
                  Dombivali, Mumbai
                </p>
              </div>
            </div>
            <button className="relative p-3 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-6 h-6 text-gray-700" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-5 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-linear-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Find Your Perfect Doctor</h2>
          <p className="text-cyan-50 text-sm">
            Book appointments with top-rated healthcare professionals
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-gray-100">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Specialty Filter */}
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedSpecialty === specialty
                    ? "bg-linear-to-r from-cyan-500 to-cyan-600 text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {specialty === "all" ? "All Specialties" : specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            {filteredDoctors.length} Doctor
            {filteredDoctors.length !== 1 ? "s" : ""} Found
          </h2>
        </div>

        {/* Doctor List */}
        <div>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor: any) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onToggleLike={(doctorId) => setIsLiked(!isLiked)}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No doctors found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
