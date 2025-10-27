"use client";

import React, { useState, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import mockData from "@/lib/mockData.json";
import AuthBanner from "@/components/auth/AuthBanner";
import AuthHeader from "@/components/auth/AuthHeader";

// Define the login type state
type LoginMode = 'user' | 'doctor';

// --- Type Definitions ---
type User = {
  id?: number;
  email: string;
  phone?: string; // Use phone based on your mock data structure
  name: string;
  location?: string;
};

type Doctor = {
  id: number;
  email: string;
  password?: string;
  name: string;
  specialty?: string;
};
// --- End Type Definitions ---

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('user');

  // --- Effect to redirect if mode changes to doctor ---
  useEffect(() => {
    if (loginMode === 'doctor') {
      router.push('/doctor/login'); // Navigate to the doctor login page
      // Optional: Reset mode if user navigates back to prevent infinite loop
      // setLoginMode('user');
    }
  }, [loginMode, router]);
  // --- END Effect ---

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // --- OTP Generation ---
  const generateOtp = (length = 4) => {
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  };

  // --- Handle USER Submit Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This page only handles USER login now
    if (loginMode !== 'user') return;

    setIsLoading(true);
    console.log("🔐 Checking mock USER credentials...");

    try {
      // Use User type here
      const foundAccount: User | undefined = mockData.users.find(
        (u) => u.email === formData.email || u.phone === formData.email
      );

      if (foundAccount) {
        console.log(`✅ USER found:`, foundAccount);

        // Store minimal info needed for OTP
        const accountInfo = {
            // id might be missing on User, handle appropriately
            id: foundAccount.id ?? Date.now(), // Example fallback ID
            name: foundAccount.name,
            email: foundAccount.email,
            type: loginMode // Store 'user'
        };

        localStorage.setItem("pendingUser", JSON.stringify(accountInfo));

        // --- OTP Logic (Simulated) ---
        const generatedOtp = generateOtp(4);
        localStorage.setItem("generatedOtp", generatedOtp);
        localStorage.setItem("otpExpiry", (Date.now() + 2 * 60 * 1000).toString());
        console.log(`🔑 Generated OTP: ${generatedOtp}`);
        router.push("/user/otp");
        // --- End OTP Logic ---

      } else {
        alert(`❌ Invalid credentials for user. Please try again.`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // --- END Handle Submit Logic ---


  const handleForgotPassword = () => console.log("Forgot password clicked");

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      {/* HEADER - Pass userType="user" */}
      <AuthHeader activeLink="login" userType="user" />

      {/* MAIN CONTENT */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* LEFT SIDE BANNER */}
        <AuthBanner />

        {/* RIGHT SIDE FORM */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">

          {/* User/Doctor Toggle Buttons */}
          <div className="flex justify-center space-x-2 border border-gray-200 rounded-lg p-1 mb-8 w-full max-w-sm">
             <button
                onClick={() => setLoginMode('user')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMode === 'user' ? 'bg-cyan-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
             >
                User
             </button>
             <button
                onClick={() => setLoginMode('doctor')} // This will now trigger the useEffect redirect
                 className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMode === 'doctor' ? 'bg-cyan-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
             >
                Doctor
             </button>
          </div>

          {/* Only render form/links if still in 'user' mode before redirect happens */}
          {loginMode === 'user' && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Login</h2>
              <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
                {/* Email / Mobile Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email / Mobile
                  </label>
                  <InputFieldComponent
                    type='text'
                    placeholder='Enter your email or mobile'
                    value={formData.email}
                    required
                    onChange={handleInputChange("email")}
                  />
                </div>

                {/* Password Input */}
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

                {/* Remember Me & Forgot Password */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 accent-cyan-400"/>
                    <label htmlFor="remember" className="text-xs text-gray-600"> Remember Me </label>
                  </div>
                  <button type="button" className="text-xs text-pink-500 hover:underline" onClick={handleForgotPassword}> Forgot Password? </button>
                </div>

                {/* Sign In Button */}
                <Button type="submit" disabled={isLoading} className="w-full py-3 mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors duration-200">
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              {/* Sign Up Link for User */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Don&apos;t have an account?{' '}
                <button onClick={() => router.push('/user/register')} className="font-medium text-cyan-600 hover:underline">
                  Sign Up
                </button>
              </p>
            </>
          )}

          {/* Show redirecting message if mode switched */}
           {loginMode === 'doctor' && (
               <p className="text-gray-500">Redirecting to doctor login...</p>
           )}

        </div>
      </div>
    </div>
  );
}