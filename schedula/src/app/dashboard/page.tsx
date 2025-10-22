"use client"; 

import Image from 'next/image';
import { Bell, Search } from 'lucide-react';
import DoctorCard from '@/components/DoctorCard';
import mockData from '@/lib/mockData.json';
import { useState } from 'react'; 

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { doctors: allDoctors } = mockData; 

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
              {/* <-- Updated location text to match design */}
              <p className="text-xs text-gray-500">@ Dombivali, Mumbai</p>
            </div>
          </div>
          <button className="relative">
            <Bell className="text-gray-600" size={28} />
             {/* <-- Adjusted notification dot to be on the bell */}
            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* Search Bar - Updated to gray and pill-shaped */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search Doctors"
            // <-- Updated styles for search bar
            className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          {/* <-- Adjusted icon position */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Doctor List */}
        <div>
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </main>
  );
}