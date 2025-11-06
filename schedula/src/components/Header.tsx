import React, { useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/notifications/NotificationBell";
import User from "lucide-react";

interface HeaderProps {
  setShowNotifications?: (show: boolean) => void;
}

function Header({ setShowNotifications }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotificationsLocal] = useState(false);
  // console.log("user in header: ", user);
  const firstName = user?.firstName || "User"; // Changed from user?.name to user?.firstName

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
      <div className="px-4 py-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Image
                src="/user-profile-pic.png"
                alt="User Profile"
                width={48}
                height={48}
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 object-cover ring-2 ring-cyan-100"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">
                Hello, {firstName ? firstName : "User"}
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="inline w-3 h-3" />
                <span className="hidden sm:inline">
                  {user?.location || "Dombivali, Mumbai"}
                </span>
                <span className="sm:hidden">
                  {user?.location?.split(",")[0] || "Dombivali"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell role="patient" />

            <button
              onClick={() => logout("user")}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
