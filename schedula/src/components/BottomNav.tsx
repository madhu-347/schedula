"use client";

import { Search, LayoutGrid, FileText, User } from 'lucide-react'; // Make sure all icons used are imported
import Link from 'next/link';

export default function BottomNav() {
  return (
    // Centered using left-1/2 translate-x, explicit height h-16, fixed width max-w-md
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full h-16 bg-white border-t border-gray-200 flex justify-around items-center z-40">
      <Link href="/user/dashboard" className="flex flex-col items-center text-cyan-600 px-2 pt-1 pb-1"> {/* Example active style */}
        <Search size={24} />
        <span className="text-xs mt-0.5">Find Doctor</span>
      </Link>
      <Link href="#" className="flex flex-col items-center text-gray-500 px-2 pt-1 pb-1">
         <LayoutGrid size={24} />
        <span className="text-xs mt-0.5">Appointments</span>
      </Link>
      <Link href="#" className="flex flex-col items-center text-gray-500 px-2 pt-1 pb-1">
         <FileText size={24} />
        <span className="text-xs mt-0.5">Records</span>
      </Link>
      <Link href="#" className="flex flex-col items-center text-gray-500 px-2 pt-1 pb-1">
         <User size={24} />
        <span className="text-xs mt-0.5">Profile</span>
      </Link>
    </nav>
  );
}