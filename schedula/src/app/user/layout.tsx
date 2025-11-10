"use client";

import { PropsWithChildren } from "react";
import { useRouter, usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";

export default function UserLayout({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const pathname = usePathname() || "";

  // ✅ Hide layout for auth pages
  const hideLayoutFor = ["/user/login", "/user/register", "/user/otp"];

  const isAuthPage = hideLayoutFor.includes(pathname);

  // ✅ No header/nav for auth pages
  if (isAuthPage) return <>{children}</>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="sticky top-0 z-20">
          <Header user={user} />
        </div>

        <main className="flex-1">{children}</main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
