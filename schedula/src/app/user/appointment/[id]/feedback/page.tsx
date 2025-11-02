"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/useToast";
import { Appointment } from "@/lib/types/appointment";
import { DoctorInfoCard } from "@/components/cards/DoctorReview";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAppointmentById } from "@/app/services/appointments.api";
import { Doctor } from "@/lib/types/doctor";
import { updateAppointment } from "@/app/services/appointments.api";

interface FeedbackData {
  consulting: number;
  hospital: number;
  waitingTime: number;
  wouldRecommend: boolean;
  feedbackText: string;
  submittedAt: string;
}

const ConsultingFeedbackPage = () => {
  const { user } = useAuth();
  const params = useParams();
  const apptId = params?.id as string;
  const router = useRouter();
  const [currentAppointment, setCurrentAppointment] =
    useState<Appointment | null>(null);
  const [doctorData, setDoctorData] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [existingFeedbackIndex, setExistingFeedbackIndex] = useState<
    number | null
  >(null);

  // Individual state for each rating
  const [consultingRating, setConsultingRating] = useState(0);
  const [hospitalRating, setHospitalRating] = useState(0);
  const [waitingTimeRating, setWaitingTimeRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | undefined>(
    undefined
  );
  const [feedbackText, setFeedbackText] = useState("");

  // Hover states for star animations
  const [consultingHover, setConsultingHover] = useState(0);
  const [hospitalHover, setHospitalHover] = useState(0);
  const [waitingTimeHover, setWaitingTimeHover] = useState(0);

  const fetchAppointment = async () => {
    setIsLoading(true);
    try {
      const appointment = await getAppointmentById(apptId);
      console.log("appt: ", appointment);
      setCurrentAppointment(appointment);
      setDoctorData(appointment.doctor);

      // Load existing feedback if available
      if (appointment.feedback) {
        setConsultingRating(appointment.feedback.consulting || 0);
        setHospitalRating(appointment.feedback.hospital || 0);
        setWaitingTimeRating(appointment.feedback.waitingTime || 0);
        setWouldRecommend(appointment.feedback.wouldRecommend);
        setFeedbackText(appointment.feedback.feedbackText || "");
        setExistingFeedbackIndex(0); // Mark as existing
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [apptId]);

  const addFeedback = async (feedback: FeedbackData) => {
    setIsLoading(true);
    try {
      const res = await updateAppointment(apptId, { feedback });
      if (res.success) {
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your valuable feedback!",
        });
        router.push("/user/appointment");
      }
    } catch (error) {
      console.error("Error adding feedback:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
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

    if (wouldRecommend === undefined) {
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
      const feedbackFromPatient: FeedbackData = {
        consulting: consultingRating,
        hospital: hospitalRating,
        waitingTime: waitingTimeRating,
        wouldRecommend: wouldRecommend,
        feedbackText: feedbackText || "",
        submittedAt: new Date().toISOString(),
      };

      // Submit feedback
      await addFeedback(feedbackFromPatient);
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
          firstName={doctorData?.firstName || ""}
          lastName={doctorData?.lastName || ""}
          specialty={doctorData?.specialty || ""}
          qualifications={doctorData?.qualifications || "MBBS, MD"}
          imageUrl={doctorData?.image || ""}
        />

        {/* Consulting Time */}
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-base text-gray-700 font-medium">
              Consulting Time
            </span>
            <span className="text-base text-cyan-600 font-semibold">
              {currentAppointment.day} | {currentAppointment.time}
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
                      : "text-gray-300"
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
                      : "text-gray-300"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Waiting Time */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
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
                      : "text-gray-300"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Would you recommend */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Would you recommend{" "}
            <span className="text-cyan-600">
              Dr. {doctorData?.firstName} {doctorData?.lastName}
            </span>{" "}
            to your friends?
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

        {/* Additional Feedback Text */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
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

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-6 rounded-xl font-bold text-base"
        >
          {isLoading
            ? "Submitting..."
            : existingFeedbackIndex !== null
            ? "Update Feedback"
            : "Submit Feedback"}
        </Button>
      </main>
    </div>
  );
};

export default ConsultingFeedbackPage;
