// src/hooks/useGoogleCalendar.ts
import { useCallback, useState } from "react";
import { Appointment } from "@/lib/types/appointment";
import { Doctor } from "@/lib/types/doctor";
import { User } from "@/lib/types/user";

interface UseGoogleCalendarProps {
  appointment: Appointment;
  doctor: Doctor;
  patient: User;
}

export const useGoogleCalendar = ({
  appointment,
  doctor,
  patient,
}: UseGoogleCalendarProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [eventLink, setEventLink] = useState<string | null>(null);

  const addToCalendar = useCallback(async () => {
    setIsLoading(true);

    try {
      // Validate required data before sending request
      if (!appointment || !doctor || !patient) {
        throw new Error(
          "Missing required data: appointment, doctor, or patient"
        );
      }

      if (!appointment.date || !appointment.time || !appointment.id) {
        throw new Error(
          "Missing required appointment fields: date, time, or id"
        );
      }

      if (!doctor.firstName || !doctor.lastName || !doctor.specialty) {
        throw new Error(
          "Missing required doctor fields: firstName, lastName, or specialty"
        );
      }

      if (!patient.firstName || !patient.lastName) {
        throw new Error(
          "Missing required patient fields: firstName or lastName"
        );
      }

      // Call the real API endpoint
      const response = await fetch("/api/add-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointment,
          doctor,
          patient,
        }),
      });

      // Check if response is HTML (likely a redirect to signin page)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        // Handle unauthorized access by initiating auth flow
        return {
          success: false,
          message: "Authentication required",
          requiresAuth: true,
        };
      }

      // Parse JSON response
      const result = await response.json();
      console.log("API Response:", result);

      if (result.success) {
        // Set the added state to true to indicate success
        setIsAdded(true);
        setEventLink(result.link);
        return {
          success: true,
          message: "Appointment added to Google Calendar successfully!",
          link: result.link,
        };
      } else {
        // Handle unauthorized error by initiating auth flow
        if (response.status === 401) {
          return {
            success: false,
            message: "Unauthorized",
            requiresAuth: true,
          };
        }
        // Handle other API errors
        throw new Error(
          result.error || "Failed to add appointment to calendar"
        );
      }
    } catch (error: any) {
      console.error("Error adding to calendar:", error);

      // If it's a syntax error (likely from trying to parse HTML as JSON),
      // treat it as an auth issue
      if (error instanceof SyntaxError) {
        return {
          success: false,
          message: "Authentication required. Please sign in with Google.",
          requiresAuth: true,
        };
      }

      return {
        success: false,
        message: error.message || "Failed to add appointment to calendar",
      };
    } finally {
      setIsLoading(false);
    }
  }, [appointment, doctor, patient]);

  const initiateAuth = useCallback(() => {
    // Redirect user to Google OAuth flow
    window.location.href = "/api/auth/signin/google";
  }, []);

  return {
    isLoading,
    isAdded,
    eventLink,
    addToCalendar,
    initiateAuth,
  };
};

export default useGoogleCalendar;
