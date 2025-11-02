"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, doctor, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth context to finish loading
    if (!loading) {
      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");
      const userExpiry = localStorage.getItem("userExpiry");

      if (!userId || (userExpiry && Date.now() > +userExpiry)) {
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userExpiry");
        router.replace("/user/login");
      } else {
        // Check if the user/doctor data is properly loaded
        if (
          (userRole === "doctor" && doctor) ||
          (userRole !== "doctor" && user)
        ) {
          setIsChecking(false);
        } else {
          // If data should be loaded but isn't, redirect to login
          localStorage.removeItem("userId");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userExpiry");
          router.replace("/user/login");
        }
      }
    }
  }, [loading, user, doctor, router]);

  // Show loading state while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
