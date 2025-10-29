"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Filter, Search, Calendar } from "lucide-react";
import { format } from "date-fns";
import mockData from "@/lib/mockData.json";

// --- Type Definitions ---
type FeedbackData = {
  appointmentId: number | string;
  doctorName: string;
  consultingRating: number;
  hospitalRating: number;
  waitingTimeRating: number;
  wouldRecommend: boolean | null;
  feedbackText: string;
  submittedAt: string;
};

type ReviewDisplay = {
  id: string;
  appointmentId: number | string;
  patientName: string;
  rating: number;
  consultingRating: number;
  hospitalRating: number;
  waitingTimeRating: number;
  wouldRecommend: boolean | null;
  comment: string;
  feedbackText: string;
  date: string;
};

type FilterType = "All" | "5 Star" | "4 Star" | "3 Star" | "2 Star" | "1 Star";

export default function DoctorReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewDisplay[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorName, setDoctorName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const STORAGE_KEY = "appointments";
  const FEEDBACK_KEY = "appointmentFeedback";

  const filters: FilterType[] = [
    "All",
    "5 Star",
    "4 Star",
    "3 Star",
    "2 Star",
    "1 Star",
  ];

  // Calculate average rating
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  // Load reviews from localStorage
  const loadReviews = (doctorName: string) => {
    try {
      const feedbackStr = localStorage.getItem(FEEDBACK_KEY);
      if (!feedbackStr) {
        setReviews([]);
        setFilteredReviews([]);
        return;
      }

      const allFeedback: FeedbackData[] = JSON.parse(feedbackStr);

      // Filter feedback for this doctor
      const doctorFeedback = allFeedback.filter(
        (feedback) =>
          feedback.doctorName?.trim().toLowerCase() ===
          doctorName.trim().toLowerCase()
      );

      // Get appointments to find patient names
      const appointmentsStr = localStorage.getItem(STORAGE_KEY);
      let appointments: any[] = [];
      if (appointmentsStr) {
        const parsed = JSON.parse(appointmentsStr);
        appointments = Array.isArray(parsed) ? parsed : [parsed];
      }

      // Transform feedback to review format
      const reviewsData: ReviewDisplay[] = doctorFeedback
        .map((feedback) => {
          const appointment = appointments.find(
            (apt) => apt.id === feedback.appointmentId
          );

          const patientName =
            appointment?.patientDetails?.fullName || "Anonymous Patient";

          const userFeedbackText = feedback.feedbackText?.trim() || "";

          let generatedComment = "";
          const avgRating =
            (feedback.consultingRating +
              feedback.hospitalRating +
              feedback.waitingTimeRating) /
            3;

          return {
            id: `${feedback.appointmentId}-${feedback.submittedAt}`,
            appointmentId: feedback.appointmentId,
            patientName,
            rating: Math.round(avgRating),
            consultingRating: feedback.consultingRating,
            hospitalRating: feedback.hospitalRating,
            waitingTimeRating: feedback.waitingTimeRating,
            wouldRecommend: feedback.wouldRecommend,
            comment: generatedComment,
            feedbackText: feedback.feedbackText,
            date: feedback.submittedAt,
          };
        })
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      setReviews(reviewsData);
      setFilteredReviews(reviewsData);
    } catch (e) {
      console.error("Error loading reviews:", e);
      setReviews([]);
      setFilteredReviews([]);
    }
  };

  // Filter reviews based on active filter and search
  useEffect(() => {
    let filtered = [...reviews];

    // Apply star filter
    if (activeFilter !== "All") {
      const starRating = parseInt(activeFilter.charAt(0));
      filtered = filtered.filter((review) => review.rating === starRating);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.patientName.toLowerCase().includes(query) ||
          review.feedbackText.toLowerCase().includes(query) ||
          review.comment.toLowerCase().includes(query)
      );
    }

    setFilteredReviews(filtered);
  }, [activeFilter, searchQuery, reviews]);

  // Load data on mount
  useEffect(() => {
    const userString = localStorage.getItem("user");
    const expiryString = localStorage.getItem("userExpiry");
    const expiry = expiryString ? Number(expiryString) : 0;

    if (userString && expiry && Date.now() < expiry) {
      try {
        const userData = JSON.parse(userString);
        if (userData && userData.type === "doctor" && userData.name) {
          setDoctorName(userData.name);
          loadReviews(userData.name);
        } else {
          router.push("/doctor/login");
        }
      } catch (e) {
        console.error("Error parsing user data", e);
        router.push("/doctor/login");
      }
    } else {
      router.push("/doctor/login");
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  const averageRating = calculateAverageRating();
  const ratingDistribution = getRatingDistribution();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/doctor/dashboard")}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Patient Reviews
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{doctorName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Average Rating Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Average Rating</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {averageRating}
                </span>
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-sm text-gray-500">
                Based on {reviews.length} review
                {reviews.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 md:col-span-2">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Rating Distribution
            </p>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  ratingDistribution[star as keyof typeof ratingDistribution];
                const percentage =
                  reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-12">
                      {star} Star
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews by patient name or feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === filter
                      ? "bg-cyan-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {review.patientName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {review.rating}.0
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      {format(new Date(review.date), "PP")}
                    </div>
                    {review.wouldRecommend && (
                      <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                        Would Recommend
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {review.feedbackText || review.comment}
                </p>

                {/* Detailed Ratings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Consulting</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={`${
                            i < review.consultingRating
                              ? "text-cyan-400 fill-cyan-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">
                        {review.consultingRating}/5
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Hospital/Clinic
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={`${
                            i < review.hospitalRating
                              ? "text-cyan-400 fill-cyan-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">
                        {review.hospitalRating}/5
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Waiting Time</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={`${
                            i < review.waitingTimeRating
                              ? "text-cyan-400 fill-cyan-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">
                        {review.waitingTimeRating}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-32 h-32 mb-6 opacity-50">
              <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="100" cy="100" r="80" fill="#E5E7EB" />
                <path
                  d="M70 85 L80 95 L70 105 M130 85 L120 95 L130 105 M75 130 Q100 150 125 130"
                  stroke="#9CA3AF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {searchQuery || activeFilter !== "All"
                ? "No reviews match your filters"
                : "No reviews yet"}
            </p>
            <p className="text-sm text-gray-500 text-center max-w-md">
              {searchQuery || activeFilter !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Patient reviews will appear here once they submit feedback"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
