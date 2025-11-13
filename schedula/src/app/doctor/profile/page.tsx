"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updateDoctor } from "@/app/services/doctor.api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toast } from "@/hooks/useToast";
import { ArrowLeft } from "lucide-react";

export default function DoctorProfilePage() {
  const { doctor, loading } = useAuth();
  const router = useRouter();

  const [image, setImage] = useState<string>("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [fee, setFee] = useState<number | string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load existing doctor data
    useEffect(() => {
        if (doctor) {
            const storedImage =
            doctor.image ||
            localStorage.getItem(`doctorImage_${doctor.id}`) ||
            "/default-doctor.png";
            setImage(storedImage);
            setBio(doctor.bio || "");
            setQualifications(doctor.qualifications || "");
            setFee(doctor.fee || "");
            const hasAllDetails =
            !!storedImage && !!doctor.bio && !!doctor.qualifications && !!doctor.fee;
            setIsSaved(hasAllDetails);
        }
        }, [doctor]);
  const isProfileComplete =
    !!image && bio.trim() !== "" && qualifications.trim() !== "" && !!fee;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        localStorage.setItem(`doctorImage_${doctor?.id}`, base64);
        setIsSaved(false);
        };
        reader.readAsDataURL(file);
    }
    };

  const handleSaveProfile = async () => {
  if (!doctor) return;

  if (!isProfileComplete) {
    toast({
      title: "Incomplete Fields",
      description: "Please fill all fields before saving.",
      variant: "destructive",
    });
    return;
  }

  setIsSaving(true);
  try {
    const updatedDoctor = {
      ...doctor,
      image,
      bio,
      qualifications,
      fee: Number(fee),
    };

    await updateDoctor(doctor.id, updatedDoctor);

    setIsSaved(true);

    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    toast({
      title: "Error",
      description: "Failed to update profile. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-cyan-100 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 text-sm">
              Manage your personal and professional details
            </p>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6 bg-white shadow-sm">
          <div className="relative">
            <img
              src={image || "/default-doctor.png"}
              alt="Doctor Profile"
              className="w-32 h-32 rounded-full object-cover border border-gray-200 shadow-sm"
            />
            <label className="absolute bottom-1 right-1 bg-cyan-500 text-white rounded-full p-2 cursor-pointer hover:bg-cyan-600 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </label>
          </div>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-xl font-semibold text-gray-900">
              Dr. {doctor?.firstName} {doctor?.lastName}
            </h2>
            <p className="text-sm text-gray-600">{doctor?.specialty}</p>
            <p className="text-sm text-gray-500">
              {doctor?.email} · {doctor?.phone || "N/A"}
            </p>
          </div>
        </Card>

        {/* Professional Details */}
        <Card className="p-6 bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Professional Details
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Qualifications
              </label>
              <input
                type="text"
                value={qualifications}
                onChange={(e) => {
                  setQualifications(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="e.g. MBBS, MS (Surgeon)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                value={fee}
                onChange={(e) => {
                  setFee(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="e.g. 300"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Bio / About You
              </label>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Write a short introduction about yourself..."
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Buttons Section */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-6">
            {/* Save Button */}
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving || !isProfileComplete}
              className={`px-6 py-3 font-medium rounded-lg transition-all ${
                !isProfileComplete
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-cyan-500 hover:bg-cyan-600 text-white"
              }`}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>

            {/* Manage Availability Button */}
            <Button
              onClick={() => router.push("/doctor/availability")}
              disabled={!isSaved}
              className={`px-6 py-3 font-medium rounded-lg transition-all ${
                !isSaved
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              Manage Availability
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
