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

  // const getDoctorData = (doctorId: string) => {
  //   setLoading(true);
  //   try {
  //     const res = await getDoctorById(doctorId);
  //     // console.log("response: ", res);
  //     if (res && res.doctor) {
  //       setDoctor(res.doctor);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch doctor data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Load user/doctor from localStorage when the app starts
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("userRole");

    if (storedUserId && storedRole) {
      if (storedRole === "doctor") {
        console.log("getting doctor data in context");
        getDoctorById(storedUserId).then((doctorData) => {
          if (doctorData && doctorData.doctor) {
            setDoctor(doctorData.doctor);
          }
          setLoading(false);
        });
      } else {
        getUserById(storedUserId)
          .then((userData) => {
            if (userData && userData.data) {
              setUser(userData.data);
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error("Failed to fetch user data:", error);
            setLoading(false);
          });
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Function to log in user/doctor
  const login = async (userId: string, role: "user" | "doctor") => {
    try {
      if (role === "doctor") {
        const fetchedDoctor = await getDoctorById(userId);
        if (fetchedDoctor && fetchedDoctor.data) {
          setDoctor(fetchedDoctor.data);
          localStorage.setItem("userId", userId);
          localStorage.setItem("userRole", "doctor");
        }
      } else {
        const fetchedUser = await getUserById(userId);
        if (fetchedUser && fetchedUser.data) {
          setUser(fetchedUser.data);
          localStorage.setItem("userId", userId);
          localStorage.setItem("userRole", "user");
        }
      }
    } catch (error) {
      console.error("Failed to log in:", error);
      throw error;
    }
  };

  // Function to log out user/doctor
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

// ✅ Custom hook for easier usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
