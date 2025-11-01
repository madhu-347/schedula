"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/lib/types/user";
import { getUserById } from "@/app/services/user.api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage when the app starts
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
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
    } else {
      setLoading(false);
    }
  }, []);

  // Function to log in user
  const login = async (userId: string) => {
    try {
      const fetchedUser = await getUserById(userId);
      if (fetchedUser && fetchedUser.data) {
        setUser(fetchedUser.data);
        localStorage.setItem("userId", userId);
      }
    } catch (error) {
      console.error("Failed to log in user:", error);
      throw error;
    }
  };

  // Function to log out user
  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
    router.push("/user/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
