"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import { createUser } from "@/lib/auth";

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

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!agreedToTerms) {
        alert("Please agree to the terms and conditions");
        setIsLoading(false);
        return;
      }

      // Create user using auth.ts
      const newUser = createUser(
        formData.fullName,
        formData.email,
        formData.password
      );

      if (newUser) {
        console.log("Registration successful:", newUser);

        // Store user in localStorage for session management
        localStorage.setItem("user", JSON.stringify(newUser));

        // Simulate delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Redirect to dashboard
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

  const handleGoogleSignUp = () => {
    console.log("Google sign up clicked");
    // Implement Google OAuth
  };

  const handleLoginRedirect = () => {
    router.push("/user/login");
  };

  return (
    <div className="">
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <InputFieldComponent
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              required={true}
              onChange={handleInputChange("fullName")}
              className=""
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <InputFieldComponent
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              required={true}
              onChange={handleInputChange("email")}
              className=""
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Mobile Number
            </label>
            <InputFieldComponent
              type="tel"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              required={true}
              onChange={handleInputChange("mobile")}
              className=""
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
              className=""
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
          <Button
            type="submit"
            disabled={!agreedToTerms || isLoading}
            className="w-full py-3 mt-2 bg-cyan-400 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-colors duration-200"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </div>
  );
}
