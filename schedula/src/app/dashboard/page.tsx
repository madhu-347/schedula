"use client"; 

import Image from 'next/image';
import { Bell, Search } from 'lucide-react';
import DoctorCard from '@/components/DoctorCard';
import { useState, useEffect } from 'react';

// Type for data coming from /api/doctors
type ApiDoctor = {
  id: number;
  name: string;
  specialty: string;
  status: string;
  bio: string;
  time: string;
  imageUrl: string;
};

// Type for our page's state, which adds the 'is_favorited' flag
type Doctor = ApiDoctor & {
  is_favorited: boolean;
};

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors');
        const data = await response.json();
        
        // This adds the 'is_favorited' property
        const doctorsWithFavorite: Doctor[] = data.doctors.map((doc: ApiDoctor) => ({
          ...doc,
          is_favorited: false, 
        }));
        
        setAllDoctors(doctorsWithFavorite);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // --- NEW FUNCTION TO HANDLE LIKES ---
  const handleToggleLike = (id: number) => {
    setAllDoctors(prevDoctors => 
      prevDoctors.map(doctor => 
        doctor.id === id 
          ? { ...doctor, is_favorited: !doctor.is_favorited } 
          : doctor
      )
    );
  };
  // --- END NEW FUNCTION ---

  const filteredDoctors = allDoctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="p-4">
        {/* Header */}
        <header className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Image
              src="/user-profile-pic.png" 
              alt="Priya"
              width={40}
              height={40}
              className="rounded-full w-10 h-10 object-cover"
            />
            <div className="ml-3">
              <h1 className="text-lg font-semibold">Hello, Priya</h1>
              <p className="text-xs text--gray-500">@ Dombivali, Mumbai</p>
            </div>
          </div>
          <button className="relative">
            <Bell className="text-gray-600" size={28} />
            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search Doctors"
            className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Doctor List */}
        <div>
          {isLoading ? (
            <p className="text-center text-gray-500">Loading doctors...</p>
          ) : (
            filteredDoctors.map((doctor) => (
              // This passes both required props, fixing the error
              <DoctorCard 
                key={doctor.id} 
                doctor={doctor} 
                onToggleLike={handleToggleLike} 
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}