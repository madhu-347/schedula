"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import { Appointment } from "@/lib/types/appointment";
import Image from "next/image";
import { DoctorInfoCard } from "@/components/cards/DoctorReview";
import mockData from "@/lib/mockData.json";

interface FeedbackData {
  appointmentId: number | string;
  doctorName: string;
  consultingRating: number;
  hospitalRating: number;
  waitingTimeRating: number;
  wouldRecommend: boolean | null;
  feedbackText: string;
  submittedAt: string;
}

interface DoctorData {
  id: number;
  name: string;
  specialty: string;
  time: string;
  profilePicture: string;
}

const ConsultingFeedbackPage = () => {
  const router = useRouter();
  const [currentAppointment, setCurrentAppointment] =
    useState<Appointment | null>(null);
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [existingFeedbackIndex, setExistingFeedbackIndex] = useState<
    number | null
  >(null);

  // Rating states
  const [consultingRating, setConsultingRating] = useState(0);
  const [hospitalRating, setHospitalRating] = useState(0);
  const [waitingTimeRating, setWaitingTimeRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  // Hover states for star animations
  const [consultingHover, setConsultingHover] = useState(0);
  const [hospitalHover, setHospitalHover] = useState(0);
  const [waitingTimeHover, setWaitingTimeHover] = useState(0);

  useEffect(() => {
    try {
      const currentAppointmentStr = localStorage.getItem("currentAppointment");

      if (currentAppointmentStr) {
        const appointment: Appointment = JSON.parse(currentAppointmentStr);
        setCurrentAppointment(appointment);

        // Find matching doctor from mockData
        const doctor = (mockData.doctors as DoctorData[]).find(
          (doc) =>
            doc.name.trim().toLowerCase() ===
            appointment.doctorName.trim().toLowerCase()
        );

        if (doctor) {
          setDoctorData(doctor);
        }

        // Check if feedback already exists for this appointment
        const existingFeedbackStr = localStorage.getItem("appointmentFeedback");
        if (existingFeedbackStr) {
          const existingFeedback: FeedbackData[] =
            JSON.parse(existingFeedbackStr);
          const feedbackIndex = existingFeedback.findIndex(
            (feedback) => feedback.appointmentId === appointment.id
          );

          if (feedbackIndex !== -1) {
            // Load existing feedback data
            const feedback = existingFeedback[feedbackIndex];
            setConsultingRating(feedback.consultingRating);
            setHospitalRating(feedback.hospitalRating);
            setWaitingTimeRating(feedback.waitingTimeRating);
            setWouldRecommend(feedback.wouldRecommend);
            setFeedbackText(feedback.feedbackText || "");
            setExistingFeedbackIndex(feedbackIndex);
          }
        }
      } else {
        toast({
          title: "No Appointment Found",
          description: "Please select an appointment first.",
          variant: "destructive",
        });
        router.push("/user/appointments");
      }
    } catch (error) {
      console.error("Error loading appointment:", error);
      toast({
        title: "Error",
        description: "Failed to load appointment details.",
        variant: "destructive",
      });
      router.push("/user/appointments");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = () => {
    // Validate all fields are filled
    if (consultingRating === 0) {
      toast({
        title: "Incomplete Feedback",
        description: "Please rate the consulting experience.",
        variant: "destructive",
      });
      return;
    }

    if (hospitalRating === 0) {
      toast({
        title: "Incomplete Feedback",
        description: "Please rate the hospital/clinic.",
        variant: "destructive",
      });
      return;
    }

    if (waitingTimeRating === 0) {
      toast({
        title: "Incomplete Feedback",
        description: "Please rate the waiting time.",
        variant: "destructive",
      });
      return;
    }

    if (wouldRecommend === null) {
      toast({
        title: "Incomplete Feedback",
        description: "Please select if you would recommend the doctor.",
        variant: "destructive",
      });
      return;
    }

    if (!currentAppointment) return;

    try {
      // Create feedback object
      const feedback: FeedbackData = {
        appointmentId: currentAppointment.id,
        doctorName: currentAppointment.doctorName,
        consultingRating,
        hospitalRating,
        waitingTimeRating,
        wouldRecommend,
        feedbackText: feedbackText.trim(),
        submittedAt: new Date().toISOString(),
      };

      // Get existing feedback
      const existingFeedbackStr = localStorage.getItem("appointmentFeedback");
      const existingFeedback: FeedbackData[] = existingFeedbackStr
        ? JSON.parse(existingFeedbackStr)
        : [];

      if (existingFeedbackIndex !== null) {
        // Update existing feedback
        existingFeedback[existingFeedbackIndex] = feedback;
        toast({
          title: "Feedback Updated",
          description: "Your feedback has been updated successfully!",
        });
      } else {
        // Add new feedback
        existingFeedback.push(feedback);
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your valuable feedback!",
        });
      }

      localStorage.setItem(
        "appointmentFeedback",
        JSON.stringify(existingFeedback)
      );

      // Navigate to appointments page
      setTimeout(() => {
        router.push("/user/appointment");
      }, 1000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !currentAppointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Get doctor info with fallbacks
  const displaySpecialty =
    doctorData?.specialty || currentAppointment.specialty || "Specialist";
  const displayTime = doctorData?.time || "Available today";
  const displayImage =
    currentAppointment.doctorImage ||
    doctorData?.profilePicture ||
    "/male-doctor.png";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            Consulting Feedback
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Doctor Card */}
        <DoctorInfoCard
          name={currentAppointment.doctorName}
          specialty={displaySpecialty}
          location={displayTime}
          qualification={currentAppointment.qualification || "MBBS, MD"}
          imageUrl={displayImage}
        />

        {/* Consulting Time */}
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-base text-gray-700 font-medium">
              Consulting Time
            </span>
            <span className="text-base text-cyan-600 font-semibold">
              {currentAppointment.date} | {currentAppointment.timeSlot}
            </span>
          </div>
        </div>

        {/* Consulting Feedback Rating */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Consulting Feedback
          </h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setConsultingRating(star)}
                onMouseEnter={() => setConsultingHover(star)}
                onMouseLeave={() => setConsultingHover(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={40}
                  className={`${
                    star <= (consultingHover || consultingRating)
                      ? "fill-cyan-400 text-cyan-400"
                      : "text-cyan-400"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Hospital/Clinic Feedback */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Hospital/Clinic Feedback
          </h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setHospitalRating(star)}
                onMouseEnter={() => setHospitalHover(star)}
                onMouseLeave={() => setHospitalHover(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={40}
                  className={`${
                    star <= (hospitalHover || hospitalRating)
                      ? "fill-cyan-400 text-cyan-400"
                      : "text-cyan-400"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Waiting Time */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Waiting Time
          </h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setWaitingTimeRating(star)}
                onMouseEnter={() => setWaitingTimeHover(star)}
                onMouseLeave={() => setWaitingTimeHover(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={40}
                  className={`${
                    star <= (waitingTimeHover || waitingTimeRating)
                      ? "fill-cyan-400 text-cyan-400"
                      : "text-cyan-400"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Additional Feedback Text */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Additional Comments (Optional)
          </h3>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Share your experience with the doctor and hospital..."
            className="w-full min-h-32 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none text-gray-700"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Share your detailed experience
            </p>
            <p className="text-xs text-gray-400">{feedbackText.length}/500</p>
          </div>
        </div>

        {/* Would you recommend */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Would you recommend{" "}
            <span className="">{currentAppointment.doctorName}</span> to your
            friends?
          </h3>
          <div className="flex gap-6">
            <button
              onClick={() => setWouldRecommend(true)}
              className="flex items-center gap-3 group"
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  wouldRecommend === true
                    ? "border-cyan-500 bg-cyan-500"
                    : "border-gray-300 group-hover:border-cyan-400"
                }`}
              >
                {wouldRecommend === true && (
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                )}
              </div>
              <span
                className={`text-base font-medium ${
                  wouldRecommend === true ? "text-cyan-600" : "text-gray-700"
                }`}
              >
                Yes
              </span>
            </button>

            <button
              onClick={() => setWouldRecommend(false)}
              className="flex items-center gap-3 group"
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  wouldRecommend === false
                    ? "border-gray-400 bg-gray-400"
                    : "border-gray-300 group-hover:border-gray-400"
                }`}
              >
                {wouldRecommend === false && (
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                )}
              </div>
              <span
                className={`text-base font-medium ${
                  wouldRecommend === false ? "text-gray-700" : "text-gray-600"
                }`}
              >
                No
              </span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full py-6 rounded-xl font-bold text-base"
        >
          {existingFeedbackIndex !== null
            ? "Update Feedback"
            : "Submit Feedback"}
        </Button>
      </main>
    </div>
  );
};

export default ConsultingFeedbackPage;
