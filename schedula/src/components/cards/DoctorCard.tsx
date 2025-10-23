"use client";

import Image from "next/image";
import { Heart } from "lucide-react";

// This is the new type definition
type DoctorCardProps = {
  doctor: {
    id: number;
    name: string;
    specialty: string;
    status: string;
    bio: string;
    time: string;
    imageUrl: string;
    is_favorited: boolean; // Prop is required
  };
  // NEW: This function prop is also required
  onToggleLike: (id: number) => void;
};

export default function DoctorCard({ doctor, onToggleLike }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex">
      <Image
        src={doctor.imageUrl}
        alt={doctor.name}
        width={96}
        height={96}
        className="rounded-lg w-24 h-24 object-cover"
      />
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{doctor.name}</h3>
            <p className="text-sm font-medium text-cyan-600">
              {doctor.specialty}
            </p>
          </div>

          <Heart
            size={20}
            className={`cursor-pointer transition-all duration-150 ${
              // We now use the prop directly
              doctor.is_favorited
                ? "text-red-500 fill-red-500"
                : "text-gray-300"
            }`}
          />
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
}
