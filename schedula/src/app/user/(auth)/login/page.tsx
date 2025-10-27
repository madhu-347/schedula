"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import mockData from "@/lib/mockData.json";
import AuthBanner from "@/components/auth/AuthBanner";
import AuthHeader from "@/components/auth/AuthHeader";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const generateOtp = (length = 4) => {
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = mockData.users.find(
        (u) => u.email === formData.email || u.phone === formData.email
      );

      if (user) {
        localStorage.setItem("pendingUser", JSON.stringify(user));

        const generatedOtp = generateOtp(4);
        localStorage.setItem("generatedOtp", generatedOtp);
        localStorage.setItem(
          "otpExpiry",
          (Date.now() + 2 * 60 * 1000).toString()
        );

        router.push("/user/otp");
      } else {
        alert("❌ Invalid email or mobile. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterRedirect = () => router.push("/user/register");
  const handleForgotPassword = () => console.log("Forgot password clicked");

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      {/* HEADER */}
      <AuthHeader />

      {/* MAIN CONTENT */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* LEFT SIDE */}
        <AuthBanner />

        {/* RIGHT SIDE FORM */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">
          <div className="flex justify-center space-x-10 mb-10 w-full max-w-md">
           
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email / Mobile
              </label>
              <InputFieldComponent
                type="text"
                placeholder="Enter your email or mobile"
                value={formData.email}
                required
                onChange={handleInputChange("email")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <InputFieldComponent
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                required
                onChange={handleInputChange("password")}
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400"
                />
                <label htmlFor="remember" className="text-xs text-gray-600">
                  Remember Me
                </label>
              </div>
              <button
                type="button"
                className="text-xs text-pink-500 hover:underline"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
