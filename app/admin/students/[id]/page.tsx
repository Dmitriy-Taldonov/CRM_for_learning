"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, BookOpen, Clock, Activity, Award, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function StudentDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      const res = await fetch(`/api/admin/students/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch student data", error);
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

  const { user, stats, courses, activity } = data;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans pb-24">
        <div className="max-w-6xl mx-auto px-6 py-12">
          
          <div className="flex items-center gap-4 mb-12">
            <Link href="/admin/students" className="p-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm border border-zinc-300 dark:border-white/10 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-all shadow-sm">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Employee Profile</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{user.email.split('@')[0]}</h1>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{user.email}</div>
              <div className="text-xs text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mt-1">Dep: {user.department}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="p-6 bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-3xl">
              <div className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Award size={14}/> Overall Progress</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.overallProgress}%</div>
            </div>
            <div className="p-6 bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-3xl">
              <div className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2"><BookOpen size={14}/> Completed Courses</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.coursesCompleted} <span className="text-sm text-slate-500 dark:text-zinc-500 dark:text-zinc-500">/ {stats.coursesEnrolled}</span></div>
            </div>
            <div className="p-6 bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-3xl">
              <div className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={14}/> Total Time Spent</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{formatTime(stats.totalTimeSpent)}</div>
            </div>
            <div className="p-6 bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-3xl">
              <div className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={14}/> Last Active</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Enrolled Courses</h2>
              {courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.map((course: any) => (
                    <div key={course.id} className="p-6 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none border border-zinc-200 dark:border-white/5 rounded-3xl shadow-xl flex items-center justify-between group">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-2">{course.title}</h3>
                        <div className="flex items-center gap-6 text-xs font-medium text-slate-500 dark:text-zinc-500 dark:text-zinc-500">
                           <span className="flex items-center gap-1"><BookOpen size={12}/> {course.completedLessons}/{course.totalLessons} Lessons</span>
                           <span className="flex items-center gap-1"><Clock size={12}/> {formatTime(course.timeSpent)} spent</span>
                        </div>
                        <div className="mt-4 h-1.5 w-full bg-white dark:bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${course.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-8 text-right">
                         <div className={`text-2xl font-black ${course.isCompleted ? 'text-emerald-400' : 'text-indigo-400'}`}>{course.progress}%</div>
                         <div className="text-[10px] text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mt-1">Progress</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none border border-zinc-200 dark:border-white/5 rounded-3xl">
                  <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500">Not enrolled in any courses yet.</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Recent Activity</h2>
              <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none border border-zinc-200 dark:border-white/5 rounded-3xl shadow-xl">
                {activity.length > 0 ? (
                  <div className="space-y-6">
                    {activity.map((log: any) => (
                      <div key={log.id} className="relative pl-6 border-l border-zinc-300 dark:border-white/10">
                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[#0a0a0a]" />
                        <div className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{log.action}</div>
                        <div className="text-xs text-slate-500 dark:text-zinc-500 dark:text-zinc-500 mt-1">{new Date(log.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-center text-sm py-8">No activity recorded yet.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
