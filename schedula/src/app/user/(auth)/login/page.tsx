"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DividerWithText } from "@/components/auth/DividerWithText";
import { SocialLoginButtonComponent } from "@/components/auth/SocialLoginButton";
import { FormFooterComponent } from "@/components/auth/FormFooter";
import { LogoComponent } from "@/components/auth/Logo";
import { ButtonComponent } from "@/components/ui/Button";
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
        (u) => u.email === formData.email || u.mobile === formData.email
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
    <div className="min-h-screen bg-linear-to-r from-cyan-500 to-cyan-600  flex flex-col md:flex-row items-center justify-center">
      
      <div className="flex-1 rounded-4xl bg-white shadow-lg w-full max-w-md px-8">
        <div className="py-4">
{/* Logo */}
        <div className="flex justify-center">
          <LogoComponent imageUrl="/logo.png" />
        </div>

        {/* Heading */}
        <HeadingComponent text="Welcome Back" />
        <p className="text-center text-gray-500 mb-6">
          Please enter your details to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="">
          {/* Email / Mobile */}
          <div>
            <label className="block text-sm font-medium">Email / Mobile</label>
            <InputFieldComponent
              type="text"
              placeholder="Enter your email or mobile"
              value={formData.email}
              required={true}
              onChange={handleInputChange("email")}
              className=""
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium">Password</label>
            <InputFieldComponent
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              required={true}
              onChange={handleInputChange("password")}
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center">
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
            <a
              href="#"
              className="text-sm text-pink-500 hover:underline"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </a>
          </div>

          {/* Sign In Button */}
          <ButtonComponent
            text={isLoading ? "Signing In..." : "Sign In"}
            type={"submit"}
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors duration-200"
          />

          {/* Divider */}
          <DividerWithText text="Or continue with" />

          {/* Google Login */}
          <SocialLoginButtonComponent
            text={"Continue with Google"}
            onClick={handleGoogleLogin}
            iconUrl={"/google.jpeg"}
          />
        </form>

        {/* Footer */}
        <FormFooterComponent
          question={"Don't have an account?"}
          linkText={"Sign Up"}
          onLinkClick={handleRegisterRedirect}
        />
        </div>
        
      </div>
    </div>
  );
}
