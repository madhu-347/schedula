"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateDoctor, getDoctorById } from "@/app/services/doctor.api";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilityPage() {
  const { doctor, loading } = useAuth();
  const router = useRouter();
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [morningTime, setMorningTime] = useState({ from: "09:00", to: "12:00" });
  const [eveningTime, setEveningTime] = useState({ from: "14:00", to: "18:00" });
  const [isSaving, setIsSaving] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctor?.id) return;
      try {
        const res = await getDoctorById(doctor.id);
        const fullDoctor = res?.doctor || doctor;

        setAvailableDays(fullDoctor.availableDays || []);
        setMorningTime(fullDoctor.availableTime?.morning || { from: "09:00", to: "12:00" });
        setEveningTime(fullDoctor.availableTime?.evening || { from: "14:00", to: "18:00" });
        setIsAvailable(fullDoctor.isAvailable ?? true);
      } catch (error) {
        console.error("Failed to load doctor details:", error);
      }
    };

    fetchDoctor();
  }, [doctor?.id]);

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleToggleAvailability = async () => {
    if (!doctor) return;
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);

    try {
      const updatedDoctor = { ...doctor, isAvailable: newStatus };
      await updateDoctor(doctor.id, updatedDoctor);
      toast({
        title: newStatus ? "Status: Available" : "Status: Unavailable",
        description: newStatus
          ? "Patients can now book appointments with you."
          : "You are marked as unavailable.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update your status.",
        variant: "destructive",
      });
      setIsAvailable(!newStatus);
    }
  };


  const handleSave = async () => {
    if (!doctor) return;
    setIsSaving(true);

    try {
      const updatedDoctor = {
        ...doctor,
        isAvailable,
        availableDays,
        availableTime: { morning: morningTime, evening: eveningTime },
      };

      await updateDoctor(doctor.id, updatedDoctor);
      router.push("/doctor/dashboard");
      toast({
        title: "Profile Updated",
        description: "Your details and availability have been saved successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-cyan-100 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Availability</h1>
            </div>
            <p className="text-gray-600">
              Set your working days, hours, and update your professional details
            </p>
          </div>

          {/* Toggle Availability */}
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-medium ${
                isAvailable ? "text-cyan-600" : "text-gray-500"
              }`}
            >
              {isAvailable ? "Available" : "Unavailable"}
            </span>
            <button
              onClick={handleToggleAvailability}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                isAvailable ? "bg-cyan-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  isAvailable ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Working Days */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Working Days
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  availableDays.includes(day)
                    ? "bg-cyan-500 text-white border-cyan-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-cyan-300"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </Card>

        {/* Working Hours */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Working Hours
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Morning Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">From</label>
                  <input
                    type="time"
                    value={morningTime.from}
                    onChange={(e) =>
                      setMorningTime({ ...morningTime, from: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">To</label>
                  <input
                    type="time"
                    value={morningTime.to}
                    onChange={(e) =>
                      setMorningTime({ ...morningTime, to: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Evening Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">From</label>
                  <input
                    type="time"
                    value={eveningTime.from}
                    onChange={(e) =>
                      setEveningTime({ ...eveningTime, from: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">To</label>
                  <input
                    type="time"
                    value={eveningTime.to}
                    onChange={(e) =>
                      setEveningTime({ ...eveningTime, to: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg"
          >
            {isSaving ? "Saving..." : "Save Availability"}
          </Button>
        </div>
      </div>
    </div>
  );
}
