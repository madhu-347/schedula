"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../Header";
import BottomNav from "../BottomNav";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userExpiry = localStorage.getItem("userExpiry");

    if (!user || (userExpiry && Date.now() > +userExpiry)) {
      localStorage.removeItem("user");
      localStorage.removeItem("userExpiry");
      router.replace("/user/login");
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

  return (
    <>
      {children}
    </>
  );
}
