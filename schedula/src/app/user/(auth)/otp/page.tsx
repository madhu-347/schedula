"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ✅ Helper to generate random 4-digit OTP
const generateOtp = (length = 4) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // digits 0–9
  }
  return otp;
};

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(58);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // ✅ Load user info and generate OTP on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const otp = generateOtp();
      setGeneratedOtp(otp);
      localStorage.setItem("otp", otp);
      console.log(`📩 OTP for ${parsedUser.email || parsedUser.mobile}: ${otp}`);
    } else {
      router.push("/user/login");
    }
  }, [router]);

  // ✅ Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setResendEnabled(true);
    }
  }, [timer]);

  // ✅ Handle OTP input changes
  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // ✅ Handle OTP verification
  const handleVerify = () => {
    const enteredOtp = otp.join("");
    const storedOtp = localStorage.getItem("otp");

    if (enteredOtp === storedOtp) {
      alert("✅ OTP Verified Successfully!");
      localStorage.setItem("otp", storedOtp || "");
      router.push("/user/dashboard");
    } else {
      alert("❌ Incorrect OTP. Please try again.");
      setOtp(["", "", "", ""]);
    }
  };

  // ✅ Handle resend
  const handleResend = () => {
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    localStorage.setItem("otp", newOtp);
    console.log(`🔄 Resent OTP: ${newOtp}`);

    setTimer(58);
    setResendEnabled(false);
    setOtp(["", "", "", ""]);
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-linear-to-r from-cyan-500 to-cyan-600  px-6 text-black">
      <div className="w-full max-w-sm bg-white shadow-md rounded-2xl p-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/user/login")}
          className="text-gray-600 text-sm mb-6 hover:text-cyan-500 transition"
        >
          ← Back
        </button>

        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          OTP Verification
        </h1>
        <p className="text-gray-600 text-sm mb-8">
          Code has been sent to{" "}
          <span className="font-medium text-gray-900">
            {user?.mobile ? `+91 ${user.mobile}` : user?.email}
          </span>
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-between mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-14 h-14 border border-gray-300 rounded-lg text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#00bcd4] bg-gray-50"
            />
          ))}
        </div>

        {/* Timer + Resend */}
        <div className="text-center text-gray-500 text-sm mb-6">
          Resend code in{" "}
          {resendEnabled ? (
            <button
              onClick={handleResend}
              className="text-[#00bcd4] font-semibold hover:underline"
            >
              Resend
            </button>
          ) : (
            <span className="text-[#00bcd4] font-semibold">{timer}s</span>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isOtpComplete}
          className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
            isOtpComplete
              ? "bg-[#00bcd4] text-white hover:bg-[#4fc3f7]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Verify OTP
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Didn’t receive the code?{" "}
          <span
            onClick={resendEnabled ? handleResend : undefined}
            className={`font-medium ${
              resendEnabled
                ? "text-[#00bcd4] hover:underline cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            {resendEnabled ? "Resend Now" : "Wait..."}
          </span>
        </p>
      </div>
    </div>
  );
}
