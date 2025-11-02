"use client";

import { PropsWithChildren } from "react";
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
  const router = useRouter();
  const pathname = usePathname() || "";

  // ✅ Hide layout for auth pages
  const hideLayoutFor = ["/user/login", "/user/register", "/user/otp"];
  const isAuthPage = hideLayoutFor.includes(pathname);

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
        <Header />

        <main className="flex-1">{children}</main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
