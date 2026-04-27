"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Clock, ShieldX, LogOut } from "lucide-react";

export default function PendingPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && (user.role === "ADMIN" || (user as any).status === "ACTIVE")) {
      router.push(user.role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-100 dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isPending = (user as any).status === "PENDING";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 dark:bg-[#050505] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none border border-zinc-200 dark:border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden text-center">
        <div className={`absolute top-0 left-0 w-64 h-64 blur-[80px] rounded-full -ml-20 -mt-20 ${isPending ? 'bg-amber-500/10' : 'bg-red-500/10'}`} />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl ${isPending ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {isPending ? <Clock size={40} /> : <ShieldX size={40} />}
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {isPending ? "Access Request Pending" : "Access Denied"}
          </h1>
          
          <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed mb-8">
            {isPending 
              ? "Ваш запрос на доступ отправлен администратору. Ожидайте подтверждения. Мы уведомим вас, когда доступ будет открыт." 
              : "К сожалению, ваш запрос на доступ был отклонен администратором. Если вы считаете, что это ошибка, обратитесь в поддержку."}
          </p>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm hover:bg-zinc-100 dark:bg-white/[0.05] border border-zinc-300 dark:border-white/10 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold transition-all w-full justify-center"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
