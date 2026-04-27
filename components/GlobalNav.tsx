"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, LogOut } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

// Pages where we don't show the nav bar
const HIDDEN_PATHS = ["/login", "/register", "/", "/pending"];

export default function GlobalNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (HIDDEN_PATHS.includes(pathname)) return null;

  // Determine home destination based on role
  const homeHref = user?.role === "ADMIN"
    ? "/admin"
    : user?.role === "STUDENT"
    ? "/dashboard"
    : "/";

  const homeLabel = user?.role === "ADMIN"
    ? "Admin Panel"
    : user?.role === "STUDENT"
    ? "Dashboard"
    : "Home";

  return (
    <div className="fixed top-4 left-4 z-[500] flex items-center gap-3">
      <Link
        href={homeHref}
        className="group flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-zinc-950/80 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-2xl hover:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all duration-300"
      >
        <Home
          size={16}
          className="text-slate-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
        />
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {homeLabel}
        </span>
      </Link>

      <ThemeSwitcher />

      {user && (
        <>
          <Link
            href="/profile"
            className="group flex items-center justify-center w-10 h-10 bg-white/90 dark:bg-zinc-950/80 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-2xl hover:border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all duration-300"
            title="Profile"
          >
            <User
              size={16}
              className="text-slate-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
            />
          </Link>
          <button
            onClick={() => logout()}
            className="group flex items-center justify-center w-10 h-10 bg-white/90 dark:bg-zinc-950/80 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-2xl hover:border-red-500/40 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all duration-300"
            title="Log out"
          >
            <LogOut
              size={16}
              className="text-slate-400 dark:text-zinc-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
            />
          </button>
        </>
      )}
    </div>
  );
}
