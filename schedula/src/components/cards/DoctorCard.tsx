"use client";

import Image from 'next/image';
import { Heart, Clock } from 'lucide-react'; // Make sure Clock is imported
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Needed for handleCardClick
import { useState } from 'react'; // Needed for isNavigating

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
  const router = useRouter(); // Initialize router
  const [isNavigating, setIsNavigating] = useState(false); // Add loading state

  // Define handleLikeClick
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleLike(doctor.id);
  };

  // Define handleCardClick
  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsNavigating(true);

    setTimeout(() => {
      router.push(`/user/doctor/${doctor.id}`); // Use the correct path with /user/
    }, 200);
  };

  return (
    <Link
      href={`/user/doctor/${doctor.id}`} // Use the correct path with /user/
      className="block"
      onClick={handleCardClick} // Attach the click handler
    >
      <div
        className={`bg-white rounded-2xl shadow-sm p-4 mb-4 flex transition-all duration-200 border border-gray-100 ${
          isNavigating ? 'opacity-70 scale-98' : 'hover:shadow-md hover:border-gray-200'
        }`}
      >
        {/* Use conditional rendering for the image */}
        {doctor.imageUrl ? (
           <Image
             src={doctor.imageUrl}
             alt={doctor.name || 'Doctor image'}
             width={80}
             height={80}
             className="rounded-xl w-20 h-20 object-cover flex-shrink-0" // Added flex-shrink-0
           />
         ) : (
           <div className="rounded-xl w-20 h-20 bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">Img</div>
         )}

        <div className="ml-4 flex-1 min-w-0"> {/* Added min-w-0 */}
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-2"> {/* Added flex-1 and margin */}
              <h3 className="font-bold text-md mb-0.5 truncate">{doctor.name}</h3> {/* Added truncate */}
              <p className="text-sm font-medium text-cyan-600 truncate">{doctor.specialty}</p> {/* Added truncate */}
            </div>

            {/* SINGLE CORRECT HEART ICON */}
            <Heart
              size={18}
              onClick={handleLikeClick} // Use correct handler
              className={`cursor-pointer transition-all duration-150 z-10 relative flex-shrink-0 ${ // Added flex-shrink-0
                doctor.is_favorited ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-red-300'
              }`}
            />
            {/* REMOVED DUPLICATE HEART ICON */}
          </div>

          {/* Correct Status styling */}
          <p className="text-xs font-semibold text-green-600 mt-1 inline-flex items-center gap-1">
             <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
             {doctor.status}
          </p>
          {/* Correct Bio styling */}
          <p className="text-xs text-gray-500 my-1.5 line-clamp-2">
            {doctor.bio}
          </p>

          {/* Correct Time styling */}
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
             <Clock size={12} className="text-gray-400"/>
             {doctor.time}
          </span>
           {/* Make sure this closing div is correct */}
        </div>
      </div>
    </Link> // Make sure Link closes correctly
  );
} // Make sure function closes correctly