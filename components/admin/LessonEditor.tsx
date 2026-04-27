"use client";

import React, { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import ContentBlockEditor from "./ContentBlockEditor";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  GripVertical, 
  Pencil, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Plus,
  BookOpen
} from "lucide-react";
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

interface LessonEditorProps {
  lesson: any;
  moduleId: string;
  setCourse: React.Dispatch<React.SetStateAction<any>>;
  onRefresh: () => void;
}

export default function LessonEditor({ lesson, moduleId, setCourse, onRefresh }: LessonEditorProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      setTitle(lesson.title);
      setIsEditing(false);
      return;
    }
    try {
      await fetch(`/api/lessons/${lesson.id}`, {
        method: "PUT",
        body: JSON.stringify({ title, order: lesson.order }),
        headers: { "Content-Type": "application/json" },
      });
      
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === moduleId 
            ? { ...m, lessons: m.lessons.map((l: any) => l.id === lesson.id ? { ...l, title } : l) } 
            : m
        )
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update lesson:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t.builder.deleteLessonConfirm)) return;
    try {
      await fetch(`/api/lessons/${lesson.id}`, { method: "DELETE" });
      
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === moduleId 
            ? { ...m, lessons: m.lessons.filter((l: any) => l.id !== lesson.id) } 
            : m
        )
      }));
    } catch (error) {
      console.error("Failed to delete lesson:", error);
    }
  };

  const addContent = async (type: string) => {
    try {
      const initialContent = type === "VIDEO" ? { url: "" } : { text: "" };
      const res = await fetch("/api/content", {
        method: "POST",
        body: JSON.stringify({ 
          lessonId: lesson.id, 
          type, 
          content: initialContent 
        }),
        headers: { "Content-Type": "application/json" },
      });
      const newContent = await res.json();
      
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === moduleId 
            ? { 
                ...m, 
                lessons: m.lessons.map((l: any) => 
                  l.id === lesson.id 
                    ? { ...l, contents: [...(l.contents || []), newContent] } 
                    : l
                ) 
              } 
            : m
        )
      }));
      setIsExpanded(true);
    } catch (error) {
      console.error("Failed to add content:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = lesson.contents.findIndex((c: any) => c.id === active.id);
      const newIndex = lesson.contents.findIndex((c: any) => c.id === over.id);

      const newContents = (arrayMove(lesson.contents, oldIndex, newIndex) as any[]).map((content, index) => ({
        ...content,
        order: index + 1
      }));

      // Immediate UI update
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === moduleId 
            ? { 
                ...m, 
                lessons: m.lessons.map((l: any) => 
                  l.id === lesson.id ? { ...l, contents: newContents } : l
                ) 
              } 
            : m
        )
      }));

      // Persist to DB
      try {
        await fetch("/api/content/reorder", {
          method: "PUT",
          body: JSON.stringify({ contents: newContents.map(c => ({ id: c.id, order: c.order })) }),
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Failed to reorder contents:", error);
        onRefresh();
      }
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700/30 border border-zinc-700/50 rounded-lg overflow-hidden transition-all hover:bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700/50 ${isDragging ? "z-50 shadow-2xl scale-[1.02]" : ""}`}
    >
      <div className="p-3 flex items-center justify-between group">
        <div className="flex items-center gap-2 flex-1">
          <button 
            {...attributes} 
            {...listeners}
            className="text-zinc-600 hover:text-zinc-600 dark:text-zinc-400 cursor-grab active:cursor-grabbing p-1 -ml-1"
          >
            <GripVertical size={16} />
          </button>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-slate-900 dark:text-white transition-colors"
          >
             {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          <span className="text-zinc-600 font-mono text-[10px] bg-white dark:bg-zinc-900/50 px-1.5 py-0.5 rounded border border-zinc-700/30">L{lesson.order}</span>
          
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <input
                autoFocus
                className="bg-white dark:bg-zinc-900 border border-indigo-500 rounded px-2 py-1 text-sm outline-none w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleUpdate}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span 
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-slate-900 dark:text-white truncate"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {lesson.title}
              </span>
              <button 
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-indigo-400"
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-white dark:bg-zinc-900 rounded-md p-0.5 border border-zinc-700 shadow-inner overflow-hidden">
            <button
              onClick={() => addContent("TEXT")}
              className="text-[10px] px-2 py-1 hover:bg-indigo-600/20 hover:text-indigo-300 rounded transition-colors text-zinc-600 dark:text-zinc-400 font-bold flex items-center gap-1 border-r border-zinc-200 dark:border-zinc-800"
              title="Add text/markdown"
            >
              <Plus size={10} /> {t.builder.text}
            </button>
            <button
              onClick={() => addContent("VIDEO")}
              className="text-[10px] px-2 py-1 hover:bg-indigo-600/20 hover:text-indigo-300 rounded transition-colors text-zinc-600 dark:text-zinc-400 font-bold flex items-center gap-1 border-r border-zinc-200 dark:border-zinc-800"
              title="Add video link or file"
            >
              <Plus size={10} /> {t.builder.video}
            </button>
            <button
              onClick={() => addContent("AUDIO")}
              className="text-[10px] px-2 py-1 hover:bg-indigo-600/20 hover:text-indigo-300 rounded transition-colors text-zinc-600 dark:text-zinc-400 font-bold flex items-center gap-1 border-r border-zinc-200 dark:border-zinc-800"
              title="Add audio file"
            >
              <Plus size={10} /> {t.builder.audio}
            </button>
            <button
              onClick={() => addContent("IMAGE")}
              className="text-[10px] px-2 py-1 hover:bg-indigo-600/20 hover:text-indigo-300 rounded transition-colors text-zinc-600 dark:text-zinc-400 font-bold flex items-center gap-1 border-r border-zinc-200 dark:border-zinc-800"
              title="Add image"
            >
              <Plus size={10} /> {t.builder.image}
            </button>
            <button
              onClick={() => addContent("FILE")}
              className="text-[10px] px-2 py-1 hover:bg-indigo-600/20 hover:text-indigo-300 rounded transition-colors text-zinc-600 dark:text-zinc-400 font-bold flex items-center gap-1"
              title="Add document/PDF"
            >
              <Plus size={10} /> {t.builder.file}
            </button>
          </div>
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

      </div>

      {isExpanded && (
        <div className="px-4 py-3 border-t border-zinc-700/30 bg-black/10 space-y-4">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={lesson.contents?.map((c: any) => c.id) || []}
              strategy={verticalListSortingStrategy}
            >
              {[...(lesson.contents || [])].sort((a: any, b: any) => a.order - b.order).map((content: any) => (
                <ContentBlockEditor 
                  key={content.id} 
                  contentItem={content} 
                  moduleId={moduleId}
                  lessonId={lesson.id}
                  setCourse={setCourse}
                  onRefresh={onRefresh} 
                />
              ))}
            </SortableContext>
          </DndContext>
          
          {(!lesson.contents || lesson.contents.length === 0) && (
            <div className="text-center py-6 bg-white dark:bg-zinc-900/10 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800/50">
              <div className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700/30 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-zinc-600">
                <BookOpen size={20} />
              </div>
              <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-[10px] italic">{t.builder.noContent}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


