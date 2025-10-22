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
} from "lucide-react";
import mockData from "@/lib/mockData.json";

// Simple Doctor Card Component
const DoctorCard = ({
  doctor,
}: {
  doctor: {
    id: number;
    name: string;
    specialty: string;
    status: string;
    bio: string;
    time: string;
    imageUrl?: string;
  };
}) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex hover:shadow-md transition-shadow">
      <Image
        src={doctor.imageUrl || "/male-doctor-avatar.png"}
        alt={doctor.name}
        width={80}
        height={80}
        className="rounded-lg w-20 h-20 object-cover"
      />
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{doctor.name}</h3>
            <p className="text-sm font-medium text-cyan-600">
              {doctor.specialty}
            </p>
          </div>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full transition-colors ${
              isLiked ? "text-red-500" : "text-gray-300 hover:text-red-400"
            }`}
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm font-semibold text-green-600 mt-1">
          {doctor.status}
        </p>
        <p className="text-xs text-gray-500 my-2">{doctor.bio}</p>
        <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
          {doctor.time}
        </span>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [user, setUser] = useState<{
    id: number;
    email: string;
    password: string;
    name: string;
  } | null>(null);

  // Get doctors from mockData
  const allDoctors = mockData.doctors || [];

  // Get unique specialties for filter
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
    // Get user from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/user-profile-pic.png"
              alt="User Profile"
              width={40}
              height={40}
              className="rounded-full w-10 h-10 object-cover"
            />
            <div className="ml-3">
              <h1 className="text-lg font-semibold">
                Hello, {user?.name || "User"}
              </h1>
              <p className="text-xs text-gray-500">
                <MapPin className="inline w-3 h-3 mr-1" />
                Dombivali, Mumbai
              </p>
            </div>
          </div>
          <button className="relative p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Find Your Perfect Doctor</h2>
          <p className="text-gray-600">
            Book appointments with top-rated healthcare professionals
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {/* Specialty Filter */}
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSpecialty === specialty
                    ? "bg-cyan-400 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {specialty === "all" ? "All Specialties" : specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-cyan-400 mr-2" />
              <h3 className="text-lg font-semibold">{allDoctors.length}</h3>
            </div>
            <p className="text-sm text-gray-600">Available Doctors</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">24/7</h3>
            </div>
            <p className="text-sm text-gray-600">Emergency Support</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold">4.9</h3>
            </div>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {filteredDoctors.length} Doctor
            {filteredDoctors.length !== 1 ? "s" : ""} Found
          </h2>
        </div>

        {/* Doctor List */}
        <div>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor: any) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
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
