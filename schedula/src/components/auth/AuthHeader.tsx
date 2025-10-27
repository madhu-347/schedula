"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthHeader() {
  const router = useRouter();
  const pathname = usePathname();

  // helper function to handle navigation
  const navItem = (label: string, path: string) => {
    const isActive = pathname === path;

    return (
      <button
        onClick={() => router.push(path)}
        className={`pb-1 transition-all duration-300 ease-in-out ${
          isActive
            ? "text-[#46C2DE] border-b-2 border-[#46C2DE]"
            : "text-gray-700 hover:text-[#46C2DE]"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
        {/* Wellora Logo */}
        <h1
          onClick={() => router.push("/")}
          className="text-2xl font-bold bg-gradient-to-r from-[#46C2DE] to-[#000000] bg-clip-text text-transparent cursor-pointer"
        >
          Wellora
        </h1>

        {/* Navigation */}
        <div className="flex items-center gap-6 text-sm font-medium">
          {navItem("Login", "/user/login")}
          {navItem("Register", "/user/register")}
        </div>
      </div>
    </header>
  );
}
