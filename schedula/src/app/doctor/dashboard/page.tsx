"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Users, Settings } from "lucide-react"; 
import Link from "next/link";

// Define a basic type for the logged-in user/doctor from localStorage
type AccountInfo = {
    id: number | string;
    name: string;
    email: string;
    type: 'user' | 'doctor';
};

export default function DoctorDashboardPage() {
    const router = useRouter();
    const [doctorInfo, setDoctorInfo] = useState<AccountInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Loading state

    useEffect(() => {
        // Basic auth check simulation
        const userString = localStorage.getItem("user");
        const expiryString = localStorage.getItem("userExpiry");
        const expiry = expiryString ? Number(expiryString) : 0;

        let isValid = false;
        let userData: AccountInfo | null = null;

        if (userString && expiry && Date.now() < expiry) {
            try {
                userData = JSON.parse(userString);
                if (userData && userData.type === 'doctor') {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setDoctorInfo(userData);
                    isValid = true;
                }
            } catch (e) {
                console.error("Error parsing user data from localStorage", e);
            }
        }

        if (!isValid) {
            alert("Session invalid or expired. Please log in as a doctor.");
            router.push('/doctor/login'); // Redirect to doctor login
        } else {
            setIsLoading(false); // Valid session, stop loading
        }
    }, [router]);

    // Basic logout function
    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("userExpiry");
        // Optionally clear other related items
        localStorage.removeItem("pendingUser");
        localStorage.removeItem("generatedOtp");
        localStorage.removeItem("otpExpiry");
        router.push('/doctor/login');
    };


    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-100">
                <p>Verifying session...</p>
            </div>
        );
    }

    // Render dashboard if authenticated
    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-100">
            <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                    >
                        Logout
                    </button>
                </div>
                {doctorInfo && (
                     <p className="text-lg sm:text-xl text-gray-700 mb-4">Welcome back, <span className="font-semibold">{doctorInfo.name}</span>!</p>
                )}
                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Overview</h2>
                    <p className="text-gray-600">
                        This is where your doctor-specific dashboard content will go.
                        You can add sections for upcoming appointments, patient management, analytics, etc.
                    </p>
                    {/* Placeholder for future components */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        href="/doctor/appointments"
                        className="bg-gray-50 hover:bg-cyan-50 p-5 rounded-lg border border-gray-200 transition group"
                        >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-cyan-100 rounded-full">
                            <Users className="w-5 h-5 text-[#46C2DE]" />
                            </div>
                            <h3 className="font-semibold text-gray-800 group-hover:text-[#46C2DE] transition">
                            Appointments
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            View and manage all your appointments in one place.
                        </p>
                    </Link>
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <h3 className="font-medium text-gray-700 mb-2">Patient List</h3>
                             <p className="text-sm text-gray-500">View and manage patients.</p>
                        </div>
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <h3 className="font-medium text-gray-700 mb-2">Profile Settings</h3>
                             <p className="text-sm text-gray-500">Update your information.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}