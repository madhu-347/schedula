"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import AuthBanner from "@/components/auth/AuthBanner";
import AuthHeader from "@/components/auth/AuthHeader";
import { Eye, EyeOff } from "lucide-react"; // Added icons for password toggle

type RegisterMode = "user" | "doctor";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [registerMode, setRegisterMode] = useState<RegisterMode>("user");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  // Redirect if mode changes to doctor
  useEffect(() => {
    if (registerMode === "doctor") {
      router.push("/doctor/register");
    }
  }, [registerMode, router]);

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (field === "mobile") {
        if (!/^\d*$/.test(value)) return;
        setFormData((prev) => ({ ...prev, mobile: value }));
        if (value.length === 0) setMobileError("");
        else if (value.length !== 10)
          setMobileError("Mobile must be 10 digits");
        else setMobileError("");
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerMode !== "user") return;

    setIsLoading(true);
    if (mobileError || formData.mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      setIsLoading(false);
      return;
    }
    if (!agreedToTerms) {
      alert("Please agree to the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      console.log("👤 Registering User:", formData);

      // Call the registration API
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.mobile,
          password: formData.password,
        }),
      });

      const result = await response.json();
      console.log("User Registration Response:", result);

      if (!response.ok || !result.success) {
        alert(result.error || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Store pending user for OTP verification
      localStorage.setItem("pendingUser", JSON.stringify(result.data));

      // Generate and store OTP
      const generateOtp = (length = 4) =>
        Math.floor(1000 + Math.random() * 9000).toString();
      const generatedOtp = generateOtp(4);
      localStorage.setItem("generatedOtp", generatedOtp);
      localStorage.setItem(
        "otpExpiry",
        (Date.now() + 2 * 60 * 1000).toString()
      );
      console.log(`🔑 Generated OTP for user: ${generatedOtp}`);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
      router.push("/user/otp"); // Redirect to OTP page
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
      {/* HEADER - Pass userType="user" */}
      <AuthHeader activeLink="register" userType="user" />

      {/* MAIN CONTENT */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* LEFT SIDE BANNER */}
        <AuthBanner />

        {/* RIGHT SIDE FORM */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">
          {/* User/Doctor Toggle Buttons */}
          <div className="flex justify-center space-x-2 border border-gray-200 rounded-lg p-1 mb-8 w-full max-w-sm">
            <button
              onClick={() => setRegisterMode("user")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                registerMode === "user"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              User
            </button>
            <button
              onClick={() => setRegisterMode("doctor")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                registerMode === "doctor"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Doctor
            </button>
          </div>

          {/* Only show the user form if mode is 'user' */}
          {registerMode === "user" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Create Account
              </h2>
              <form
                onSubmit={handleSubmit}
                className="space-y-4 w-full max-w-md"
              >
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <InputFieldComponent
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    required
                    onChange={handleInputChange("firstName")}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <InputFieldComponent
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    required
                    onChange={handleInputChange("lastName")}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <InputFieldComponent
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    required
                    onChange={handleInputChange("email")}
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mobile Number
                  </label>
                  <InputFieldComponent
                    type="tel"
                    placeholder="Enter 10-digit mobile"
                    value={formData.mobile}
                    required
                    onChange={handleInputChange("mobile")}
                    maxLength={10}
                  />
                  {mobileError && (
                    <p className="text-red-500 text-xs mt-1">{mobileError}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <InputFieldComponent
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      required
                      onChange={handleInputChange("password")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions */}
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
                  disabled={!agreedToTerms || isLoading || !!mobileError}
                  className="cursor-pointer w-full py-3 mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors duration-200"
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>

              {/* Link to Login */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{" "}
                <button
                  onClick={handleLoginRedirect}
                  className="font-medium text-cyan-600 hover:underline"
                >
                  Login Here
                </button>
              </p>
            </>
          )}
          {/* Placeholder if mode is doctor before redirect */}
          {registerMode === "doctor" && (
            <p className="text-gray-500">
              Redirecting to doctor registration...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
