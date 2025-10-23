import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keeps your team's font
import "./globals.css";
import BottomNav from "@/components/BottomNav"; // Import the nav bar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schedula", // Updated title
  description: "Doctor Appointment Scheduling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // ▼▼▼ THIS IS THE FIX ▼▼▼
        // These classes center your app and add the background
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-w-md mx-auto bg-gray-50`}
      >
        {children}
        <BottomNav /> {/* Add the nav bar here */}
      </body>
    </html>
  );
}