"use client";

import { useState, useEffect } from "react";
import LoginForm from "./login/page";
import AuthBanner from "@/components/auth/AuthBanner";
import RegisterForm from "./register/page";

export default function AuthLayout() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [currentImage, setCurrentImage] = useState(0);

  const bannerImages = [
    "/banners/login-page.png",
    "/banners/login-pic.png",
    "/banners/logo.png",
  ];

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % bannerImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
     <AuthBanner />
        {/* RIGHT SIDE FORM SECTION */}
      <div className="flex-1 flex md:w-1/3 flex-col justify-center items-center px-8 py-12">
        {/* Tabs (Login | Register) */}
        <div className="flex justify-center space-x-10 mb-10 border-b border-gray-200 w-full max-w-md">
          <button
            onClick={() => setActiveTab("login")}
            className={`pb-2 font-medium ${
              activeTab === "login"
                ? "text-cyan-500 border-b-2 border-cyan-500"
                : "text-gray-600 hover:text-cyan-400"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`pb-2 font-medium ${
              activeTab === "register"
                ? "text-cyan-500 border-b-2 border-cyan-500"
                : "text-gray-600 hover:text-cyan-400"
            }`}
          >
            Register
          </button>
        </div>

        {/* Forms */}
        <div className="w-full max-w-md bg-white p-8">
          {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}
