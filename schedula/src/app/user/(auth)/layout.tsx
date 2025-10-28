"use client";

import { PropsWithChildren } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("user");
    const userExpiry = localStorage.getItem("userExpiry");

    if (user && userExpiry && new Date().getTime() < parseInt(userExpiry)) {
      // User is logged in, redirect to dashboard if trying to access auth pages
      router.replace("/user/dashboard");
    }
  }, [router, pathname]);

  return <div className="min-h-screen flex flex-col bg-white">{children}</div>;
}
