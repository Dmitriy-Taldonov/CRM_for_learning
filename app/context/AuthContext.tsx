"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  role: "ADMIN" | "STUDENT";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  googleLogin: (profile: any) => Promise<void>;
  register: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: any) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      router.push(data.user.status === "ACTIVE" || data.user.role === "ADMIN"
        ? (data.user.role === "ADMIN" ? "/admin" : "/dashboard") 
        : "/pending");
    } else {
      throw new Error(data.error || "Login failed");
    }
  };

  const googleLogin = async (profile: any) => {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(profile),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      router.push(data.user.status === "ACTIVE" || data.user.role === "ADMIN"
        ? (data.user.role === "ADMIN" ? "/admin" : "/dashboard") 
        : "/pending");
    } else {
      throw new Error(data.error || "Google login failed");
    }
  };

  const register = async (credentials: any) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/login");
    } else {
      throw new Error(data.error || "Registration failed");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
