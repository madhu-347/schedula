"use client";

import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import DoctorHeader from "@/components/DoctorHeader";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DoctorLayout({ children }: PropsWithChildren) {
  // ✅ TS-safe
  const pathname = usePathname() ?? "";
  const { doctor } = useAuth();

  // ✅ Pages that should NOT use doctor layout
  const hideLayoutFor = ["/doctor/login", "/doctor/register", "/doctor/otp"];

  const isAuthPage = hideLayoutFor.includes(pathname);

  // ✅ For doctor login/register/otp → return page directly
  if (isAuthPage) return <>{children}</>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10">
          <DoctorHeader doctor={doctor} />
        </div>
        {children}
      </div>
    </ProtectedRoute>
  );
}
