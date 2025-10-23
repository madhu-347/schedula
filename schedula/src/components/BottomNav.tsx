'use client'; // This needs to be a client component for potential future logic

import { Search, LayoutGrid, FileText, User } from 'lucide-react';
import Link from 'next/link';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3">
      <Link href="/dashboard" className="flex flex-col items-center text-blue-500">
        <Search size={24} />
        <span className="text-xs font-medium">Find a Doctor</span>
      </Link>
      <Link href="#" className="flex flex-col items-center text-gray-500">
        <LayoutGrid size={24} />
        <span className="text-xs">Appointments</span>
      </Link>
      <Link href="#" className="flex flex-col items-center text-gray-500">
        <FileText size={24} />
        <span className="text-xs">Records</span>
      </Link>
      <Link href="#" className="flex flex-col items-center text-gray-500">
        <User size={24} />
        <span className="text-xs">Profile</span>
      </Link>
    </nav>
  );
}