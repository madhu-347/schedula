"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthBanner from "@/components/auth/AuthBanner";
import { toast } from "react-hot-toast";

export default function OtpPage() {
  const router = useRouter();
  const [enteredOtp, setEnteredOtp] = useState("");
  const [timer, setTimer] = useState(120);
  const [otpVisible, setOtpVisible] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  

  // Check for pending user
  useEffect(() => {
    const pendingUser = localStorage.getItem("pendingUser");
    if (!pendingUser) {
      toast.error("No pending user found. Please log in again.");
      router.push("/user/login");
    }
  }, [router]);

  // Load OTP from localStorage
  useEffect(() => {
    const otp = localStorage.getItem("generatedOtp");
    const expiry = Number(localStorage.getItem("otpExpiry"));
    if (otp && expiry && Date.now() < expiry) {
      setOtpVisible(otp);
    } else {
      toast.error("OTP expired! Please login again.");
      router.push("/user/login");
    }
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(countdown);
  }, [timer]);

  // Verify OTP
  const handleVerifyOtp = () => {
    const storedOtp = localStorage.getItem("generatedOtp");
    const otpExpiry = Number(localStorage.getItem("otpExpiry"));
    const pendingUser = localStorage.getItem("pendingUser");

    if (!storedOtp || !otpExpiry || Date.now() > otpExpiry) {
      toast.error("OTP expired! Please login again.");
      router.push("/user/login");
      return;
    }

    if (enteredOtp === storedOtp && pendingUser) {
      const user = JSON.parse(pendingUser);
      const expiryTime = Date.now() + 30 * 60 * 1000; // 30 mins
      // Set userId in localStorage for AuthContext
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userExpiry", expiryTime.toString());
      localStorage.removeItem("pendingUser");
      localStorage.removeItem("generatedOtp");
      localStorage.removeItem("otpExpiry");
      toast.success("OTP Verified Successfully 🎉");
      setTimeout(() => {
        router.push("/user/dashboard");
      }, 1500); // 1.5 seconds delay
    } else {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    localStorage.setItem("generatedOtp", newOtp);
    localStorage.setItem("otpExpiry", (Date.now() + 2 * 60 * 1000).toString());
    setTimer(120);
    setOtpVisible(newOtp);
    toast.success("New OTP sent successfully!");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden w-full">
      {/* Left side banner */}
      <AuthBanner />

      {/* Right side OTP card */}
      <div className="flex-1 flex md:w-1/3 justify-center items-center">
        <div className="max-w-sm w-full p-6 md:p-8 bg-white">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Enter OTP
          </h2>
          <p className="text-gray-500 mb-6">
            Please enter the 4-digit OTP sent to your registered email / mobile.
          </p>

          {/* OTP input */}
          <input
            type="text"
            maxLength={4}
            value={enteredOtp}
            onChange={(e) =>
              setEnteredOtp(e.target.value.replace(/[^0-9]/g, ""))
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-xl tracking-[0.6em] focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            placeholder="----"
          />

          {/* Verify button */}
          <button
            onClick={handleVerifyOtp}
            className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Verify OTP
          </button>

          {/* Resend section */}
          <div className="mt-4 text-sm text-gray-600 text-center">
            {timer > 0 ? (
              <p>
                Resend OTP in{" "}
                <span className="font-semibold text-gray-800">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                className="text-cyan-600 font-medium hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          {/* Show OTP (for demo / testing) */}
          {otpVisible && (
            <div className="mt-5 bg-cyan-50 border border-cyan-200 text-cyan-700 px-4 py-2 rounded-md text-sm flex justify-center items-center gap-2">
              OTP: <strong>{otpVisible}</strong>
              <button
                 onClick={() => {
                  navigator.clipboard.writeText(otpVisible);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500); // reset after 1.5 seconds
                }}
                className="text-xs text-cyan-600 underline hover:text-cyan-800"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
