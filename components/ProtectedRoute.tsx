"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "ADMIN" && ((user as any).status === "PENDING" || (user as any).status === "REJECTED")) {
        router.push("/pending");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-100 dark:bg-zinc-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-zinc-600 dark:text-zinc-400 animate-pulse">Loading your experience...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "ADMIN" && (user as any).status !== "ACTIVE")) return null;

  return <>{children}</>;
}
