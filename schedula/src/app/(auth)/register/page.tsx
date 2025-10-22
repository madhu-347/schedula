"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function RegisterPage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-black">
      <div className="bg-white rounded-3xl shadow-sm w-full max-w-md p-8">
        {/* Logo */}
        <div className="bg-gray-100 rounded-3xl flex items-center justify-center h-36 mb-8">
          <span className="text-xl font-semibold">
            <Image
              src="/logo.png"
              alt="Your Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">Sign Up</h1>

        {/* Form */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              placeholder="Enter your mobile number"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
            />
          </div>

          {/* Agree to Terms */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{" "}
              <a href="#" className="text-pink-500 hover:underline">
                Terms & Conditions
              </a>
            </label>
          </div>

          {/* Sign Up Button */}
          <button className="w-full bg-cyan-400 hover:bg-cyan-500 text-white font-medium py-3 rounded-xl transition-colors mt-4">
            Sign Up
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or sign up With
              </span>
            </div>
          </div>

          {/* Google Sign Up */}
          <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Already have an account?{" "}
          <a href="#" className="text-cyan-400 font-medium hover:underline">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
