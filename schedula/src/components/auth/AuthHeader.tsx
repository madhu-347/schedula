"use client"; // Needs to be a client component for hooks

import Link from 'next/link';
import { useRouter, usePathname } from "next/navigation"; // Keep useRouter if you prefer button onClick, or remove if using Link styles
import React from "react"; // Import React if not already present

type AuthHeaderProps = {
  activeLink?: 'login' | 'register';
  userType?: 'user' | 'doctor';
};

export default function AuthHeader({ activeLink, userType = 'user' }: AuthHeaderProps) {
  const router = useRouter(); // Keep if using buttons
  const pathname = usePathname();

  // Determine base path based on userType
  const basePath = userType === 'doctor' ? '/doctor' : '/user';

  // Helper function for styling (can be used with Link or Button)
  const getLinkClassName = (linkPath: string) => {
    const isActive = pathname === linkPath;
    return `pb-1 transition-all duration-300 ease-in-out text-sm font-medium ${
      isActive
        ? "text-[#46C2DE] border-b-2 border-[#46C2DE]" // Active style
        : "text-gray-700 hover:text-[#46C2DE]" // Inactive style
    }`;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
        {/* Wellora Logo - Link to landing page */}
        <Link href="/">
          <h1 className="text-2xl font-bold bg-linear-to-r from-[#46C2DE] to-[#000000] bg-clip-text text-transparent cursor-pointer">
            Wellora
          </h1>
        </Link>

        {/* Navigation using Link components */}
        <div className="flex items-center gap-6 mr-15">
          <Link href={`${basePath}/login`} passHref>
             <span className={getLinkClassName(`${basePath}/login`)}>
                Login
             </span>
          </Link>
          <Link href={`${basePath}/register`} passHref>
             <span className={getLinkClassName(`${basePath}/register`)}>
                Register
             </span>
          </Link>
        </div>
      </div>
    </header>
  );
}