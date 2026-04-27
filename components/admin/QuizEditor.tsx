"use client";

import React, { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { 
  Pencil, 
  Trash2, 
  HelpCircle, 
  Plus, 
  X, 
  Check, 
  Clock, 
  Target,
  ChevronDown,
  ChevronUp,
  Settings,
  Layout
} from "lucide-react";

interface QuizEditorProps {
  quiz: any;
  moduleId: string;
  setCourse: React.Dispatch<React.SetStateAction<any>>;
  onRefresh: () => void;
}

export default function QuizEditor({ quiz, moduleId, setCourse, onRefresh }: QuizEditorProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [editedQuiz, setEditedQuiz] = useState(quiz);
  const [isSaving, setIsSaving] = useState(false);

  const saveQuiz = async (data = editedQuiz) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${quiz.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      const updated = await res.json();
      
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === moduleId 
            ? { ...m, quizzes: m.quizzes.map((q: any) => q.id === quiz.id ? updated : q) } 
            : m
        )
      }));
      setEditedQuiz(updated);
      setShowConfig(false);
    } catch (error) {
      console.error("Failed to save quiz:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this quiz?")) return;
    try {
      await fetch(`/api/admin/quizzes/${quiz.id}`, { method: "DELETE" });
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === moduleId 
            ? { ...m, quizzes: m.quizzes.filter((q: any) => q.id !== quiz.id) } 
            : m
        )
      }));
    } catch (error) {
      console.error("Failed to delete quiz:", error);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      text: "New Question",
      type: "SINGLE_CHOICE",
      options: [
        { text: "Option 1", isCorrect: true },
        { text: "Option 2", isCorrect: false }
      ]
    };
    setEditedQuiz({
      ...editedQuiz,
      questions: [...(editedQuiz.questions || []), newQuestion]
    });
  };

  const removeQuestion = (index: number) => {
    setEditedQuiz({
      ...editedQuiz,
      questions: editedQuiz.questions.filter((_: any, i: number) => i !== index)
    });
  };

  const updateQuestion = (index: number, data: any) => {
    setEditedQuiz({
      ...editedQuiz,
      questions: editedQuiz.questions.map((q: any, i: number) => i === index ? { ...q, ...data } : q)
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
            <HelpCircle size={18} />
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{quiz.title}</h4>
             <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                  <Layout size={10} /> {quiz.questions?.length || 0} {t.quiz.questions}
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                  <Clock size={10} /> {quiz.timeLimit ? `${quiz.timeLimit} ${t.quiz.minutes.toLowerCase()}` : t.quiz.unlimited}
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500/80 flex items-center gap-1">
                  <Target size={10} /> {t.quiz.passThreshold}: {quiz.passingThreshold}
                </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setShowConfig(true)}
            className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 rounded-lg transition-all"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-red-500 rounded-lg transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowConfig(false)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg shadow-purple-600/20">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.common.edit} {t.builder.addQuiz}</h3>
                  <p className="text-sm text-slate-500 font-medium">{quiz.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfig(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Basic Info */}
              <section className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                  <Settings size={14} /> {t.builder.courseSettings}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">{t.builder.quizTitle}</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white"
                      value={editedQuiz.title}
                      onChange={(e) => setEditedQuiz({ ...editedQuiz, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="relative group/field">
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within/field:opacity-100 transition duration-500" />
                      <div className="relative space-y-2 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl transition-all group-focus-within/field:border-indigo-500/50">
                        <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Target size={14} className="text-emerald-500" /> {t.quiz.passingThreshold}
                        </label>
                        <input 
                          type="number" 
                          min={1}
                          className="w-full bg-transparent border-none outline-none text-lg font-black text-slate-900 dark:text-white placeholder:text-slate-400"
                          value={editedQuiz.passingThreshold}
                          onChange={(e) => setEditedQuiz({ ...editedQuiz, passingThreshold: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="relative group/field">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl blur opacity-0 group-focus-within/field:opacity-100 transition duration-500" />
                      <div className="relative space-y-2 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl transition-all group-focus-within/field:border-indigo-500/50">
                        <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={14} className="text-indigo-500" /> {t.quiz.timeLimit}
                        </label>
                        <input 
                          type="number" 
                          className="w-full bg-transparent border-none outline-none text-lg font-black text-slate-900 dark:text-white placeholder:text-slate-400"
                          value={editedQuiz.timeLimit || ""}
                          onChange={(e) => setEditedQuiz({ ...editedQuiz, timeLimit: e.target.value ? parseInt(e.target.value) : null })}
                          placeholder={t.quiz.unlimited}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Questions */}
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                    <Layout size={14} /> {t.quiz.questions} ({editedQuiz.questions?.length || 0})
                  </h4>
                  <button 
                    onClick={addQuestion}
                    className="text-xs font-black uppercase tracking-widest px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center gap-2"
                  >
                    <Plus size={14} /> {t.quiz.addQuestion}
                  </button>
                </div>

                <div className="space-y-6">
                  {editedQuiz.questions?.map((q: any, qIdx: number) => (
                    <div key={qIdx} className="bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-6 space-y-6 relative group/q">
                      <button 
                        onClick={() => removeQuestion(qIdx)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover/q:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.quiz.questionLabel.replace('{num}', (qIdx + 1).toString())}</label>
                          <textarea 
                            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white font-bold resize-none"
                            rows={2}
                            value={q.text}
                            onChange={(e) => updateQuestion(qIdx, { text: e.target.value })}
                          />
                        </div>
                        <div className="w-full md:w-56 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.quiz.responseType}</label>
                          <div className="flex bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 gap-1">
                            <button 
                              onClick={() => updateQuestion(qIdx, { type: "SINGLE_CHOICE" })}
                              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tight rounded-lg transition-all ${q.type === "SINGLE_CHOICE" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"}`}
                            >
                              {t.quiz.singleChoice}
                            </button>
                            <button 
                              onClick={() => updateQuestion(qIdx, { type: "MULTIPLE_CHOICE" })}
                              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tight rounded-lg transition-all ${q.type === "MULTIPLE_CHOICE" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"}`}
                            >
                              {t.quiz.multipleChoice}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.quiz.options}</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt: any, oIdx: number) => (
                            <div key={oIdx} className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 pl-4">
                              <button 
                                onClick={() => {
                                  const newOptions = q.options.map((o: any, i: number) => {
                                    if (i === oIdx) return { ...o, isCorrect: !o.isCorrect };
                                    if (q.type === "SINGLE_CHOICE" && !o.isCorrect) return o; // already handled by isCorrect flip
                                    if (q.type === "SINGLE_CHOICE" && o.isCorrect) return { ...o, isCorrect: false };
                                    return o;
                                  });
                                  updateQuestion(qIdx, { options: newOptions });
                                }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${opt.isCorrect ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 dark:bg-zinc-800 text-slate-400"}`}
                              >
                                <Check size={14} />
                              </button>
                              <input 
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white"
                                value={opt.text}
                                onChange={(e) => {
                                  const newOptions = q.options.map((o: any, i: number) => i === oIdx ? { ...o, text: e.target.value } : o);
                                  updateQuestion(qIdx, { options: newOptions });
                                }}
                              />
                              <button 
                                onClick={() => {
                                  const newOptions = q.options.filter((_: any, i: number) => i !== oIdx);
                                  updateQuestion(qIdx, { options: newOptions });
                                }}
                                className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              const newOptions = [...q.options, { text: "New Option", isCorrect: false }];
                              updateQuestion(qIdx, { options: newOptions });
                            }}
                            className="flex items-center justify-center gap-2 py-2 border border-dashed border-slate-200 dark:border-zinc-700 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-500/50 transition-all text-[11px] font-black uppercase tracking-widest"
                          >
                            <Plus size={14} /> {t.quiz.addOption}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!editedQuiz.questions || editedQuiz.questions.length === 0) && (
                    <div className="text-center py-20 bg-slate-50 dark:bg-zinc-950/30 rounded-[40px] border border-dashed border-slate-200 dark:border-zinc-800">
                      <HelpCircle size={40} className="mx-auto mb-4 text-slate-300 dark:text-zinc-800" />
                      <p className="text-slate-500 font-bold">{t.builder.noLessons.replace(t.builder.addLesson, t.builder.addQuiz)}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-4 bg-slate-50/50 dark:bg-zinc-900/50">
              <button 
                onClick={() => setShowConfig(false)}
                className="px-6 py-3 text-slate-500 font-black uppercase text-xs tracking-widest hover:text-slate-900 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button 
                onClick={() => saveQuiz()}
                disabled={isSaving}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                {isSaving ? t.common.loading : t.quiz.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
