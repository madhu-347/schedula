"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import mockData from "@/lib/mockData.json";

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

    // OTP Generator
    const generateOtp = (length = 4) => {
      let otp = "";
      for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10); // digits 0–9
      }
      return otp;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("🔐 Checking mock user credentials...");

    try {
      const user = mockData.users.find(
        (u) => u.email === formData.email || u.phone === formData.email
      );

      if (user) {
        console.log("✅ User found:", user);

        // Store pending user (temporary until OTP verified)
        localStorage.setItem("pendingUser", JSON.stringify(user));

        // Generate OTP
        const generatedOtp = generateOtp(4);
        localStorage.setItem("generatedOtp", generatedOtp);
        localStorage.setItem("otpExpiry", (Date.now() + 2 * 60 * 1000).toString()); // expires in 2 mins

        console.log("📩 Generated OTP:", generatedOtp);

        // Redirect to OTP verification
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

  const handleGoogleLogin = () => console.log("Google login clicked");
  const handleRegisterRedirect = () => router.push("/user/register");
  const handleForgotPassword = () => console.log("Forgot password clicked");

  return (
        <div className="py-16">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Mobile */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email / Mobile
              </label>
              <InputFieldComponent
                type="text"
                placeholder="Enter your email or mobile"
                value={formData.email}
                required={true}
                onChange={handleInputChange("email")}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <InputFieldComponent
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                required={true}
                onChange={handleInputChange("password")}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Remember Me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-pink-500 hover:underline"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button - Using shadcn Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>

  );
}
