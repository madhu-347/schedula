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
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth context to finish loading
    if (!loading) {
      const userId = localStorage.getItem("userId");
      const userExpiry = localStorage.getItem("userExpiry");

      if (!userId || (userExpiry && Date.now() > +userExpiry)) {
        localStorage.removeItem("userId");
        localStorage.removeItem("userExpiry");
        router.replace("/user/login");
      } else {
        setIsChecking(false);
      }
    }
  }, [loading, router]);

  // Show loading state while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
