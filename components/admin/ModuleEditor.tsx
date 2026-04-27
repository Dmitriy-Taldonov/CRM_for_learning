"use client";

import React, { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import LessonEditor from "./LessonEditor";
import QuizEditor from "./QuizEditor";
import { HelpCircle } from "lucide-react";
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
import { Pencil, Trash2, Plus } from "lucide-react";

interface ModuleEditorProps {
  module: any;
  setCourse: React.Dispatch<React.SetStateAction<any>>;
  onRefresh: () => void;
}

export default function ModuleEditor({ module, setCourse, onRefresh }: ModuleEditorProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(module.title);

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

  const handleUpdate = async () => {
    if (!title.trim()) {
      setTitle(module.title);
      setIsEditing(false);
      return;
    }
    try {
      await fetch(`/api/modules/${module.id}`, {
        method: "PUT",
        body: JSON.stringify({ title, order: module.order }),
        headers: { "Content-Type": "application/json" },
      });
      
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === module.id ? { ...m, title } : m
        )
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update module:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete module and all its lessons?")) return;
    try {
      await fetch(`/api/modules/${module.id}`, { method: "DELETE" });
      
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.filter((m: any) => m.id !== module.id)
      }));
    } catch (error) {
      console.error("Failed to delete module:", error);
    }
  };

  const addLesson = async () => {
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        body: JSON.stringify({ moduleId: module.id, title: "New Lesson" }),
        headers: { "Content-Type": "application/json" },
      });
      const newLesson = await res.json();
      
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === module.id 
            ? { ...m, lessons: [...(m.lessons || []), { ...newLesson, contents: [] }] } 
            : m
        )
      }));
    } catch (error) {
      console.error("Failed to add lesson:", error);
    }
  };

  const addQuiz = async () => {
    try {
      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        body: JSON.stringify({ moduleId: module.id, title: "New Quiz" }),
        headers: { "Content-Type": "application/json" },
      });
      const newQuiz = await res.json();
      
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === module.id 
            ? { ...m, quizzes: [...(m.quizzes || []), newQuiz] } 
            : m
        )
      }));
    } catch (error) {
      console.error("Failed to add quiz:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = module.lessons.findIndex((l: any) => l.id === active.id);
      const newIndex = module.lessons.findIndex((l: any) => l.id === over.id);

      const newLessons = (arrayMove(module.lessons, oldIndex, newIndex) as any[]).map((lesson, index) => ({
        ...lesson,
        order: index + 1
      }));

      // Immediate UI update
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === module.id ? { ...m, lessons: newLessons } : m
        )
      }));

      // Persist to DB
      try {
        await fetch("/api/lessons/reorder", {
          method: "PUT",
          body: JSON.stringify({ lessons: newLessons.map(l => ({ id: l.id, order: l.order })) }),
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Failed to reorder lessons:", error);
        onRefresh(); // Revert on failure
      }
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700/50 p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 group">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-zinc-600 font-mono text-xs bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700/50 shadow-inner">M{module.order}</span>
          {isEditing ? (
            <input
              autoFocus
              className="bg-zinc-100 dark:bg-zinc-950 border border-indigo-500 rounded px-2 py-1 text-sm outline-none w-full max-w-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleUpdate}
              onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3 
                className="font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-indigo-400 transition-colors" 
                onClick={() => setIsEditing(true)}
              >
                {module.title}
              </h3>
              <button 
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-indigo-400"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={addLesson}
            className="text-xs px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/20 transition-all flex items-center gap-1.5 font-semibold"
          >
            <Plus size={14} /> {t.builder.addLesson}
          </button>
          <button
            onClick={addQuiz}
            className="text-xs px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/20 transition-all flex items-center gap-1.5 font-semibold"
          >
            <Plus size={14} /> {t.builder.addQuiz}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 bg-black/10">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={module.lessons?.map((l: any) => l.id) || []}
            strategy={verticalListSortingStrategy}
          >
            {[...(module.lessons || [])].sort((a: any, b: any) => a.order - b.order).map((lesson: any) => (
              <LessonEditor 
                key={lesson.id} 
                lesson={lesson} 
                moduleId={module.id}
                setCourse={setCourse}
                onRefresh={onRefresh} 
              />
            ))}
          </SortableContext>
        </DndContext>

        {module.quizzes?.length > 0 && (
          <div className="space-y-3 mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-4">
             <div className="flex items-center gap-2 px-2">
                <HelpCircle size={14} className="text-purple-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.builder.moduleQuizzes}</span>
             </div>
             {module.quizzes.map((quiz: any) => (
                <QuizEditor 
                  key={quiz.id} 
                  quiz={quiz} 
                  moduleId={module.id} 
                  setCourse={setCourse} 
                  onRefresh={onRefresh} 
                />
             ))}
          </div>
        )}
        
        {(!module.lessons || module.lessons.length === 0) && (
          <div className="text-center py-8 bg-white dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-xs italic">{t.builder.noLessons}</p>
          </div>
        )}
      </div>
    </div>
  );
}

