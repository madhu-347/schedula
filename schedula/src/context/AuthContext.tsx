"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/lib/types/user";
import { Doctor } from "@/lib/types/doctor";
import { getUserById } from "@/app/services/user.api";
import { getDoctorById } from "@/app/services/doctor.api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  doctor: Doctor | null;
  loading: boolean;
  login: (userId: string, role: "user" | "doctor") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract a safe ID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeId = (data: Record<string, any>, fallbackId: string): string => {
    return (
      data?.id ??
      data?._id ??
      data?.patientId ??
      data?.doctorId ??
      fallbackId
    );
  };

  // Load from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("userRole");

    const initialize = async () => {
      if (!storedUserId || !storedRole) {
        setLoading(false);
        return;
      }

      try {
        if (storedRole === "doctor") {
          const response = await getDoctorById(storedUserId);
          const doctorData: Doctor =
            response?.data?.doctor ??
            response?.doctor ??
            response?.data ??
            response;

          if (doctorData) {
            const normalizedDoctor: Doctor = {
              ...doctorData,
              id: normalizeId(doctorData, storedUserId),
            };
            setDoctor(normalizedDoctor);
          }
        } else {
          const response = await getUserById(storedUserId);
          // Unwrap only `.data` if it exists
          const userData: User = response?.data ?? response;

          if (userData) {
            const normalizedUser: User = {
              ...userData,
              id: normalizeId(userData, storedUserId),
            };
            setUser(normalizedUser);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth context:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Login
  const login = async (userId: string, role: "user" | "doctor") => {
    try {
      if (role === "doctor") {
        const response = await getDoctorById(userId);
        const doctorData: Doctor =
          response?.data?.doctor ??
          response?.doctor ??
          response?.data ??
          response;

        if (doctorData) {
          const normalizedDoctor: Doctor = {
            ...doctorData,
            id: normalizeId(doctorData, userId),
          };
          setDoctor(normalizedDoctor);
          localStorage.setItem("userId", normalizedDoctor.id);
          localStorage.setItem("userRole", "doctor");
        }
      } else {
        const response = await getUserById(userId);
        const userData: User = response?.data ?? response;

        if (userData) {
          const normalizedUser: User = {
            ...userData,
            id: normalizeId(userData, userId),
          };
          setUser(normalizedUser);
          localStorage.setItem("userId", normalizedUser.id);
          localStorage.setItem("userRole", "user");
        }
      }
    } catch (error) {
      console.error("Failed to log in:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setDoctor(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    router.push("/user/login");
  };

  return (
    <AuthContext.Provider value={{ user, doctor, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
