import React, { useRef, useState, useEffect } from "react";
import { Doctor } from "@/lib/types/doctor";
import DoctorNotificationBell from "./notifications/DoctorNotificationBell";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface DoctorHeaderProps {
  doctor: Doctor | null;
}

function DoctorHeader({ doctor }: DoctorHeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("doctorId");
    router.push("/doctor/login");
  };

  const handleLogoClick = () => {
    router.push("/doctor/dashboard");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                onClick={handleLogoClick}
                className="text-xl cursor-pointer font-semibold text-cyan-500 hover:text-cyan-600 transition-colors"
              >
                Schedula
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <DoctorNotificationBell />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold">
                    {doctor?.firstName?.charAt(0) || "D"}
                  </div>
                  <span className="hidden md:inline">
                    {doctor
                      ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                      : "Doctor"}
                  </span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default DoctorHeader;
