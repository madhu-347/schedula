"use client";

import React, { useState, useEffect } from "react"; // Import React explicitly if needed
import { useRouter } from "next/navigation";
import AuthBanner from "@/components/auth/AuthBanner";
import { toast } from "react-hot-toast";

export default function DoctorOtpPage() {
  const router = useRouter();
  const [enteredOtp, setEnteredOtp] = useState("");
  const [timer, setTimer] = useState(120); // 2 minutes timer
  const [otpVisible, setOtpVisible] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null); // Use null initially to indicate check hasn't run
  const [copied, setCopied] = useState(false);

  // Effect 1: Check session validity and load OTP on mount
  useEffect(() => {
    console.log("Checking session validity..."); // Debug log
    const otp = localStorage.getItem("generatedOtp");
    const expiry = Number(localStorage.getItem("otpExpiry"));
    const pendingUser = localStorage.getItem("pendingUser");
    let isDoctor = false;
    let sessionValid = false;

    try {
      if (pendingUser) {
        isDoctor = JSON.parse(pendingUser).type === "doctor";
      }
    } catch (e) {
      console.error("Error parsing pending user", e);
    }

    // Check all conditions
    if (otp && expiry && Date.now() < expiry && pendingUser && isDoctor) {
      console.log("Session valid, setting OTP visible."); // Debug log
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOtpVisible(otp); // Still technically violates rule, but necessary for initial display
      sessionValid = true;
    } else {
      console.log("Session invalid or expired."); // Debug log
      toast.error("OTP expired or invalid session! Please login again.");
      router.push("/doctor/login");
    }
    setIsValidSession(sessionValid); // Set validity *after* checks

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // Run only once on mount - router is stable

  // Effect 2: Countdown timer (only runs if session is valid)
  useEffect(() => {
    // Don't start timer if validity check hasn't run, session is invalid, or timer already finished
    if (isValidSession === null || !isValidSession || timer <= 0) return;

    // console.log("Starting timer..."); // Debug log
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Cleanup interval on unmount or if timer reaches 0
    return () => {
      // console.log("Cleaning up timer interval."); // Debug log
      clearInterval(countdown);
    };
  }, [timer, isValidSession]); // Depend on timer and session validity

  // Verify OTP
  const handleVerifyOtp = () => {
    const storedOtp = localStorage.getItem("generatedOtp");
    const otpExpiry = Number(localStorage.getItem("otpExpiry"));
    const pendingUser = localStorage.getItem("pendingUser");

    if (!storedOtp || !otpExpiry || Date.now() > otpExpiry) {
      toast.error("OTP expired! Please login again.");
      router.push("/doctor/login");
      return;
    }
    if (enteredOtp === storedOtp && pendingUser) {
      const user = JSON.parse(pendingUser);
      if (user.type !== "doctor") {
        toast.error("Authentication error. Not a doctor account.");
        router.push("/doctor/login");
        return;
      }
      const expiryTime = Date.now() + 60 * 60 * 1000;
      // Set userId in localStorage for AuthContext
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userRole", "doctor"); // Set user role in localStorage
      localStorage.setItem("userExpiry", expiryTime.toString());
      localStorage.removeItem("pendingUser");
      localStorage.removeItem("generatedOtp");
      localStorage.removeItem("otpExpiry");
      toast.success("OTP Verified Successfully 🎉");
      setTimeout(() => {
        router.push("/doctor/dashboard");
      }, 1000);
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
    toast.success("New OTP generated!");
  };

  // Show loading state while checking session validity
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Verifying session...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden w-full">
      {/* Left side banner */}
      <AuthBanner />

      {/* Right side OTP card */}
      <div className="flex-1 flex md:w-1/3 justify-center items-center p-6 md:p-8">
        <div className="max-w-sm w-full bg-white">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Enter Doctor OTP
          </h2>
          <p className="text-gray-500 mb-6">Please enter the 4-digit OTP.</p>

          {/* OTP input */}
          <input
            type="text"
            maxLength={4}
            value={enteredOtp}
            onChange={(e) =>
              setEnteredOtp(e.target.value.replace(/[^0-9]/g, ""))
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-xl tracking-[0.6em] focus:outline-none focus:ring-2 focus:ring-cyan-400 transition mb-6"
            placeholder="----"
          />

          {/* Verify button */}
          <button
            onClick={handleVerifyOtp}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition"
            // Disable button if OTP length is not 4
            disabled={enteredOtp.length !== 4}
          >
            Verify OTP
          </button>

          {/* Resend section */}
          <div className="mt-4 text-sm text-gray-600 text-center">
            {timer > 0 ? (
              <p>
                {" "}
                Resend OTP in{" "}
                <span className="font-semibold text-gray-800">
                  {timer}s
                </span>{" "}
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                className="text-cyan-600 font-medium hover:underline"
              >
                {" "}
                Resend OTP{" "}
              </button>
            )}
          </div>

          {/* Show OTP (for demo/testing) */}
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
