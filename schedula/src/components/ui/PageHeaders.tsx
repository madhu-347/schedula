import React from 'react'
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  profilePicture?: string;
}

function PageHeaders({ doctor }: { doctor: Doctor }) {
  return (
    <div>
      {/* <header className="bg-cyan-500 text-white pt-6 pb-5 rounded-b-3xl md:rounded-b-md shadow-md">
        <div className="max-w-3xl mx-auto px-5 flex items-center gap-3">
          <Link
            href={`/user/doctor/${doctor.id}`}
            className="p-2 -ml-2 rounded-full hover:bg-cyan-600/30 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">Book Appointment</h1>
        </div>

        {/* Doctor Summary Card */}
        {/* <div className="max-w-3xl mx-auto px-5 mt-4"></div>
          <div className="bg-white text-gray-900 rounded-2xl p-4 flex items-center justify-between shadow">
            <div>
              <h2 className="text-lg font-bold leading-tight">{doctor.name}</h2>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
              <p className="text-sm text-cyan-600 font-medium mt-1">
                MBBS ,MS (Surgeon)
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Fellow of Sanskara netralaya, chennai
              </p>
            </div>
            <Image
              src={doctor.profilePicture || "/male-doctor.png"}
              alt={doctor.name}
              width={64}
              height={64}
              className="rounded-lg w-25 h-25 object-cover"
            />
          </div>
        </div>
      </header> */} 
    </div>
  );
}

export default PageHeaders;

        