"use client";

import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";

export default function DoctorLayout({ children }: PropsWithChildren) {
  // ✅ TS-safe
  const pathname = usePathname() ?? "";

  // ✅ Pages that should NOT use doctor layout
  const hideLayoutFor = [
    "/doctor/login",
    "/doctor/register",
    "/doctor/otp",
  ];

  const isAuthPage = hideLayoutFor.includes(pathname);

  // ✅ For doctor login/register/otp → return page directly
  if (isAuthPage) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
