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
  const handleBeforeUnload = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userExpiry");
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, []);
  useEffect(() => {
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!user) {
      // redirect to login if no user found
      router.replace("/user/(auth)/login");
    } else {
      setIsLoading(false);
    }
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
