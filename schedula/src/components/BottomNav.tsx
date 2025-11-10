"use client";

import { Search, Calendar, FileText, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname(); // ✅ Get current page URL

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-2 flex justify-around">
      {/* Find a Doctor */}
      <Link href={"/user/dashboard"}>
        <button
          className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 transition-all duration-200 hover:scale-110 active:scale-95 
          ${
            pathname === "/user/dashboard" ? "text-cyan-500" : "text-gray-600"
          }`}
        >
          <Search className="w-6 h-6" />
          <span className="text-xs">Find a Doctor</span>
        </button>
      </Link>

      {/* Appointments */}
      <Link href={"/user/appointment"}>
        <button
          className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 transition-all duration-200 hover:scale-110 active:scale-95 
          ${
            pathname === "/user/appointment" ? "text-cyan-500" : "text-gray-600"
          }`}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-xs">Appointments</span>
        </button>
      </Link>

      {/* Records */}
      <Link href={"/user/records"}>
        <button
          className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 transition-all duration-200 hover:scale-110 active:scale-95 
          ${pathname === "/user/records" ? "text-cyan-500" : "text-gray-600"}`}
        >
          <FileText className="w-6 h-6" />
          <span className="text-xs">Records</span>
        </button>
      </Link>

      {/* Profile */}
      <Link href={"/user/profile"}>
        <button
          className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 transition-all duration-200 hover:scale-110 active:scale-95 
          ${pathname === "/user/profile" ? "text-cyan-500" : "text-gray-600"}`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Profile</span>
        </button>
      </Link>
    </div>
  );
}
