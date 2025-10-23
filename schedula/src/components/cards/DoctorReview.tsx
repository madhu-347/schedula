// a div with border, and the doctor image at the left and doctor name, speciality - location
// and qualification at the right side of the image

import React from "react";
import Image from "next/image";


// Doctor Info Card Component
interface DoctorInfoCardProps {
  name: string;
  specialty: string;
  location: string;
  qualification: string;
  imageUrl?: string;
}

export const DoctorInfoCard: React.FC<DoctorInfoCardProps> = ({
  name,
  specialty,
  location,
  qualification,
  imageUrl = "/male-doctor-avatar.png",
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
      <div className="flex items-center gap-4">
        <Image
          src={imageUrl}
          alt={name}
          width={100}
          height={100}
          className="rounded-2xl w-[100px] h-[100px] object-cover ring-2 ring-gray-100"
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{name}</h2>
          <p className="text-sm font-medium text-gray-600 mb-1">
            {specialty} - {location}
          </p>
          <p className="text-sm text-gray-500">{qualification}</p>
        </div>
      </div>
    </div>
  );
};
