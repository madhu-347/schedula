"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const bannerImages = [
  "/banners/login-page-3.png",
  "/banners/login-page-2.png",
  "/banners/login-page-1.png",
];

const bannerTexts = [
  "Book Appointments Instantly",
  "Find the Best Specialists",
  "Manage Health Effortlessly",
];

export default function AuthBanner() {
  const [currentImage, setCurrentImage] = useState(0);

  // Auto-rotate banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % bannerImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden md:flex md:w-2/3 border-r border-gray-200 relative items-center justify-center bg-white overflow-hidden">
      {/* Animated Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-[80%] max-w-[600px] h-auto aspect-[4/3] md:aspect-[3/2] lg:aspect-[16/9]">
            <Image
              src={bannerImages[currentImage]}
              alt={`Hospital banner ${currentImage + 1}`}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 80vw, (max-width: 1200px) 60vw, 50vw"
            />
          </div>
        </motion.div>

      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#e0f7fa]/70 via-transparent to-transparent pointer-events-none" />

      {/* Text Overlay */}
      <div className="absolute bottom-12 left-12 text-[#015b63] max-w-md">
        <motion.h2
          key={currentImage}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold"
        >
          {bannerTexts[currentImage]}
        </motion.h2>
      </div>
    </div>
  );
}
