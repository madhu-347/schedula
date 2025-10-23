"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DividerWithText } from "@/components/auth/DividerWithText";
import { SocialLoginButtonComponent } from "@/components/auth/SocialLoginButton";
import { FormFooterComponent } from "@/components/auth/FormFooter";
import { LogoComponent } from "@/components/auth/Logo";
import { ButtonComponent } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
import { HeadingComponent } from "@/components/ui/Heading";
import { loginUser } from "@/lib/auth";

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
    console.log("logging in...");
    try {
      // Authenticate user using auth.ts
      const user = loginUser(formData.email, formData.password);

      if (user) {
        console.log("Login successful:", user);

        // Store user in localStorage for session management
        localStorage.setItem("user", JSON.stringify(user));

        // Simulate delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        alert("Invalid credentials. Please check your email and password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
    // Implement Google OAuth
  };

  const handleRegisterRedirect = () => {
    router.push("/register");
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    // Implement forgot password logic
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-black">
      <div className="bg-white rounded-3xl shadow-sm w-full max-w-md p-8">
        {/* Logo */}
        <LogoComponent imageUrl="/logo.png" />

        {/* Title */}
        <HeadingComponent text="Welcome Back" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Remember Me and Forgot Password */}
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
            className="w-full py-3 mt-2 bg-cyan-400 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-colors duration-200"
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

        {/* Register Link */}
        <FormFooterComponent
          question={"Don't have an account?"}
          linkText={"Sign Up"}
          onLinkClick={handleRegisterRedirect}
        />
      </div>
    </div>
  );
}
