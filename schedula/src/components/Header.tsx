import React from "react";
import Image from "next/image";
import { MapPin, Bell } from "lucide-react";

type User = {
  id?: number;
  email?: string;
  mobile?: string;
  name?: string;
  location?: string;
};

interface HeaderProps {
  user: User | null;
  setShowNotifications: (show: boolean) => void;
  handleLogout: () => void;
}

function Header({ user, setShowNotifications, handleLogout }: HeaderProps) {
  const [localUser, setLocalUser] = React.useState<User | null>(user);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setLocalUser(JSON.parse(storedUser));
    }
  }, []);
  const firstName = localUser?.name || "User";

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
                  {localUser?.location || "Dombivali, Mumbai"}
                </span>
                <span className="sm:hidden">
                  {localUser?.location?.split(",")[0] || "Dombivali"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            <button
              onClick={handleLogout}
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
