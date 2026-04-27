"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";
import { ArrowLeft, Users, TrendingUp, BookOpen, Clock, Activity, Award, AlertTriangle, Download, Settings } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function AnalyticsDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 dark:bg-[#050505] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans pb-24">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 py-12 relative">
          <div className="absolute top-12 right-6">
            <LanguageSwitcher />
          </div>

          <div className="flex items-center gap-4 mb-12">
            <Link href="/admin" className="p-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm border border-zinc-300 dark:border-white/10 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-all shadow-sm">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-2">
                <Activity size={12} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Live Analytics</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">System Intelligence</h1>
            </div>
            
            <div className="ml-auto flex gap-3">
              <a href="/api/admin/export?type=students" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-black text-slate-900 dark:text-white transition-all shadow-lg shadow-indigo-600/20">
                <Download size={16} /> Export
              </a>
            </div>
          </div>

          {/* 1. General Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="p-6 bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full -mr-10 -mt-10" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 dark:text-zinc-500">Total Employees</h3>
                <Users size={18} className="text-blue-400" />
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{data.general.totalStudents}</div>
              <div className="mt-2 text-xs font-medium text-slate-500 dark:text-zinc-500 dark:text-zinc-500"><span className="text-emerald-400">+{data.general.active30Days} active</span> this month</div>
            </div>

            <div className="p-6 bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -mr-10 -mt-10" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 dark:text-zinc-500">Avg Progress</h3>
                <TrendingUp size={18} className="text-indigo-400" />
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{data.general.averageProgress}%</div>
              <div className="mt-2 text-xs font-medium text-slate-500 dark:text-zinc-500 dark:text-zinc-500">Across all active courses</div>
            </div>

            <div className="p-6 bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full -mr-10 -mt-10" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 dark:text-zinc-500">Completion Rate</h3>
                <Award size={18} className="text-emerald-400" />
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{data.general.courseCompletionRate}%</div>
              <div className="mt-2 text-xs font-medium text-slate-500 dark:text-zinc-500 dark:text-zinc-500">Fully completed courses</div>
            </div>

            <div className="p-6 bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full -mr-10 -mt-10" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 dark:text-zinc-500">Active 7 Days</h3>
                <Activity size={18} className="text-orange-400" />
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{data.general.active7Days}</div>
              <div className="mt-2 text-xs font-medium text-slate-500 dark:text-zinc-500 dark:text-zinc-500">Unique user logins</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* 2. Progress Chart */}
            <div className="lg:col-span-2 p-8 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none border border-zinc-200 dark:border-white/5 rounded-[32px] shadow-2xl relative">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <Activity size={20} className="text-indigo-500" /> Activity Over Time
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.activityGraph} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Problematic Employees */}
            <div className="p-8 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none border border-red-500/20 rounded-[32px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full -mr-20 -mt-20" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                <AlertTriangle size={20} className="text-red-500" /> Needs Attention
              </h2>
              
              {data.employees.lagging.length > 0 ? (
                <div className="space-y-4 relative z-10">
                  {data.employees.lagging.map((emp: any) => (
                    <div key={emp.id} className="flex items-center justify-between p-4 bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-2xl">
                      <div>
                        <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{emp.email.split('@')[0]}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">{emp.completedLessons}/{emp.totalLessons} lessons</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-red-400 text-sm">{emp.progress}%</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Progress</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 relative z-10">
                  <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-sm font-medium">All students are on track!</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Employees */}
            <div className="p-8 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none border border-zinc-200 dark:border-white/5 rounded-[32px] shadow-2xl">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Award size={20} className="text-emerald-500" /> Top Performers
              </h2>
              <div className="space-y-4">
                {data.employees.top.map((emp: any, index: number) => (
                  <Link href={`/admin/students`} key={emp.id} className="group flex items-center justify-between p-4 bg-zinc-100/50 dark:bg-white/[0.02] hover:bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/5 hover:border-emerald-500/30 rounded-2xl transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center font-black text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{emp.email.split('@')[0]}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">{emp.completedCount} courses done</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-400 text-sm">{emp.progress}%</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Avg Progress</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Course Analytics */}
            <div className="p-8 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none border border-zinc-200 dark:border-white/5 rounded-[32px] shadow-2xl">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <BookOpen size={20} className="text-blue-500" /> Most Popular Courses
              </h2>
              <div className="space-y-4">
                {data.courses.popular.map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between p-4 bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-2xl">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200 truncate">{course.title}</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">{course.enrollmentCount} Enrollments</div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="text-right">
                        <div className="font-black text-blue-400 text-sm">{course.completionRate}%</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Completion</div>
                      </div>
                      <div className="h-8 w-px bg-black/10 dark:bg-white/10" />
                      <div className="text-right">
                        <div className="font-black text-zinc-700 dark:text-zinc-300 text-sm">{course.engagementScore}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Engagement</div>
                      </div>
                    </div>
                  </div>
                ))}
                {data.courses.popular.length === 0 && (
                  <p className="text-center text-slate-500 dark:text-zinc-500 dark:text-zinc-500 py-8 text-sm">No courses enrolled yet.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
