"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthBanner from "@/components/auth/AuthBanner";
import { toast } from "react-hot-toast";

export default function OtpPage() {
  const router = useRouter();
  const [enteredOtp, setEnteredOtp] = useState("");
  const [timer, setTimer] = useState(120); // 2 mins
  const [otpVisible, setOtpVisible] = useState<string | null>(null);


  useEffect(() => {
  const pendingUser = localStorage.getItem("pendingUser");
  if (!pendingUser) {
    toast.error("No pending user found. Please log in again.");
    router.push("/user/login");
  }
}, [router]);
  // Show OTP when the page loads (for testing/demo)
  useEffect(() => {
    const otp = localStorage.getItem("generatedOtp");
    const expiry = Number(localStorage.getItem("otpExpiry"));
    if (otp && expiry && Date.now() < expiry) {
      setOtpVisible(otp);
      // toast.success(`Your OTP is ${otp}`, {
      //   duration: 4000,
      //   position: "top-center",
      // });
    } else {
      toast.error("OTP expired! Please login again.");
      router.push("/user/dashboard");
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
      const expiryTime = Date.now() + 30 * 60 * 1000; // 30 mins session
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userExpiry", expiryTime.toString());

      // Clean up
      localStorage.removeItem("pendingUser");
      localStorage.removeItem("generatedOtp");
      localStorage.removeItem("otpExpiry");

      toast.success("OTP Verified Successfully 🎉");
      router.push("/user/dashboard");
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

    // toast.success(`New OTP: ${newOtp}`, {
    //   duration: 4000,
    //   position: "top-center",
    // });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT SIDE BANNER */}
      <AuthBanner />

      {/* RIGHT SIDE OTP SECTION */}
      <div className="flex-1 flex md:w-1/3 flex-col justify-center items-center px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter OTP</h2>
        <p className="text-gray-500 mb-6 text-center">
          Please enter the 4-digit OTP sent to your registered email / mobile.
        </p>

        {/* Input Field */}
        <input
          type="text"
          maxLength={4}
          value={enteredOtp}
          onChange={(e) => setEnteredOtp(e.target.value)}
          className="text-center tracking-widest text-xl border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="----"
        />

        {/* Verify Button */}
        <button
          onClick={handleVerifyOtp}
          className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition"
        >
          Verify OTP
        </button>

        {/* Resend Timer */}
        <div className="mt-4 text-sm text-gray-600 text-center">
          {timer > 0 ? (
            <p>Resend OTP in {timer}s</p>
          ) : (
            <button
              onClick={handleResendOtp}
              className="text-cyan-600 font-medium hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>

        {/* Optional — Show OTP inline for debugging/demo */}
        {otpVisible && (
          <div className="mt-4 text-cyan-700 bg-cyan-50 border border-cyan-200 px-4 py-2 rounded-md text-sm text-center flex items-center justify-center gap-2">
            OTP: <strong>{otpVisible}</strong>
            <button
              onClick={() => navigator.clipboard.writeText(otpVisible)}
              className="text-xs text-cyan-600 underline hover:text-cyan-800"
            >
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
