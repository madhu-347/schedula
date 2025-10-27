"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import { createUser } from "@/lib/auth";
import AuthBanner from "@/components/auth/AuthBanner";
import AuthHeader from "@/components/auth/AuthHeader";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileError, setMobileError] = useState("");


 const handleInputChange =
  (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (field === "mobile") {
      // Allow only digits
      if (!/^\d*$/.test(value)) {
        return; // ignore non-numeric input
      }

      // Update the field
      setFormData((prev) => ({ ...prev, mobile: value }));

      // Validate length
      if (value.length === 0) {
        setMobileError("");
      } else if (value.length < 10) {
        setMobileError("Mobile number must be 10 digits");
      } else if (value.length > 10) {
        setMobileError("Mobile number cannot exceed 10 digits");
      } else {
        setMobileError("");
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileError || formData.mobile.length !== 10) {
    alert("Please enter a valid 10-digit mobile number");
    setIsLoading(false);
    return;
  }

    try {
      if (!agreedToTerms) {
        alert("Please agree to the terms and conditions");
        setIsLoading(false);
        return;
      }

      const newUser = createUser(
        formData.fullName,
        formData.email,
        formData.password
      );

      if (newUser) {
        localStorage.setItem("user", JSON.stringify(newUser));
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push("/dashboard");
      } else {
        alert("Registration failed. Email might already exist.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => router.push("/user/login");

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
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <InputFieldComponent
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                required
                onChange={handleInputChange("fullName")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <InputFieldComponent
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                required
                onChange={handleInputChange("email")}
              />
            </div>

            <div>
               <label className="block text-sm font-medium mb-2">
    Mobile Number
      </label>
      <InputFieldComponent
        type="tel"
        placeholder="Enter your mobile number"
        value={formData.mobile}
        required
        onChange={handleInputChange("mobile")}
        maxLength={10}
      />
  {mobileError && (
    <p className="text-red-500 text-xs mt-1">{mobileError}</p>
  )}

            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
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

            <Button
              type="submit"
              disabled={!agreedToTerms || isLoading}
              className="w-full py-6 mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
