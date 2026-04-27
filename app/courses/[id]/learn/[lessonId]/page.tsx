"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ContentRenderer from "@/components/ContentRenderer";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  PlayCircle, 
  LayoutDashboard,
  Check,
  HelpCircle
} from "lucide-react";

export default function LessonViewerPage() {
  const { t } = useLanguage();
  const { id: courseId, lessonId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [courseId, lessonId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      setCourse(data);

      // Find current lesson
      let foundLesson = null;
      for (const module of data.modules || []) {
        foundLesson = module.lessons?.find((l: any) => l.id === lessonId);
        if (foundLesson) break;
      }
      setLesson(foundLesson);

      // Fetch progress
      const progRes = await fetch(`/api/progress?courseId=${courseId}`);
      if (progRes.ok) {
        const progData = await progRes.json();
        setProgress(progData);
        const lessonProg = progData.find((p: any) => p.lessonId === lessonId);
        setIsCompleted(lessonProg?.completed || false);
      }
    } catch (error) {
      console.error("Failed to fetch lesson data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const allContent = useMemo(() => {
    if (!course) return [];
    const items: any[] = [];
    [...course.modules].sort((a: any, b: any) => a.order - b.order).forEach(m => {
      const lessons = (m.lessons || []).map((l: any) => ({ ...l, type: 'lesson', moduleTitle: m.title }));
      const quizzes = (m.quizzes || []).map((q: any) => ({ ...q, type: 'quiz', moduleTitle: m.title }));
      
      [...lessons, ...quizzes].sort((a, b) => a.order - b.order).forEach(item => {
        items.push(item);
      });
    });
    return items;
  }, [course]);

  const currentIndex = allContent.findIndex(l => l.id === lessonId);
  const nextItem = allContent[currentIndex + 1];
  const prevItem = allContent[currentIndex - 1];

  const handleToggleComplete = async () => {
    const newState = !isCompleted;
    setIsCompleted(newState);
    try {
      await fetch("/api/progress", {
        method: "POST",
        body: JSON.stringify({ lessonId, completed: newState }),
        headers: { "Content-Type": "application/json" },
      });
      // Optionally refresh progress state
      fetchData();
    } catch (error) {
      console.error("Failed to update progress:", error);
      setIsCompleted(!newState);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!lesson) return <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center text-slate-900 dark:text-white">Lesson not found</div>;

  const completionPercentage = course ? Math.round((progress.filter(p => p.completed).length / allContent.filter(i => i.type === 'lesson').length) * 100) : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/30">
        {/* Sidebar */}
        <aside className="w-80 border-r border-zinc-900 bg-zinc-100 dark:bg-zinc-950/50 backdrop-blur-xl overflow-y-auto hidden md:block flex-shrink-0">
          <div className="p-6">
            <Link 
              href="/dashboard" 
              className="group flex items-center gap-2 text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-slate-900 dark:text-white transition-all text-sm mb-8 px-2 py-1.5 rounded-lg hover:bg-white dark:bg-zinc-900"
            >
              <LayoutDashboard size={16} className="group-hover:scale-110 transition-transform" />
              <span>{t.common.dashboard}</span>
            </Link>

            <div className="mb-10 px-2">
              <h2 className="text-slate-900 dark:text-white font-black text-xl mb-3 tracking-tight line-clamp-2">{course.title}</h2>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-white dark:bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                  <span>{t.dashboard.courseProgress}</span>
                  <span>{completionPercentage}% {t.dashboard.completed}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-10">
              {[...course.modules].sort((a: any, b: any) => a.order - b.order).map((module: any) => (
                <div key={module.id} className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.25em] px-2 flex items-center gap-2">
                    <span className="w-1 h-3 bg-indigo-500/50 rounded-full" />
                    {module.title}
                  </h3>
                  <div className="space-y-1">
                    {[...(module.lessons || []).map((l: any) => ({...l, type: 'lesson'})), ...(module.quizzes || []).map((q: any) => ({...q, type: 'quiz'}))]
                      .sort((a,b) => a.order - b.order)
                      .map((item: any) => {
                        const isLCompleted = progress.find(p => p.lessonId === item.id)?.completed;
                        const isCurrent = item.id === lessonId;
                        
                        return (
                          <Link
                            key={item.id}
                            href={item.type === 'lesson' ? `/courses/${courseId}/learn/${item.id}` : `/courses/${courseId}/learn/quiz/${item.id}`}
                            className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all group ${
                              isCurrent 
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                                : "text-slate-500 dark:text-zinc-500 hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                          >
                            {item.type === 'quiz' ? (
                              <HelpCircle size={16} className={isCurrent ? "text-white" : "text-purple-500"} />
                            ) : isLCompleted ? (
                              <CheckCircle size={16} className="text-emerald-500" />
                            ) : isCurrent ? (
                              <PlayCircle size={16} className="text-white" />
                            ) : (
                              <Circle size={16} className="text-zinc-700 group-hover:text-slate-500" />
                            )}
                            <span className={`text-sm line-clamp-1 font-medium ${isCurrent ? "font-black" : ""}`}>
                              {item.title}
                            </span>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/[0.03] via-transparent to-transparent">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <header className="mb-16">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/5">
                    {t.builder.addLesson} {currentIndex + 1} / {allContent.length}
                  </span>
                  {lesson.moduleTitle && (
                    <span className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest">
                      • {lesson.moduleTitle}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleToggleComplete}
                  className={`px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-xl ${
                    isCompleted 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/5" 
                      : "bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white shadow-indigo-500/20"
                  }`}
                >
                  {isCompleted ? <><Check size={14} /> {t.dashboard.completed}</> : t.dashboard.completed}
                </button>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-4">
                {lesson.title}
              </h1>
              <div className="h-1 w-20 bg-indigo-500 rounded-full mb-12" />
            </header>

            <div className="space-y-12 mb-24">
              {lesson.contents?.sort((a: any, b: any) => a.order - b.order).map((content: any) => (
                <ContentRenderer key={content.id} content={content} />
              ))}
            </div>

            {/* Navigation Footer */}
            <footer className="mt-20 pt-16 border-t border-zinc-900 flex flex-col sm:flex-row gap-6 justify-between items-stretch">
              {prevItem ? (
                <Link 
                  href={prevItem.type === 'lesson' ? `/courses/${courseId}/learn/${prevItem.id}` : `/courses/${courseId}/learn/quiz/${prevItem.id}`}
                  className="flex-1 group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col"
                >
                  <span className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <ChevronLeft size={12} /> {t.quiz.backToCourse}
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-bold group-hover:text-slate-900 dark:text-white transition-colors">{prevItem.title}</span>
                </Link>
              ) : (
                <div className="flex-1 opacity-0 pointer-events-none hidden sm:block" />
              )}

              {nextItem ? (
                <Link 
                  href={nextItem.type === 'lesson' ? `/courses/${courseId}/learn/${nextItem.id}` : `/courses/${courseId}/learn/quiz/${nextItem.id}`}
                  className="flex-1 group bg-indigo-600 p-6 rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:-translate-y-1 flex flex-col text-right items-end"
                >
                  <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 flex items-center gap-1">
                    {t.catalog.viewCourse} <ChevronRight size={12} />
                  </span>
                  <span className="text-white font-black group-hover:scale-105 transition-transform origin-right">{nextItem.title}</span>
                </Link>
              ) : (
                <div className="flex-1 group bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl transition-all flex flex-col text-right items-end">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">
                    {t.dashboard.completed}!
                  </span>
                  <span className="text-slate-900 dark:text-white font-black">{t.quiz.wellDone} 🎉</span>
                </div>
              )}
            </footer>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
