"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, Check, X, ShieldAlert, Clock, User as UserIcon, Eye } from "lucide-react";
import Link from "next/link";

export default function AccessRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/access");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (userId: string, status: "ACTIVE" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/access", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      if (res.ok) {
        setRequests(requests.filter(r => r.id !== userId));
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans pb-24">
        <div className="max-w-5xl mx-auto px-6 py-12">
          
          <div className="flex items-center gap-4 mb-12">
            <Link href="/admin" className="p-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm border border-zinc-300 dark:border-white/10 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-all shadow-sm">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-2">
                <ShieldAlert size={12} className="text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Access Control</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Access Requests</h1>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-[40px] border border-zinc-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -ml-20 -mt-20" />
            
            <div className="p-8 relative z-10">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-zinc-100/50 dark:bg-white/[0.02] hover:bg-[#f8fafc] dark:bg-zinc-950 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/5 rounded-3xl transition-all gap-6">
                      <div className="flex items-center gap-4">
                        {req.avatarUrl ? (
                          <img src={req.avatarUrl} alt={req.name} className="w-12 h-12 rounded-2xl object-cover border border-zinc-300 dark:border-white/10 shadow-xl" />
                        ) : (
                          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/20">
                            <UserIcon size={20} />
                          </div>
                        )}
                        <div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">{req.name || "Unknown Name"}</div>
                          <div className="text-sm font-medium text-slate-500 dark:text-zinc-500 dark:text-zinc-500 mb-1">{req.email}</div>
                          <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">
                            Requested {new Date(req.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setSelectedUser(req)}
                          className="flex items-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-300 dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-white/10 rounded-xl text-sm font-black transition-all"
                        >
                          <Eye size={16} /> View Profile
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, "REJECTED")}
                          className="flex items-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-black transition-all"
                        >
                          <X size={16} /> Reject
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, "ACTIVE")}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-black transition-all shadow-xl shadow-emerald-500/20"
                        >
                          <Check size={16} /> Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className="w-16 h-16 bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert size={24} className="text-zinc-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No pending requests</h3>
                  <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-sm">All access requests have been processed.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none border border-zinc-300 dark:border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-slate-900 dark:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              {selectedUser.avatarUrl ? (
                <img src={selectedUser.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover mb-6 border-4 border-zinc-200 dark:border-white/5" />
              ) : (
                <div className="w-24 h-24 bg-zinc-200 dark:bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 border-4 border-zinc-200 dark:border-white/5">
                  <UserIcon size={40} className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500" />
                </div>
              )}
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{selectedUser.name || "Unknown"}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">{selectedUser.email}</p>
              
              <div className="w-full grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-200 dark:bg-black/5 dark:bg-white/5 rounded-2xl p-4 text-center">
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest mb-1">Status</div>
                  <div className="text-amber-400 font-black uppercase text-sm">{selectedUser.status}</div>
                </div>
                <div className="bg-zinc-200 dark:bg-black/5 dark:bg-white/5 rounded-2xl p-4 text-center">
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest mb-1">Signed Up</div>
                  <div className="text-slate-900 dark:text-white font-black text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                </div>
                {selectedUser.googleId && (
                  <div className="col-span-2 bg-indigo-500/10 rounded-2xl p-4 text-center border border-indigo-500/20">
                    <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Authentication</div>
                    <div className="text-indigo-300 font-black text-sm flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                        <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                        <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                        <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                        <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                      </svg>
                      Verified via Google
                    </div>
                  </div>
                )}
              </div>

              <div className="flex w-full gap-3">
                <button 
                  onClick={() => {
                    handleAction(selectedUser.id, "REJECTED");
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-black transition-all"
                >
                  Reject
                </button>
                <button 
                  onClick={() => {
                    handleAction(selectedUser.id, "ACTIVE");
                    setSelectedUser(null);
                  }}
                  className="flex-[2] py-4 bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl font-black transition-all shadow-xl shadow-emerald-500/20"
                >
                  Approve Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
