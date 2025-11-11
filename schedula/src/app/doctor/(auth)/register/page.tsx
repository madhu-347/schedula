"use client";

import React, { useState, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import AuthBanner from "@/components/auth/AuthBanner";
import AuthHeader from "@/components/auth/AuthHeader";
// Removed unused createUser import

// Define mode type
type RegisterMode = 'user' | 'doctor';

export default function DoctorRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    specialization: "",
    licenseNumber: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileError, setMobileError] = useState("");
  // --- NEW: Add state, initialize to 'doctor' ---
  const [registerMode, setRegisterMode] = useState<RegisterMode>('doctor');
  // --- END NEW ---

  // --- NEW: Effect to redirect if mode changes to user ---
  useEffect(() => {
    if (registerMode === 'user') {
      router.push('/user/register');
      // Optional: Reset mode back if needed
      // setRegisterMode('doctor');
    }
  }, [registerMode, router]);
  // --- END NEW ---

  // Input handler remains the same
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (field === "mobile") {
          if (!/^\d*$/.test(value)) return;
          setFormData((prev) => ({ ...prev, mobile: value }));
          if (value.length === 0) setMobileError("");
          else if (value.length !== 10) setMobileError("Mobile must be 10 digits");
          else setMobileError("");
      } else {
          setFormData((prev) => ({ ...prev, [field]: value }));
      }
  };

  // --- Doctor Registration Submit Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (registerMode !== "doctor") return;

  setIsLoading(true);

  if (mobileError || formData.mobile.length !== 10) {
    alert("Enter a valid 10-digit mobile number");
    setIsLoading(false);
    return;
  }

  if (!agreedToTerms) {
    alert("You must agree to the terms");
    setIsLoading(false);
    return;
  }

  try {
    console.log("Registering Doctor:", formData);

    // Simulate API call
    await new Promise((res) => setTimeout(res, 1500));

    const newDoctor = {
      name: formData.fullName,
      email: formData.email,
      type: "doctor",
    };

    localStorage.setItem("user", JSON.stringify(newDoctor));

    alert("Doctor Registration Successful!");

    // ✅ Redirect new doctor to availability setup page
    router.push("/doctor/manage-availability");

  } catch (error) {
    console.error(error);
    alert("Registration failed");
  } finally {
    setIsLoading(false);
  }
};
  // --- End Submit Logic ---

  
  const handleLoginRedirect = () => router.push("/doctor/login"); // Link back to doctor login

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      {/* HEADER - Pass userType="doctor" */}
      <AuthHeader activeLink="register" userType="doctor" />

      {/* MAIN CONTENT */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* LEFT SIDE BANNER */}
        <AuthBanner />

        {/* RIGHT SIDE FORM */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">

          {/* --- NEW: User/Doctor Toggle Buttons --- */}
          <div className="flex justify-center space-x-2 border border-gray-200 rounded-lg p-1 mb-8 w-full max-w-sm">
             <button
                onClick={() => setRegisterMode('user')} // Will trigger redirect via useEffect
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    registerMode === 'user' ? 'bg-cyan-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
             >
                User
             </button>
             <button
                onClick={() => setRegisterMode('doctor')}
                 className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    registerMode === 'doctor' ? 'bg-cyan-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
             >
                Doctor
             </button>
          </div>
          {/* --- END NEW: Toggle Buttons --- */}

           {/* Only show the doctor form if mode is 'doctor' */}
           {registerMode === 'doctor' && (
             <>
               <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Create Account</h2>
               <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
                 {/* Full Name */}
                 <div><label className="block text-sm font-medium mb-1">Full Name</label><InputFieldComponent type="text" placeholder="Enter full name" value={formData.fullName} required onChange={handleInputChange("fullName")}/></div>
                 {/* Email */}
                 <div><label className="block text-sm font-medium mb-1">Email</label><InputFieldComponent type="email" placeholder="Enter email address" value={formData.email} required onChange={handleInputChange("email")}/></div>
                 {/* Mobile Number */}
                 <div><label className="block text-sm font-medium mb-1">Mobile Number</label><InputFieldComponent type="tel" placeholder="Enter 10-digit mobile" value={formData.mobile} required onChange={handleInputChange("mobile")} maxLength={10}/>{mobileError && <p className="text-red-500 text-xs mt-1">{mobileError}</p>}</div>
                 {/* Password */}
                 <div><label className="block text-sm font-medium mb-1">Password</label><InputFieldComponent type="password" placeholder="Create a password" value={formData.password} required onChange={handleInputChange("password")}/></div>
                 {/* Specialization */}
                 <div><label className="block text-sm font-medium mb-1">Specialization</label><InputFieldComponent type="text" placeholder="e.g., Cardiologist" value={formData.specialization} required onChange={handleInputChange("specialization")}/></div>
                 {/* License Number (Optional) */}
                 <div><label className="block text-sm font-medium mb-1">License Number <span className="text-gray-400">(Optional)</span></label><InputFieldComponent type="text" placeholder="Enter medical license number" value={formData.licenseNumber} onChange={handleInputChange("licenseNumber")}/></div>
                 {/* Terms & Conditions */}
                 <div className="flex items-center gap-2 pt-2"><input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-4 h-4 accent-cyan-400"/><label htmlFor="terms" className="text-sm text-gray-600">I agree to the <a href="#" className="text-pink-500 hover:underline"> Terms & Conditions </a></label></div>
                 {/* Register Button */}
                 <Button type="submit" disabled={!agreedToTerms || isLoading || !!mobileError} className="w-full py-3 mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors duration-200">{isLoading ? "Creating Account..." : "Register as Doctor"}</Button>
               </form>

               {/* Link to Login */}
               <p className="text-center text-sm text-gray-600 mt-6">
                 Already have an account?{' '}
                 <button onClick={handleLoginRedirect} className="font-medium text-cyan-600 hover:underline">
                   Login Here
                 </button>
               </p>
             </>
           )}
           {/* Placeholder if mode is user before redirect */}
           {registerMode === 'user' && (
               <p className="text-gray-500">Redirecting to user registration...</p>
           )}
        </div>
      </div>
    </div>
  );
}