"use client";

import React, { useState, useEffect } from "react";
import ModuleEditor from "./ModuleEditor";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Save, Plus, ArrowLeft, Layout } from "lucide-react";

interface CourseBuilderProps {
  initialCourse: any;
  onRefresh: () => void;
}

export default function CourseBuilder({ initialCourse, onRefresh }: CourseBuilderProps) {
  const { t } = useLanguage();
  const [course, setCourse] = useState(initialCourse);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setCourse({
      ...initialCourse,
      settings: initialCourse.settings || {
        enableReporting: true,
        require100Percent: false,
        generateCertificate: false,
        includeTestResults: false
      }
    });
  }, [initialCourse]);

  const handleUpdateCourse = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          thumbnailUrl: course.thumbnailUrl,
          settings: course.settings
        }),
        headers: { "Content-Type": "application/json" },
      });
      onRefresh();
    } catch (error) {
      console.error("Failed to update course:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addModule = async () => {
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        body: JSON.stringify({ courseId: course.id, title: "New Module" }),
        headers: { "Content-Type": "application/json" },
      });
      const newModule = await res.json();
      
      setCourse((prev: any) => ({
        ...prev,
        modules: [...(prev.modules || []), { ...newModule, lessons: [] }]
      }));
    } catch (error) {
      console.error("Failed to add module:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = course.modules.findIndex((m: any) => m.id === active.id);
      const newIndex = course.modules.findIndex((m: any) => m.id === over.id);

      const newModules = (arrayMove(course.modules, oldIndex, newIndex) as any[]).map((module, index) => ({
        ...module,
        order: index + 1
      }));

      // Immediate UI update
      setCourse((prev: any) => ({
        ...prev,
        modules: newModules
      }));

      // Persist to DB
      try {
        await fetch("/api/modules/reorder", {
          method: "PUT",
          body: JSON.stringify({ modules: newModules.map(m => ({ id: m.id, order: m.order })) }),
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Failed to reorder modules:", error);
        onRefresh();
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-slate-900 dark:text-white transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[10px] font-black uppercase tracking-wider">Builder</span>
               <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{course.title || "Untitled"}</h1>
            </div>
            <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-xs font-medium">Drafting the future of education</p>
          </div>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={async () => {
              const newState = !course.published;
              setCourse({ ...course, published: newState });
              try {
                await fetch(`/api/courses/${course.id}`, {
                  method: "PUT",
                  body: JSON.stringify({ ...course, published: newState }),
                  headers: { "Content-Type": "application/json" },
                });
                onRefresh();
              } catch (e) {
                console.error(e);
                setCourse({ ...course, published: !newState });
              }
            }}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-2xl ${
              course.published 
                ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/5 hover:bg-emerald-600/20" 
                : "bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-800 dark:text-zinc-200"
            }`}
          >
            {course.published ? "● " + t.dashboard.completed : "○ " + t.common.edit}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none p-10 rounded-[40px] border border-zinc-200 dark:border-white/5 mb-16 space-y-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-20 -mt-20" />
        
        <div className="grid grid-cols-1 gap-8 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Title</label>
            <input
              className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-2xl px-6 py-4 text-slate-900 dark:text-white text-lg font-bold focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none transition-all shadow-inner"
              placeholder="e.g. Master Next.js 16"
              value={course.title}
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Course Description</label>
            <textarea
              rows={3}
              className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-2xl px-6 py-4 text-zinc-700 dark:text-zinc-300 font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none transition-all shadow-inner resize-none"
              placeholder={t.admin.noDescription}
              value={course.description || ""}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
            />
          </div>
        </div>

        {/* Reporting Settings */}
        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-white/5 relative z-10">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest">{t.builder.reporting}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'enableReporting', label: t.builder.enableReporting, desc: t.builder.trackProgress },
              { id: 'require100Percent', label: t.builder.require100, desc: t.builder.finishAll },
              { id: 'includeTestResults', label: t.builder.includeQuizzes, desc: t.builder.addScores },
              { id: 'generateCertificate', label: t.builder.enableCertificates, desc: t.builder.issueCertificates },
            ].map((setting) => (
              <label key={setting.id} className="flex items-center gap-4 p-4 bg-zinc-100/50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-[#f8fafc] dark:bg-zinc-950 dark:bg-white/[0.04] transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-zinc-300 dark:border-white/10 bg-black/50 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                  checked={course.settings?.[setting.id] || false}
                  onChange={(e) => setCourse({
                    ...course,
                    settings: { ...course.settings, [setting.id]: e.target.checked }
                  })}
                />
                <div>
                  <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{setting.label}</div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">{setting.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-8 relative z-10">
          <button
            onClick={handleUpdateCourse}
            disabled={isSaving}
            className="px-10 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all disabled:opacity-50 shadow-2xl shadow-indigo-500/30 flex items-center gap-3 active:scale-95 translate-y-0 hover:-translate-y-1"
          >
            {isSaving ? t.builder.saving : <><Save size={20} /> {t.builder.updateMetadata}</>}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center bg-white dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
              <Layout size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.builder.curriculum}</h2>
          </div>
          <button
            onClick={addModule}
            className="px-5 py-2 bg-white text-zinc-900 hover:bg-zinc-200 text-sm font-bold rounded-lg transition-all shadow-lg flex items-center gap-2"
          >
            <Plus size={18} /> {t.builder.addModule}
          </button>
        </div>

        <div className="space-y-6">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={course.modules?.map((m: any) => m.id) || []}
              strategy={verticalListSortingStrategy}
            >
              {[...(course.modules || [])].sort((a: any, b: any) => a.order - b.order).map((module: any) => (
                <ModuleEditor 
                  key={module.id} 
                  module={module} 
                  setCourse={setCourse}
                  onRefresh={onRefresh} 
                />
              ))}
            </SortableContext>
          </DndContext>
          
          {(!course.modules || course.modules.length === 0) && (
            <div className="text-center py-20 bg-white dark:bg-zinc-900/10 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800/50">
              <div className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
                <Layout size={32} />
              </div>
              <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 font-medium">No modules yet. Start by adding one to your course.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

