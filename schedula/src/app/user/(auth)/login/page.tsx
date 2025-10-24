"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DividerWithText } from "@/components/auth/DividerWithText";
import { SocialLoginButtonComponent } from "@/components/auth/SocialLoginButton";
import { FormFooterComponent } from "@/components/auth/FormFooter";
import { LogoComponent } from "@/components/auth/Logo";
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import { HeadingComponent } from "@/components/ui/Heading";
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
        localStorage.setItem("user", JSON.stringify(user));
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4">
      <div className="flex-1 rounded-3xl bg-white shadow-lg w-full max-w-md px-8">
        <div className="py-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <LogoComponent imageUrl="/logo.png" />
          </div>

          {/* Heading */}
          <HeadingComponent text="Welcome Back" />
          <p className="text-center text-gray-500 mb-6">
            Please enter your details to continue
          </p>

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

            {/* Divider */}
            <DividerWithText text="Or continue with" />

            {/* Google Login */}
            <SocialLoginButtonComponent
              text="Continue with Google"
              onClick={handleGoogleLogin}
              iconUrl="/google.jpeg"
            />
          </form>

          {/* Footer */}
          <FormFooterComponent
            question="Don't have an account?"
            linkText="Sign Up"
            onLinkClick={handleRegisterRedirect}
          />
        </div>
      </div>
    </div>
  );
}
