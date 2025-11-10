"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAppointmentById } from "@/app/services/appointments.api";
import Header from "@/components/Header";

// --- Types ---
type Message = {
  id: number;
  sender: "patient" | "doctor";
  text: string;
  time: string;
};

export default function PatientChatPage() {
  // --- State, Refs, Hooks ---
  const router = useRouter();
  const params = useParams();
  const appointmentId = params?.id as string;
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "doctor",
      text: "Hi, I'm sorry to hear that you're not feeling well. Here are some immediate things you can try...",
      time: "16:00",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointment = async () => {
      if (appointmentId) {
        try {
          const appointmentData = await getAppointmentById(appointmentId);
          setAppointment(appointmentData);
        } catch (error) {
          console.error("Failed to fetch appointment:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  // Auto-scroll effect
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle message sending
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;
    const newMessage: Message = {
      id: messages.length + 1,
      sender: "patient",
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
    setMessages([...messages, newMessage]);
    setInputMessage("");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  // Show error if no appointment found
  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Appointment Not Found
          </h3>
          <p className="text-gray-500 mb-6">
            We couldn't find the appointment you're looking for.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --- Render UI ---
  return (
    // Main container uses flex-col, allows full height
    <main className="min-h-screen bg-gray-100 flex flex-col h-screen pb-20">
      {/* 1. Header (Sticky) */}
      <header className="sticky top-0 z-10 w-full shrink-0">
        {/* Use max-w-6xl for wider layout */}
        <div className="flex items-center p-2 max-w-6xl mx-auto w-full">
          <button
            onClick={() => router.back()}
            className="p-2 ml-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-4 text-gray-800">Patient Chat</h1>
        </div>
      </header>
      {/* 2. Main Content Area (Uses Flexbox for Columns on Medium+ screens) */}
      {/* Added md:flex-row for columns, gap, wider max-w */}
      <div className="flex-1 overflow-hidden w-full pb-5 flex flex-col md:flex-row md:gap-4 max-w-6xl mx-auto">
        {/* --- LEFT COLUMN (Patient Details) --- */}
        {/* Takes full width on mobile, half width on desktop */}
        <div className="w-full md:w-1/2 shrink-0 mb-4 md:mb-0">
          <div className="bg-white rounded-xl shadow-lg p-4 h-full sticky top-20">
            {" "}
            {/* Made patient info sticky */}
            <h3 className="font-bold text-sm mb-3 text-gray-800">
              Full Name:{" "}
              <span className="font-medium text-gray-900">
                {appointment.patientDetails?.fullName || "N/A"}
              </span>
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4 text-left border-b border-gray-100 pb-4">
              {/* Age/Weight/Relation */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Age</p>
                <p className="text-md font-semibold text-gray-900">
                  {appointment.patientDetails?.age || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Weight</p>
                <p className="text-md font-semibold text-gray-900">
                  {appointment.patientDetails?.weight || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Relation</p>
                <p className="text-md font-semibold text-gray-900">
                  {appointment.patientDetails?.relationship || "N/A"}
                </p>
              </div>
            </div>
            <h3 className="font-semibold text-sm mb-1 text-gray-800">
              Problem
            </h3>
            <p className="text-md font-medium text-gray-900 mb-3">
              {appointment.patientDetails?.problem ||
                "No problem description provided"}
            </p>
            <h3 className="font-semibold text-sm mb-1 text-gray-800">Mobile</h3>
            <p className="text-md font-medium text-cyan-600">
              {appointment.patientDetails?.phone || "N/A"}
            </p>
          </div>
        </div>
        {/* --- RIGHT COLUMN (Doctor + Chat) --- */}
        {/* Takes remaining space on desktop, half width */}
        <div className="w-full md:w-1/2 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden h-full">
          {/* Doctor Info (Fixed height) */}
          {/* ADJUSTED: Reduced padding on small screens (p-3 md:p-4) */}
          <div className="p-3 md:p-4 border-b border-gray-100 flex items-center shrink-0">
            {/* Adjusted image size for mobile */}
            <div className="rounded-full w-12 h-12 md:w-16 md:h-16 bg-cyan-100 mr-3 md:mr-4 flex items-center justify-center">
              <span className="text-cyan-800 font-bold text-lg">
                {appointment.doctor?.firstName?.charAt(0)}
                {appointment.doctor?.lastName?.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="font-bold text-md md:text-lg text-gray-900">
                Dr. {appointment.doctor?.firstName}{" "}
                {appointment.doctor?.lastName}
              </h2>{" "}
              {/* Adjusted size */}
              <p className="text-xs md:text-sm text-cyan-600">
                {appointment.doctor?.specialty || "Doctor"}
              </p>{" "}
              {/* Adjusted size */}
              <p className="text-xs text-gray-500">
                {appointment.doctor?.qualifications || "Medical Professional"}
              </p>
            </div>
          </div>

          {/* Session Start Marker (Fixed height) */}
          {/* ADJUSTED: Reduced vertical margin (my-1 md:my-2) */}
          <div className="text-center my-1 md:my-2 shrink-0">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full shadow-sm">
              Session Start
            </span>
          </div>

          {/* Chat Messages (Scrollable Area) */}
          {/* ADJUSTED: Reduced padding (px-3 md:px-4) */}
          <div
            ref={chatContainerRef}
            className="space-y-3 md:space-y-4 px-3 md:px-4 pb-4 grow overflow-y-auto"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "patient" ? "justify-end" : "justify-start"
                }`}
              >
                {/* ADJUSTED: Reduced padding inside bubbles (p-2 md:p-3) */}
                <div
                  className={`max-w-[80%] p-2 md:p-3 rounded-xl ${
                    message.sender === "patient"
                      ? "bg-cyan-500 text-white rounded-br-none shadow-md"
                      : "bg-gray-100 text-gray-800 rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>{" "}
                  {/* Ensure consistent text size */}
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "patient"
                        ? "text-cyan-100 text-right"
                        : "text-gray-500 text-right"
                    }`}
                  >
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* Scroll target */}
          </div>

          {/* Chat Input Area */}
          {/* ADJUSTED: Reduced padding (p-2 md:p-3) */}
          <div className="p-2 md:p-3 bg-white border-t border-gray-100 flex-shrink-0 shadow-inner">
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              {/* ADJUSTED: Reduced padding/size (py-2 text-sm) */}
              <input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-gray-50 text-sm"
                required
              />
              {/* ADJUSTED: Reduced padding/size (p-2) */}
              <button
                type="submit"
                className="p-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 disabled:bg-gray-300 transition-colors flex-shrink-0"
                disabled={inputMessage.trim() === ""}
              >
                <Send size={20} /> {/* Kept size */}
              </button>
            </form>
          </div>
        </div>{" "}
        {/* End Right Column */}
      </div>{" "}
      {/* End Main Content Area */}
    </main> // End Main Tag
  );
}
