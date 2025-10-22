"use client"; // <-- NEW: Makes this an interactive Client Component

import Image from 'next/image';
import { Bell, Search } from 'lucide-react';
import DoctorCard from '@/components/DoctorCard';
import mockData from '@/lib/mockData.json';
import { useState } from 'react'; // <-- NEW: Import useState hook

export default function DashboardPage() {
  // --- NEW CODE BLOCK: For managing search state ---
  const [searchTerm, setSearchTerm] = useState('');
  const { doctors: allDoctors } = mockData; // Renamed to 'allDoctors'

  // Filter the doctors based on the search term
  const filteredDoctors = allDoctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // --- END NEW CODE BLOCK ---

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
              <p className="text-xs text-gray-500">@Somavai (Mumbai)</p>
            </div>
          </div>
          <button className="relative">
            <Bell className="text-gray-600" size={24} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </header>

        {/* Search Bar - NOW FUNCTIONAL */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search Doctors"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm} // <-- NEW: Binds the input's value to our state
            onChange={(e) => setSearchTerm(e.target.value)} // <-- NEW: Updates our state every time you type
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Doctor List - NOW DYNAMIC */}
        <div>
          {/* NEW: We now map over 'filteredDoctors' instead of 'doctors' */}
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </main>
  );
}