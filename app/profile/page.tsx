"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { User, Lock, Save, ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState({
    name: "",
    avatarUrl: "",
    password: "",
    email: "",
    role: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile({
          ...profile,
          name: data.name || "",
          avatarUrl: data.avatarUrl || "",
          email: data.email,
          role: data.role,
        });
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          ...(profile.password ? { password: profile.password } : {})
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update profile");
      }

      setMessage("Profile updated successfully!");
      setProfile({ ...profile, password: "" }); // Clear password field
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const goBackHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans py-12 px-6">
        <div className="max-w-3xl mx-auto">
          
          <div className="flex items-center gap-4 mb-12">
            <Link href={goBackHref} className="p-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm border border-zinc-300 dark:border-white/10 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-all shadow-sm">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Your Profile</h1>
              <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 font-medium mt-2">Manage your account settings</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none p-8 md:p-12 rounded-[40px] border border-zinc-200 dark:border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-20 -mt-20" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-500/20 bg-white dark:bg-zinc-900 overflow-hidden relative group/avatar cursor-pointer">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={48} className="text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                     <Camera size={24} className="text-slate-900 dark:text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{profile.role}</div>
                  <div className="text-xs text-slate-500 dark:text-zinc-500 dark:text-zinc-500">{profile.email}</div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-6">
                {message && (
                  <div className={`p-4 rounded-xl text-sm font-bold border ${message.includes("success") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {message}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-2xl px-5 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="Enter your name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-widest ml-1">Avatar URL</label>
                  <input
                    type="url"
                    className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-2xl px-5 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="https://example.com/avatar.jpg"
                    value={profile.avatarUrl}
                    onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Lock size={12} /> New Password
                  </label>
                  <input
                    type="password"
                    className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-2xl px-5 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none transition-all placeholder:text-zinc-700"
                    placeholder="Leave blank to keep current"
                    value={profile.password}
                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                  />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white rounded-2xl font-black transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
                  >
                    {isSaving ? "Saving..." : <><Save size={20} /> Save Changes</>}
                  </button>
                </div>
              </div>
            </div>
          </form>

        </div>
      </div>
    </ProtectedRoute>
  );
}
