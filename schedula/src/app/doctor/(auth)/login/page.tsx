"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import mockData from "@/lib/mockData.json";
import AuthBanner from "@/components/auth/AuthBanner";
import AuthHeader from "@/components/auth/AuthHeader";
import { useAuth } from "@/context/AuthContext";
import { Doctor } from "@/lib/types/doctor";
import toast from "react-hot-toast";

type LoginMode = "user" | "doctor";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>("doctor");

  // ✅ Switch pages cleanly (NO redirect loop)
  useEffect(() => {
    if (loginMode === "user") router.push("/user/login");
    if (loginMode === "doctor") router.push("/doctor/login");
  }, [loginMode, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600 text-lg font-medium animate-pulse">
          Loading user data...
        </p>
      </div>
    );
  }

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const generateOtp = (length = 4) => {
    let otp = "";
    for (let i = 0; i < length; i++) otp += Math.floor(Math.random() * 10);
    return otp;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMode !== "doctor") return;

    setIsLoading(true);

    try {
      const foundAccount: Doctor | undefined = mockData.doctors.find(
        (d: Doctor) =>
          d.email === formData.email && d.password === formData.password
      );

      if (!foundAccount) {
        toast.error("Invalid credentials. Please try again.");
        setIsLoading(false);
        return;
      }

      // ✅ Log doctor into AuthContext
      await login(foundAccount.id, "doctor");

      const accountInfo = {
        id: foundAccount.id,
        firstName: foundAccount.firstName,
        lastName: foundAccount.lastName,
        email: foundAccount.email,
        type: "doctor",
      };

      localStorage.setItem("pendingUser", JSON.stringify(accountInfo));

      const generatedOtp = generateOtp(4);
      localStorage.setItem("generatedOtp", generatedOtp);
      localStorage.setItem(
        "otpExpiry",
        (Date.now() + 2 * 60 * 1000).toString()
      );

      toast.success(`OTP sent! (Check console: ${generatedOtp})`);
      router.push("/doctor/otp");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.error("Password reset feature coming soon!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      <AuthHeader activeLink="login" userType="doctor" />

      <div className="flex flex-col md:flex-row flex-1">
        <AuthBanner />

        <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">
          {/* Toggle Buttons */}
          <div className="flex justify-center space-x-2 border border-gray-200 rounded-lg p-1 mb-8 w-full max-w-sm">
            <button
              onClick={() => setLoginMode("user")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMode === "user"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              User
            </button>
            <button
              onClick={() => setLoginMode("doctor")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMode === "doctor"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Doctor
            </button>
          </div>

          {/* Doctor Login Form */}
          {loginMode === "doctor" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
                Login
              </h2>

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
                  <label className="block text-sm font-medium mb-2">
                    Password
                  </label>
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
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 accent-cyan-400"
                    />
                    <span className="text-xs text-gray-600">Remember Me</span>
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
                  className="w-full py-3 mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors duration-200"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => router.push("/doctor/register")}
                  className="font-medium text-cyan-600 hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
