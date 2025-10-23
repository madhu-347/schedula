"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Users, Award, Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';

// Define the props for StatCard
type StatCardProps = {
  icon: React.ElementType; 
  value: string | number; 
  label: string;
};

// Now use that type instead of 'any'
function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="p-3 bg-cyan-100 rounded-full text-cyan-600">
        <Icon size={24} />
      </div>
      <p className="text-lg font-bold mt-2">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

// This matches the Doctor type from our API
type Doctor = {
  id: number;
  name: string;
  specialty: string;
  status: string;
  bio: string;
  time: string;
  imageUrl: string;
  // Add new fields from the screenshot
  qualifications: string;
  fellowship: string;
  patients: string;
  experience: string;
  rating: number;
  reviews: string;
};

export default function DoctorDetailsPage() {
  const params = useParams();
  const id = params?.id as string; // Get the ID from the URL

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchDoctor = async () => {
        try {
          // Fetch from the API with the query param
          const response = await fetch(`/api/doctors?id=${id}`); 
          if (!response.ok) throw new Error('Doctor not found');

          const data = await response.json();

          // We'll add some dummy data here
          const fullDoctorData = {
            ...data.doctor,
            qualifications: "MBBS, MS (Surgeon)",
            fellowship: "Fellow of Sanskara netralaya, chennai",
            patients: "5,000+",
            experience: "10+ years exper..",
            rating: 4.8,
            reviews: "4,942 reviews",
          };
          setDoctor(fullDoctorData);

        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDoctor();
    }
  }, [id]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading details...</div>;
  }

  if (!doctor) {
    return <div className="p-4 text-center">Doctor not found.</div>;
  }

  // --- UI for the Details Page ---
  return (
    // Add padding-bottom to make room for the nav bar
    <main className="min-h-screen bg-gray-50 pb-32">
      {/* 1. Teal Header */}
      <header className="bg-cyan-500 text-white p-4 rounded-b-3xl">
        <div className="flex items-center">
          <Link href="/user/dashboard" className="p-2">
            <ArrowLeft size={24} />
          </Link>
          
        </div>
      </header>

      {/* 2. Doctor Info Card (with negative margin) */}
      <div className="bg-white rounded-xl shadow-lg p-4 mx-4 -mt-10 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            {/* Use the new doctor name from the screenshot */}
            <h2 className="font-bold text-2xl">Dr.Kumar Das</h2>
            <p className="text-sm font-medium text-gray-600 mt-1">
              Ophthalmologist
            </p>
            <p className="text-sm font-bold text-gray-800 mt-1">
              {doctor.qualifications}
            </p>
            <p className="text-xs text-gray-500 mt-1">{doctor.fellowship}</p>
          </div>
          <Image
            src={doctor.imageUrl}
            alt={doctor.name}
            width={80}
            height={80}
            className="rounded-lg w-20 h-20 object-cover border-4 border-white"
          />
        </div>
      </div>

      {/* 3. Stats Section */}
      <div className="grid grid-cols-4 gap-4 p-4 mx-4 my-4 bg-white rounded-xl shadow-sm">
        <StatCard icon={Users} value={doctor.patients} label="patients" />
        <StatCard icon={Award} value={doctor.experience} label="years exper.." />
        <StatCard icon={Star} value={doctor.rating} label="rating" />
        <StatCard icon={MessageSquare} value={doctor.reviews} label="reviews" />
      </div>

      {/* 4. About & Specialization */}
      <div className="p-4 mx-4 my-4 bg-white rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-2">About Doctor</h3>
        <p className="text-sm text-gray-600 mb-4">
          15+ years of experience in all aspects of cardiology, including non-invasive and interventional procedures.
        </p>

        <h3 className="font-bold text-lg mb-2">Service & Specialization</h3>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">Service</span>
          <span className="text-gray-800 font-medium">Medicare</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Specialization</span>
          <span className="text-gray-800 font-medium">Cardiology</span>
        </div>
      </div>
      
      {/* 5. Availability */}
      <div className="p-4 mx-4 my-4 bg-white rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-2">Availability For Consulting</h3>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Monday to Friday</span>
          <span className="text-gray-800 font-medium">10 PM To 5 PM</span>
        </div>
      </div>

      {/* 6. Booking Button (Fixed at bottom) */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-4 z-20"> {/* Adjusted bottom and added padding */}
        <button className="w-full bg-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-cyan-600 transition-colors">
          Book appointment
        </button>
      </div>
    </main>
  );
}