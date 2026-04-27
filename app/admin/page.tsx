"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Users, Layout, Plus, ShieldAlert } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCourse = async () => {
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        body: JSON.stringify({ title: "New Course" }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create course");
        return;
      }
      setCourses([data, ...courses]);
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm(t.admin.deleteCourseConfirm)) return;
    try {
      await fetch(`/api/courses/${id}`, { method: "DELETE" });
      setCourses(courses.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-zinc-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent dark:from-indigo-500/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative">
          {/* Language Switcher */}
          <div className="absolute top-12 right-6 md:top-20">
            <LanguageSwitcher />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
            <div className="space-y-4">
               <div className="px-3 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full w-fit shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">{t.admin.commandCenter}</span>
               </div>
               <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                 {t.admin.systemOverview.split(' ')[0]} <span className="text-indigo-600 dark:text-zinc-500">{t.admin.systemOverview.split(' ').slice(1).join(' ')}</span>
               </h1>
               <p className="text-slate-500 dark:text-zinc-500 text-lg font-medium max-w-xl">
                 {t.admin.adminWelcome}
               </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/admin/access"
                className="px-6 py-4 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-[28px] text-amber-500 font-black text-sm uppercase tracking-widest transition-all shadow-2xl backdrop-blur-md flex items-center gap-3 active:scale-95"
              >
                <ShieldAlert size={20} /> {t.admin.accessRequests}
              </Link>
              <Link
                href="/admin/analytics"
                className="px-6 py-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[28px] text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-slate-200/50 dark:shadow-2xl backdrop-blur-md flex items-center gap-3 active:scale-95 hover:-translate-y-1"
              >
                <Layout size={20} /> {t.admin.analytics}
              </Link>
              <Link
                href="/admin/students"
                className="px-6 py-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[28px] text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-slate-200/50 dark:shadow-2xl backdrop-blur-md flex items-center gap-3 active:scale-95 hover:-translate-y-1"
              >
                <Users size={20} /> {t.admin.studentDbBtn}
              </Link>
              <button
                onClick={createCourse}
                className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white rounded-[28px] font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/20 flex items-center gap-3 active:scale-95"
              >
                <Plus size={20} /> {t.admin.newCourseBtn}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-[40px] shadow-xl shadow-slate-200/50 dark:shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10" />
               <h2 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Layout size={14} className="text-indigo-500" /> {t.admin.activeCurriculum}
               </h2>
               <div className="text-5xl font-black text-slate-900 dark:text-white mb-2">{courses.length}</div>
               <p className="text-slate-500 dark:text-zinc-500 text-sm font-medium">{t.admin.coursesManaged}</p>
            </div>
          </div>

          <div className="mt-20">
             <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-10 px-4">{t.admin.manageCatalog}</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-white dark:bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-200 dark:border-zinc-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group relative bg-white dark:bg-zinc-900/50 rounded-[32px] border border-slate-200 dark:border-zinc-800 p-8 hover:border-indigo-500/50 transition-all shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                >
                  <div className="flex flex-col h-full">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 flex-1">
                      {course.description || t.admin.noDescription}
                    </p>
                    <div className="mt-6 flex gap-3">
                      <Link
                        href={`/admin/course-builder/${course.id}`}
                        className="flex-1 text-center py-2 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 hover:bg-zinc-700 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors border border-zinc-700"
                      >
                        {t.admin.editCourse}
                      </Link>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/20"
                      >
                        {t.common.delete}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && courses.length === 0 && (
            <div className="text-center py-24 bg-white dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500">{t.admin.noCoursesYet}</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
