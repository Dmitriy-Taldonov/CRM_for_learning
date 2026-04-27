"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

export default function CourseCatalog() {
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

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-100 dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter">
            ANTIGRAVITY <span className="text-indigo-500">LMS</span>
          </Link>
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <div className="flex gap-4">
              <Link href="/login" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-colors">
                {t.common.login}
              </Link>
              <Link href="/register" className="text-sm font-medium text-slate-900 dark:text-white bg-indigo-600 px-4 py-1.5 rounded-lg hover:bg-indigo-500 transition-colors">
                {t.dashboard.getStarted}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.catalog.title}</h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
            {t.catalog.subtitle}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-zinc-900/40 rounded-3xl h-80 animate-pulse border border-zinc-900" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group flex flex-col bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 overflow-hidden hover:border-indigo-500/50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700">
                  {course.thumbnailUrl ? (
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 font-bold text-2xl">
                      LMS
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 mb-6">
                    {course.description || t.admin.noDescription}
                  </p>
                  <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest italic">
                      {t.catalog.viewCourse}
                    </span>
                    <span className="text-zinc-600 text-[10px] items-center flex gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.catalog.selfPaced}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && courses.length === 0 && (
          <div className="text-center py-24">
            <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 italic">{t.catalog.noCourses}</p>
          </div>
        )}
      </main>
    </div>
  );
}
