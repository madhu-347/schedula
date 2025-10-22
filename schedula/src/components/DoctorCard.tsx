"use client"; // <-- NEW: Makes this component interactive

import Image from 'next/image';
import { Heart } from 'lucide-react';
import { useState } from 'react'; // <-- NEW: Import useState

// Define a type for the doctor props
type DoctorCardProps = {
  doctor: {
    id: number;
    name: string;
    specialty: string;
    status: string;
    bio: string;
    time: string;
    imageUrl: string;
  };
};

export default function DoctorCard({ doctor }: DoctorCardProps) {
  // <-- NEW: Add a state to track if this card is "liked"
  const [isLiked, setIsLiked] = useState(false);

  // <-- NEW: A function to toggle the like state
  const handleLikeClick = () => {
    setIsLiked(!isLiked); // Toggles from true to false, or false to true
  };

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
          
          {/* ▼▼▼ MODIFIED HEART ICON ▼▼▼ */}
          <Heart
            size={20}
            onClick={handleLikeClick}
            // <-- NEW: Conditional classes
            className={`cursor-pointer transition-all duration-150 ${
              isLiked ? 'text-red-500 fill-red-500' : 'text-gray-300'
            }`}
          />
          {/* ▲▲▲ MODIFIED HEART ICON ▲▲▲ */}

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