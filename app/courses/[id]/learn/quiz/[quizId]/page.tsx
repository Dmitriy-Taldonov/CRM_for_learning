"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  HelpCircle, 
  LayoutDashboard,
  Clock,
  Target,
  AlertCircle,
  Trophy,
  XCircle,
  Play,
  Check
} from "lucide-react";

export default function QuizTakingPage() {
  const { t } = useLanguage();
  const { id: courseId, quizId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [courseId, quizId]);

  useEffect(() => {
    if (isStarted && timeLeft !== null && timeLeft > 0 && !result) {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    } else if (isStarted && timeLeft === 0 && !result) {
      handleSubmit();
    }
  }, [isStarted, timeLeft, result]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      setCourse(data);

      const quizRes = await fetch(`/api/quizzes/${quizId}`); 
      const quizData = await quizRes.json();
      setQuiz(quizData);
      
      if (quizData.timeLimit) {
        setTimeLeft(quizData.timeLimit * 60);
      }

      // Fetch progress
      const progRes = await fetch(`/api/progress?courseId=${courseId}`);
      if (progRes.ok) {
        setProgress(await progRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch quiz data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const allItems = useMemo(() => {
    if (!course) return [];
    const items: any[] = [];
    [...course.modules].sort((a: any) => a.order).forEach(m => {
      const lessons = (m.lessons || []).map((l: any) => ({ ...l, type: 'lesson', moduleTitle: m.title }));
      const quizzes = (m.quizzes || []).map((q: any) => ({ ...q, type: 'quiz', moduleTitle: m.title }));
      [...lessons, ...quizzes].sort((a, b) => a.order - b.order).forEach((item: any) => items.push(item));
    });
    return items;
  }, [course]);

  const handleOptionToggle = (questionId: string, optionId: string, type: string) => {
    if (result) return;
    setAnswers((prev: any) => {
      const current = prev[questionId] || [];
      if (type === "SINGLE_CHOICE") {
        return { ...prev, [questionId]: [optionId] };
      } else {
        const next = current.includes(optionId)
          ? current.filter((id: string) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: next };
      }
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting || result) return;
    setIsSubmitting(true);
    try {
      const timeSpent = quiz.timeLimit ? (quiz.timeLimit * 60 - (timeLeft || 0)) : 0;
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers, timeSpent }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!quiz) return <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center text-white">{t.common.loading}</div>;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-zinc-100 flex selection:bg-indigo-100 dark:selection:bg-indigo-500/30">
        {/* Simplified Learning Sidebar (similar to lesson viewer) */}
        <aside className="w-80 border-r border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl overflow-y-auto hidden md:block">
           <div className="p-6">
              <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 text-sm font-bold transition-colors">
                <ChevronLeft size={16} /> {t.common.dashboard}
              </Link>
              <h2 className="font-black text-xl mb-10 text-slate-900 dark:text-white">{course.title}</h2>
              <div className="space-y-10">
                {course.modules?.map((m: any) => (
                  <div key={m.id} className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{m.title}</h3>
                    <div className="space-y-1">
                      {/* Mix lessons and quizzes */}
                      {[...(m.lessons || []).map((l: any) => ({...l, type: 'lesson'})), ...(m.quizzes || []).map((q: any) => ({...q, type: 'quiz'}))]
                        .sort((a,b) => a.order - b.order)
                        .map((item: any) => (
                          <Link
                            key={item.id}
                            href={item.type === 'lesson' ? `/courses/${courseId}/learn/${item.id}` : `/courses/${courseId}/learn/quiz/${item.id}`}
                            className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all ${item.id === quizId ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"}`}
                          >
                            {item.type === 'lesson' ? <Circle size={14} /> : <HelpCircle size={14} />}
                            <span className="text-xs font-bold line-clamp-1">{item.title}</span>
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
            {!isStarted && !result ? (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[40px] p-12 text-center space-y-8 shadow-2xl">
                <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto text-purple-500">
                  <HelpCircle size={48} />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">{quiz.title}</h1>
                  <p className="text-slate-500 dark:text-zinc-500 max-w-md mx-auto">{quiz.description || t.catalog.subtitle}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                   <div className="flex flex-col items-center gap-1">
                      <Clock className="text-indigo-500" size={20} />
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{quiz.timeLimit ? `${quiz.timeLimit} ${t.quiz.minutes}` : t.quiz.unlimited}</span>
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <Target className="text-emerald-500" size={20} />
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.quiz.passThreshold}: {quiz.passingThreshold} {t.dashboard.completed}</span>
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <LayoutDashboard className="text-amber-500" size={20} />
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{quiz.questions?.length} {t.quiz.questions}</span>
                   </div>
                </div>
                <button 
                  onClick={() => setIsStarted(true)}
                  className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                >
                  <Play size={20} /> Start Quiz Now
                </button>
              </div>
            ) : result ? (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[40px] p-12 text-center space-y-8 shadow-2xl animate-fade-in">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${result.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                  {result.passed ? <Trophy size={48} /> : <XCircle size={48} />}
                </div>
                <div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{result.passed ? t.quiz.wellDone : t.quiz.almostThere}</h2>
                  <p className="text-slate-500 dark:text-zinc-500">
                    {t.quiz.score
                      .replace('{correct}', String(result.correctCount ?? 0))
                      .replace('{total}', String(result.totalQuestions ?? 0))}
                  </p>
                </div>
                
                <div className="max-w-xs mx-auto p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score Percentage</span>
                      <span className={`text-xs font-black ${result.passed ? "text-emerald-500" : "text-amber-500"}`}>
                        {result.totalQuestions > 0 ? Math.round((result.correctCount / result.totalQuestions) * 100) : 0}%
                      </span>
                   </div>
                   <div className="h-2 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${result.passed ? "bg-emerald-500" : "bg-amber-500"}`} 
                        style={{ width: `${result.totalQuestions > 0 ? (result.correctCount / result.totalQuestions) * 100 : 0}%` }} 
                      />
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                   <button 
                     onClick={() => { setResult(null); setAnswers({}); setIsStarted(false); fetchData(); }}
                     className="px-8 py-4 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-black rounded-xl hover:bg-slate-200 transition-all"
                   >
                     {t.quiz.tryAgain}
                   </button>
                   <Link 
                     href={`/courses/${courseId}`}
                     className="px-8 py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
                   >
                     {t.quiz.backToCourse}
                   </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <header className="flex items-center justify-between sticky top-0 bg-[#f8fafc]/80 dark:bg-[#050505]/80 backdrop-blur-xl z-20 py-4 mb-10 border-b border-slate-200 dark:border-zinc-800">
                   <div>
                      <h1 className="text-2xl font-black text-slate-900 dark:text-white">{quiz.title}</h1>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.quiz.questionLabel.replace('{num}', (Object.keys(answers).length).toString())}/{quiz.questions?.length}</span>
                      </div>
                   </div>
                   {timeLeft !== null && (
                     <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border ${timeLeft < 60 ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white shadow-xl"}`}>
                        <Clock size={18} />
                        <span className="font-black font-mono text-lg">{formatTime(timeLeft)}</span>
                     </div>
                   )}
                </header>

                <div className="space-y-16">
                  {quiz.questions?.map((q: any, i: number) => (
                    <div key={q.id} className="space-y-8 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="flex gap-6">
                        <span className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black flex-shrink-0 shadow-lg shadow-indigo-600/20">
                          {i + 1}
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                          {q.text}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-3 ml-16">
                        {q.options.map((opt: any) => {
                          const isSelected = answers[q.id]?.includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleOptionToggle(q.id, opt.id, q.type)}
                              className={`p-5 rounded-[24px] border transition-all text-left group flex items-center justify-between ${
                                isSelected 
                                  ? "bg-indigo-500 border-indigo-500 text-white shadow-xl shadow-indigo-500/20 translate-x-2" 
                                  : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50 shadow-sm"
                              }`}
                            >
                              <span className={`font-bold transition-all ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`}>{opt.text}</span>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-white bg-white text-indigo-600" : "border-slate-200 dark:border-zinc-700 bg-transparent"}`}>
                                {isSelected && <Check size={14} strokeWidth={4} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-20 pb-40">
                   <button
                     onClick={handleSubmit}
                     disabled={isSubmitting || Object.keys(answers).length < quiz.questions?.length}
                     className={`w-full py-6 rounded-[32px] font-black uppercase tracking-widest text-lg transition-all shadow-2xl flex items-center justify-center gap-3 ${
                       Object.keys(answers).length === quiz.questions?.length
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 scale-100"
                        : "bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed scale-95"
                     }`}
                   >
                     {isSubmitting ? t.quiz.grading : t.quiz.finishAndSubmit}
                   </button>
                   {Object.keys(answers).length < quiz.questions?.length && (
                     <p className="text-center mt-6 text-slate-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                       <AlertCircle size={14} /> {t.quiz.answerAll}
                     </p>
                   )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
