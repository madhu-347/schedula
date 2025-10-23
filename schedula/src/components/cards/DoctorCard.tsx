"use client";

import Image from 'next/image';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <-- 1. Import useRouter
import { useState } from 'react'; // <-- 1. Import useState for loading state

type DoctorCardProps = {
  doctor: {
    id: number;
    name: string;
    specialty: string;
    status: string;
    bio: string;
    time: string;
    imageUrl: string;
    is_favorited: boolean;
  };
  onToggleLike: (id: number) => void;
};

export default function DoctorCard({ doctor, onToggleLike }: DoctorCardProps) {
  const router = useRouter(); // <-- 2. Initialize router
  const [isNavigating, setIsNavigating] = useState(false); // <-- 2. Add loading state

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleLike(doctor.id);
  };

  // --- 3. NEW Click Handler for the Link ---
  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Stop the link from navigating immediately
    setIsNavigating(true); // Set loading state (optional: add visual feedback)

    // Wait for 200 milliseconds (0.2 seconds)
    setTimeout(() => {
      router.push(`/doctor/${doctor.id}`);
      // No need to setIsNavigating(false) as we are leaving the page
    }, 200);
  };
  // --- End NEW Handler ---

  return (
    <Link
      href={`/doctor/${doctor.id}`}
      className="block"
      onClick={handleCardClick}
    >
      {/* Added rounded-2xl, adjusted padding, margin */}
      <div
        className={`bg-white rounded-2xl shadow-sm p-4 mb-4 flex transition-all duration-200 border border-gray-100 ${ // CHANGE: Added rounded-2xl, border
          isNavigating ? 'opacity-70 scale-98' : 'hover:shadow-md hover:border-gray-200' // Added hover border
        }`}
      >
        {/* Adjusted image size and rounding */}
        <Image
          src={doctor.imageUrl}
          alt={doctor.name}
          width={80} // CHANGE: 96 to 80
          height={80} // CHANGE: 96 to 80
          className="rounded-xl w-20 h-20 object-cover" // CHANGE: rounded-lg to rounded-xl, w/h-24 to w/h-20
        />
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              {/* Adjusted font size/margins */}
              <h3 className="font-bold text-md mb-0.5">{doctor.name}</h3> {/* CHANGE: text-lg to text-md, added mb-0.5 */}
              <p className="text-sm font-medium text-cyan-600">
                {doctor.specialty}
              </p>
            </div>

            <Heart
              size={18} // CHANGE: size 20 to 18
              onClick={handleLikeClick}
              className={`cursor-pointer transition-all duration-150 z-10 relative ${
                doctor.is_favorited ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-red-300' // Added hover effect
              }`}
            />
          </div>
          {/* Adjusted status styling */}
          <p className="text-xs font-semibold text-green-600 mt-1 inline-flex items-center gap-1"> {/* CHANGE: text-sm to text-xs, added inline-flex etc */}
             <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span> {/* Added green dot */}
             {doctor.status}
          </p>
          {/* Adjusted bio styling */}
          <p className="text-xs text-gray-500 my-1.5 line-clamp-2"> {/* CHANGE: my-2 to my-1.5, added line-clamp */}
            {doctor.bio}
          </p>

          {/* Adjusted time styling */}
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"> {/* CHANGE: adjusted padding, text color, added icon */}
             <Clock size={12} className="text-gray-400"/> {/* Added Clock icon */}
             {doctor.time}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Add Clock to imports if not already there
import { Clock } from 'lucide-react';