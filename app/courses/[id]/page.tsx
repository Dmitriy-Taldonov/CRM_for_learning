"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { Circle, HelpCircle } from "lucide-react";

export default function CourseDetailPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${id}`);
      const data = await res.json();
      setCourse(data);

      if (user) {
        // Simple check if enrolled (would ideally be an API call or returned with course)
        // For MVP, we'll try to fetch progress for this course
        const progRes = await fetch(`/api/progress?courseId=${id}`);
        if (progRes.ok) {
          // If we can fetch progress, it means there's an enrollment (or at least check API)
          // Simplified for now: just assume we need to check an enrollment API or user state
          // Let's check enrollment specifically
          const resMe = await fetch("/api/auth/me");
          const meData = await resMe.json();
          // We'll trust the enroll button handler for now and just set false initially
        }
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsEnrolling(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        body: JSON.stringify({ courseId: id }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setIsEnrolled(true);
        // Navigate to the first lesson
        const firstLesson = course.modules?.[0]?.lessons?.[0];
        if (firstLesson) {
          router.push(`/courses/${id}/learn/${firstLesson.id}`);
        }
      }
    } catch (error) {
      console.error("Enrollment failed:", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950" />;
  if (!course) return <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center text-slate-900 dark:text-white">Course not found</div>;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Hero Header */}
      <div className="relative h-[400px] overflow-hidden">
        {course.thumbnailUrl && (
          <img 
            src={course.thumbnailUrl} 
            className="w-full h-full object-cover opacity-30 absolute inset-0"
            alt=""
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <Link href="/courses" className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-slate-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
            ← {t.builder.backToCatalog}
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">{course.title}</h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-lg mb-8">{course.description}</p>
          <div className="flex items-center gap-6">
            <button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-indigo-600/20 transition-all hover:scale-105"
            >
              {isEnrolled ? t.dashboard.continueCourse : isEnrolling ? t.common.loading : t.dashboard.startLearning}
            </button>
            <div className="text-sm text-slate-500 dark:text-zinc-500 dark:text-zinc-500 font-medium">
              <span className="text-slate-900 dark:text-white">{course.modules?.length || 0}</span> Modules • 
              <span className="text-slate-900 dark:text-white ml-2">Lifetime access</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t.builder.curriculum}</h2>
            <div className="space-y-4">
              {course.modules?.map((module: any) => (
                <div key={module.id} className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-xs font-mono text-slate-500 dark:text-zinc-500 dark:text-zinc-500">
                      {module.order}
                    </span>
                    {module.title}
                  </h3>
                  <div className="space-y-2 ml-11">
                    {[...(module.lessons || []), ...(module.quizzes || [])].sort((a, b) => a.order - b.order).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between py-2 text-zinc-600 dark:text-zinc-400 group">
                        <div className="flex items-center gap-3">
                           {item.lessons !== undefined ? <Circle size={12} className="text-slate-400" /> : <HelpCircle size={12} className="text-purple-500" />}
                           <span className="text-sm group-hover:text-zinc-800 dark:text-zinc-200 transition-colors uppercase tracking-tight">
                             {item.title}
                           </span>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.lessons !== undefined ? "Lesson" : "Quiz"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t.builder.courseSettings}</h3>
            <ul className="space-y-4">
              {[
                { label: t.builder.addLesson, value: course.modules?.reduce((acc: any, m: any) => acc + (m.lessons?.length || 0), 0) },
                { label: t.builder.addQuiz, value: course.modules?.reduce((acc: any, m: any) => acc + (m.quizzes?.length || 0), 0) },
                { label: t.dashboard.certificate, value: t.dashboard.completed },
                { label: t.catalog.selfPaced, value: t.dashboard.access247 }
              ].map((feature, i) => (
                <li key={i} className="flex justify-between text-sm py-3 border-b border-zinc-200 dark:border-zinc-800 last:border-0">
                  <span className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 font-semibold">{feature.label}</span>
                  <span className="text-slate-900 dark:text-white">{feature.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
