"use client";

import Image from "next/image";
import { Heart, Clock } from "lucide-react"; // Make sure Clock is imported
import Link from "next/link";
import { useRouter } from "next/navigation"; // <-- ADDED Import
import { useState } from "react"; // <-- ADDED Import
import { Doctor } from "@/lib/types/doctor";

type DoctorCardProps = {
  doctor: Doctor; // ✅ FIXED
  onToggleLike: (id: string) => void;
};

export default function DoctorCard({ doctor, onToggleLike }: DoctorCardProps) {
  const router = useRouter(); // <-- ADDED Initialize router
  const [isNavigating, setIsNavigating] = useState(false); // <-- ADDED loading state

  // --- ADDED handleLikeClick ---
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleLike(doctor.id);
  };
  // --- END handleLikeClick ---

  // --- ADDED handleCardClick ---
  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsNavigating(true);

    setTimeout(() => {
      // Ensure this path is correct based on your routing structure
      router.push(`/user/doctor/${doctor.id}`);
    }, 200);
  };
  // --- END handleCardClick ---

  return (
    <Link
      href={`/user/doctor/${doctor.id}`} // Correct path
      className="block"
      onClick={handleCardClick} // Attach the handler
    >
      <div
        className={`bg-white rounded-2xl shadow-sm p-4 mb-4 flex transition-all duration-200 border border-gray-100 ${
          isNavigating
            ? "opacity-70 scale-98"
            : "hover:shadow-md hover:border-gray-200"
        }`}
      >
        {/* Conditional Image Rendering */}
        {doctor?.image ? (
          <Image
            src={doctor.image}
            alt={doctor.firstName || "Doctor image"}
            width={80}
            height={80}
            className="rounded-xl w-20 h-20 object-cover shrink-0"
          />
        ) : (
          <div className="rounded-xl w-20 h-20 bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
            Img
          </div>
        )}

        <div className="ml-4 flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-2">
              <h3 className="font-bold text-md mb-0.5 truncate">
                {doctor.firstName} {doctor.lastName}
              </h3>
              <p className="text-sm font-medium text-cyan-600 truncate">
                {doctor.qualifications}
              </p>
              <p className="text-sm font-medium text-cyan-600 truncate">
                {doctor.specialty}
              </p>
            </div>

            {/* SINGLE CORRECT HEART ICON */}
            <Heart
              size={18}
              onClick={handleLikeClick} // Use correct handler
              className={`cursor-pointer transition-all duration-150 z-10 relative shrink-0 ${
                doctor.is_favorited
                  ? "text-red-500 fill-red-500"
                  : "text-gray-300 hover:text-red-300"
              }`}
            />
          </div>

          {/* Correct Status styling */}
          {doctor.isAvailable ? (
            <p className="text-xs font-semibold text-green-600 mt-1 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
              {"Available"}
            </p>
          ) : (
            <p className="text-xs font-semibold text-red-600 mt-1 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
              {"Unavailable"}
            </p>
          )}

          {/* Correct Bio styling */}
          <p className="text-xs text-gray-500 my-1.5 line-clamp-2">
            {doctor.bio}
          </p>

          {/* Correct Time styling */}
          {/* <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Clock size={12} className="text-gray-400" />
            {doctor?.availableTime?.morning.from} -{" "}
            {doctor?.availableTime?.morning.to} |{" "}
            {doctor?.availableTime?.evening.from} -{" "}
            {doctor?.availableTime?.evening.to}
          </span> */}

          {/* instead of available time display available days */}
          <p className="text-xs font-semibold text-cyan-600 mt-1 inline-flex items-center gap-1">
            <Clock size={12} className="text-gray-400" />
            {doctor.availableDays && doctor.availableDays.length > 0
              ? doctor.availableDays.join(", ")
              : "N/A"}
          </p>
          {/* Make sure this closing div is correct */}
        </div>
      </div>
    </Link> // Make sure Link closes correctly
  );
} // Make sure function closes correctly
