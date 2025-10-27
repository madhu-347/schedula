"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const userExpiry =
      typeof window !== "undefined" ? localStorage.getItem("userExpiry") : null;

    if (!user) {
      router.replace("/user/login");
      return;
    }

    // Check if session has expired
    if (userExpiry && Date.now() > parseInt(userExpiry)) {
      localStorage.removeItem("user");
      localStorage.removeItem("userExpiry");
      router.replace("/user/login");
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
