"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

type User = {
  id?: number;
  name?: string;
  email?: string;
  mobile?: string;
  location?: string;
};

export default function UserLayout({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || "";

  // ✅ Hide layout for auth pages
  const hideLayoutFor = ["/user/login", "/user/register", "/user/otp"];
  const isAuthPage = hideLayoutFor.includes(pathname);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("userExpiry");
    }
    router.push("/user/login");
  };

  // ✅ No header/nav for auth pages
  if (isAuthPage) return <>{children}</>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Header
          user={user}
          setShowNotifications={setShowNotifications}
          handleLogout={handleLogout}
        />

        <main className="flex-1">{children}</main>

        <BottomNav />

        {showNotifications && (
          <div className="fixed top-20 right-4 z-50 w-80 bg-white border rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Notifications</h4>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-sm text-gray-500"
              >
                Close
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              No new notifications
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
