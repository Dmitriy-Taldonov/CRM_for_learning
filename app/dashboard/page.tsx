"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Play, 
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  Pencil
} from "lucide-react";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolled: 0,
    completedLessons: 0,
    overallProgress: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all courses
      const res = await fetch("/api/courses");
      const allCourses = await res.json();
      
      // Fetch individual module/lesson data for progress calculation
      const enrichedCourses = await Promise.all(allCourses.map(async (course: any) => {
        const detailRes = await fetch(`/api/courses/${course.id}`);
        const detail = await detailRes.json();
        
        const progRes = await fetch(`/api/progress?courseId=${course.id}`);
        const progressData = await progRes.json();
        
        const totalLessons = detail.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
        const completedLessons = progressData.filter((p: any) => p.completed).length;
        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        
        return { 
          ...course, 
          progress: progressPercentage,
          totalLessons,
          completedLessons
        };
      }));

      setCourses(enrichedCourses);
      
      const totalEnrolled = enrichedCourses.length;
      const totalCompleted = enrichedCourses.reduce((acc, c) => acc + c.completedLessons, 0);
      const avgProgress = totalEnrolled > 0 ? Math.round(enrichedCourses.reduce((acc, c) => acc + c.progress, 0) / totalEnrolled) : 0;
      
      setStats({
        enrolled: totalEnrolled,
        completedLessons: totalCompleted,
        overallProgress: avgProgress
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-zinc-100 selection:bg-indigo-100 dark:selection:bg-indigo-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent dark:from-indigo-500/5 pointer-events-none" />
        {/* Decorative Gradients */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
          {/* Language Switcher */}
          <div className="absolute top-12 right-6 md:top-20">
            <LanguageSwitcher />
          </div>

          {/* Header Section */}
          <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-200 dark:bg-black/5 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-full backdrop-blur-md">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">{t.dashboard.studentArea}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                {t.dashboard.welcome.replace('{name}', '')} <span className="text-indigo-600 dark:text-indigo-400">{user?.email.split('@')[0]}</span>
              </h1>
              <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-lg font-medium max-w-xl">
                {t.dashboard.subtitle}
              </p>
            </div>

            {/* Global Stats Bar */}
            <div className="flex flex-col gap-6">
              {user?.role === 'ADMIN' && (
                <Link 
                  href="/admin"
                  className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 animate-bounce"
                >
                  <LayoutGrid size={18} /> {t.admin.title}
                </Link>
              )}
              <div className="grid grid-cols-3 gap-8 p-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-3xl backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-2xl">
                <div className="text-center space-y-1 px-4 border-r border-slate-100 dark:border-white/5">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.enrolled}</div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">{t.dashboard.courses}</div>
                </div>
                <div className="text-center space-y-1 px-4 border-r border-slate-100 dark:border-white/5">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.completedLessons}</div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">{t.dashboard.lessons}</div>
                </div>
                <div className="text-center space-y-1 px-4">
                  <div className="text-2xl font-black text-indigo-500 dark:text-indigo-400">{stats.overallProgress}%</div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">{t.dashboard.avgProgress}</div>
                </div>
              </div>
            </div>
          </header>

          {/* Search & Actions */}
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder={t.dashboard.searchCourses}
                className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium text-slate-900 dark:text-white shadow-lg shadow-slate-200/40 dark:shadow-2xl"
              />
            </div>
            <div className="flex gap-2">
              <button className="p-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white transition-all shadow-lg shadow-slate-200/40 dark:shadow-2xl">
                <LayoutGrid size={20} />
              </button>
              <button className="p-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white transition-all shadow-lg shadow-slate-200/40 dark:shadow-2xl">
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white px-2">{t.dashboard.continuingEducation}</h2>
              <Link href="/courses" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-all underline underline-offset-8">
                {t.dashboard.browseCatalog}
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[420px] bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-[40px] animate-pulse relative overflow-hidden">
                     <div className="absolute inset-x-0 bottom-0 p-8 space-y-4">
                        <div className="h-4 w-3/4 bg-black/10 dark:bg-white/10 rounded-full" />
                        <div className="h-2 w-full bg-zinc-200 dark:bg-black/5 dark:bg-white/5 rounded-full" />
                        <div className="h-10 w-full bg-black/10 dark:bg-white/10 rounded-xl" />
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <div key={course.id} className="group relative bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-[40px] overflow-hidden transition-all duration-500 hover:border-indigo-500/30 hover:-translate-y-2 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col h-[480px]">
                    <div className="h-56 relative overflow-hidden bg-white dark:bg-zinc-900 flex-shrink-0">
                      {course.thumbnailUrl ? (
                        <img 
                           src={course.thumbnailUrl} 
                           className="w-full h-full object-cover transform duration-1000 group-hover:scale-110" 
                           alt={course.title} 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-zinc-950 flex items-center justify-center p-12">
                           <BookOpen size={48} className="text-indigo-500/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
                      
                      {/* Badge */}
                      <div className="absolute top-6 left-6 px-3 py-1 bg-black/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                        {course.progress === 100 ? t.dashboard.completed : course.progress > 0 ? t.dashboard.inProgress : t.dashboard.notStarted}
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1 relative -mt-8 bg-white dark:bg-[#0a0a0a] rounded-t-[40px] border-t border-slate-100 dark:border-white/5">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-sm font-medium line-clamp-2 mb-8">
                        {course.description || t.admin.noDescription}
                      </p>
                      
                      {/* Modern Progress Bar */}
                      <div className="space-y-3 mb-8">
                        <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider">
                          <span className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500">{t.dashboard.courseProgress}</span>
                          <span className={`${course.progress > 0 ? "text-indigo-400" : "text-zinc-600"}`}>{course.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white dark:bg-zinc-900 rounded-full overflow-hidden p-[2px]">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <div className="flex gap-4 text-[10px] text-zinc-600 font-bold">
                           <span className="flex items-center gap-1.5"><TrendingUp size={12} /> {course.completedLessons}/{course.totalLessons} {t.dashboard.lessons}</span>
                           <span className="flex items-center gap-1.5"><Award size={12} /> {t.dashboard.certificate}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        {user?.role !== 'ADMIN' && (
                          <Link
                            href={`/courses/${course.id}`}
                            className="group/btn relative w-full inline-flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-black rounded-2xl transition-all shadow-xl shadow-slate-200 dark:shadow-indigo-500/20 active:scale-95 overflow-hidden"
                          >
                            <span className="relative z-10 flex items-center gap-2">
                               {course.progress > 0 ? t.dashboard.continueCourse : t.dashboard.startLearning}
                               <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                            </span>
                          </Link>
                        )}
                        {user?.role === 'ADMIN' && (
                          <Link
                            href={`/admin/course-builder/${course.id}`}
                            className="w-full inline-flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 z-[100]"
                          >
                            <Pencil size={18} /> {t.admin.editCourse}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && courses.length === 0 && (
              <div className="text-center py-32 bg-zinc-100/50 dark:bg-white/[0.02] border border-dashed border-zinc-300 dark:border-white/10 rounded-[60px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full scale-0 group-hover:scale-100 transition-transform duration-[2s]" />
                <div className="relative z-10">
                   <div className="w-24 h-24 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm border border-zinc-300 dark:border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                      <BookOpen size={40} className="text-zinc-700" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{t.dashboard.noEnrollments}</h3>
                   <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 mb-10 max-w-sm mx-auto font-medium">{t.dashboard.noEnrollmentsSub}</p>
                   <Link 
                     href="/courses" 
                     className="inline-flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-500/20 active:scale-95"
                   >
                     {t.dashboard.exploreCatalog} <TrendingUp size={18} />
                   </Link>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </ProtectedRoute>
  );
}
