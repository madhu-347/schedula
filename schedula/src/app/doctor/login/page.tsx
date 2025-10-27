// src/app/doctor/login/page.tsx
"use client";

import React, { useState, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import mockData from "@/lib/mockData.json";
import AuthBanner from "@/components/auth/AuthBanner";
import AuthHeader from "@/components/auth/AuthHeader";

// Define Doctor type
type Doctor = {
  id: number; email: string; password?: string; name: string; specialty?: string;
};

// Define Login Mode type
type LoginMode = 'user' | 'doctor';

export default function DoctorLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // --- NEW: Add state, initialize to 'doctor' ---
  const [loginMode, setLoginMode] = useState<LoginMode>('doctor');
  // --- END NEW ---

  // --- NEW: Effect to redirect if mode changes to user ---
  useEffect(() => {
    if (loginMode === 'user') {
      router.push('/user/login');
      // Optional: Reset mode back if needed
      // setLoginMode('doctor');
    }
  }, [loginMode, router]);
  // --- END NEW ---

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const generateOtp = (length = 4) => { /* ... OTP generation logic ... */ return Math.floor(1000 + Math.random() * 9000).toString(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     // Ensure this only runs for doctor login
    if (loginMode !== 'doctor') return;

    setIsLoading(true);
    console.log("🔐 Checking mock DOCTOR credentials...");
    try {
      const foundAccount: Doctor | undefined = mockData.doctors.find(
        (d) => d.email === formData.email && d.password === formData.password
      );

      if (foundAccount) {
        console.log(`✅ DOCTOR found:`, foundAccount);
        const accountInfo = { id: foundAccount.id, name: foundAccount.name, email: foundAccount.email, type: loginMode };
        localStorage.setItem("pendingUser", JSON.stringify(accountInfo));

        // OTP Logic (Simulated)
        const generatedOtp = generateOtp(4);
        localStorage.setItem("generatedOtp", generatedOtp);
        localStorage.setItem("otpExpiry", (Date.now() + 2 * 60 * 1000).toString());
        console.log(`🔑 Generated OTP: ${generatedOtp}`);
        router.push("/doctor/otp"); // Redirect to common OTP page

      } else {
        alert(`❌ Invalid credentials for ${loginMode}. Please try again.`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => console.log("Forgot password clicked");

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      {/* HEADER - Pass userType="doctor" */}
      <AuthHeader activeLink="login" userType="doctor" />

      {/* MAIN CONTENT */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* LEFT SIDE BANNER */}
        <AuthBanner />

        {/* RIGHT SIDE FORM */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">

          {/* --- NEW: User/Doctor Toggle Buttons --- */}
          <div className="flex justify-center space-x-2 border border-gray-200 rounded-lg p-1 mb-8 w-full max-w-sm">
             <button
                onClick={() => setLoginMode('user')} // Will trigger redirect via useEffect
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMode === 'user' ? 'bg-cyan-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
             >
                User
             </button>
             <button
                onClick={() => setLoginMode('doctor')}
                 className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMode === 'doctor' ? 'bg-cyan-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
             >
                Doctor
             </button>
          </div>
          {/* --- END NEW: Toggle Buttons --- */}

           {/* Only show the doctor form if mode is 'doctor' */}
           {loginMode === 'doctor' && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Login</h2>
              <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
                {/* Email Input */}
                <div> <label className="block text-sm font-medium mb-2">Email</label> <InputFieldComponent type='email' placeholder='Enter your doctor email' value={formData.email} required onChange={handleInputChange("email")} /> </div>
                {/* Password Input */}
                <div> <label className="block text-sm font-medium mb-2">Password</label> <InputFieldComponent type="password" placeholder="Enter your password" value={formData.password} required onChange={handleInputChange("password")} /> </div>
                {/* Remember Me & Forgot Password */}
                <div className="flex justify-between items-center pt-2"> <div className="flex items-center gap-2"> <input type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 accent-cyan-400"/> <label htmlFor="remember" className="text-xs text-gray-600"> Remember Me </label> </div> <button type="button" className="text-xs text-pink-500 hover:underline" onClick={handleForgotPassword}> Forgot Password? </button> </div>
                {/* Sign In Button */}
                <Button type="submit" disabled={isLoading} className="w-full py-3 mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors duration-200"> {isLoading ? "Signing In..." : "Sign In"} </Button>
              </form>

              {/* Link to Doctor Register page */}
              <p className="text-center text-sm text-gray-600 mt-6">
                  Don&apos;t have a doctor account?{' '}
                  <button onClick={() => router.push('/doctor/register')} className="font-medium text-cyan-600 hover:underline">
                      Register Here
                  </button>
              </p>
            </>
           )}
           {/* Placeholder if mode is user before redirect */}
           {loginMode === 'user' && (
               <p className="text-gray-500">Redirecting to user login...</p>
           )}
        </div>
      </div>
    </div>
  );
}