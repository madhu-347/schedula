"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateDoctor, getDoctorById } from "@/app/services/doctor.api";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import { Card } from "@/components/ui/Card";

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
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [morningTime, setMorningTime] = useState({
    from: "09:00",
    to: "12:00",
  });
  const [eveningTime, setEveningTime] = useState({
    from: "14:00",
    to: "18:00",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (doctor) {
      setAvailableDays(doctor.availableDays || []);
      setMorningTime(
        doctor.availableTime?.morning || {
          from: "09:00",
          to: "12:00",
        }
      );
      setEveningTime(
        doctor.availableTime?.evening || {
          from: "14:00",
          to: "18:00",
        }
      );
    }
  }, [doctor]);

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleSave = async () => {
    if (!doctor) return;

    setIsSaving(true);
    try {
      const updatedDoctor = {
        ...doctor,
        availableDays,
        availableTime: {
          morning: morningTime,
          evening: eveningTime,
        },
      };

      await updateDoctor(doctor.id, updatedDoctor);

      // Update the auth context with the new data
      const refreshedDoctor = await getDoctorById(doctor.id);
      if (refreshedDoctor?.doctor) {
        // The AuthContext would need to be updated, but we can't directly modify it here
        // In a real app, you'd have a method to refresh the doctor data in the context
      }

      toast({
        title: "Availability Updated",
        description: "Your availability has been successfully updated.",
      });
    } catch (error) {
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Availability</h1>
          <p className="text-gray-600">
            Set your working days and hours to manage appointment bookings
          </p>
        </div>

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

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Working Hours
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Morning Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    From
                  </label>
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
                  <label className="block text-sm text-gray-700 mb-1">
                    From
                  </label>
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
