import React, { useState, useRef } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Video, Type, Music, Image as ImageIcon, FileBox, Upload, Link, Loader2 } from "lucide-react";

interface ContentBlockEditorProps {
  contentItem: any;
  moduleId: string;
  lessonId: string;
  setCourse: React.Dispatch<React.SetStateAction<any>>;
  onRefresh: () => void;
}

export default function ContentBlockEditor({ contentItem, moduleId, lessonId, setCourse, onRefresh }: ContentBlockEditorProps) {
  const { t } = useLanguage();
  const [data, setData] = useState(contentItem.content);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contentItem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdate = async (newData?: any) => {
    setIsSaving(true);
    const payload = newData || data;
    try {
      await fetch(`/api/content/${contentItem.id}`, {
        method: "PUT",
        body: JSON.stringify({ 
          type: contentItem.type, 
          content: payload,
          order: contentItem.order 
        }),
        headers: { "Content-Type": "application/json" },
      });
      
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === moduleId 
            ? { 
                ...m, 
                lessons: m.lessons.map((l: any) => 
                  l.id === lessonId 
                    ? { 
                        ...l, 
                        contents: l.contents.map((c: any) => 
                          c.id === contentItem.id ? { ...c, content: payload } : c
                        ) 
                      } 
                    : l
                ) 
              } 
            : m
        )
      }));
    } catch (error) {
      console.error("Failed to update content:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      const updatedData = { 
        url: result.url, 
        name: result.name, 
        size: result.size,
        type: result.type 
      };
      
      setData(updatedData);
      handleUpdate(updatedData);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t.builder.deleteContentConfirm)) return;
    try {
      await fetch(`/api/content/${contentItem.id}`, { method: "DELETE" });
      
      setCourse((prev: any) => ({
        ...prev,
        modules: prev.modules.map((m: any) => 
          m.id === moduleId 
            ? { 
                ...m, 
                lessons: m.lessons.map((l: any) => 
                  l.id === lessonId 
                    ? { ...l, contents: l.contents.filter((c: any) => c.id !== contentItem.id) } 
                    : l
                ) 
              } 
            : m
        )
      }));
    } catch (error) {
      console.error("Failed to delete content:", error);
    }
  };

  const handleDataChange = (val: any) => {
    const updatedData = contentItem.type === "TEXT" ? { text: val } : { ...data, url: val };
    setData(updatedData);
  };

  const getTypeIcon = () => {
    switch (contentItem.type) {
      case "VIDEO": return <Video size={12} />;
      case "AUDIO": return <Music size={12} />;
      case "IMAGE": return <ImageIcon size={12} />;
      case "FILE": return <FileBox size={12} />;
      default: return <Type size={12} />;
    }
  };

  const isInternal = data.url && data.url.startsWith("/uploads/");

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`group bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none border border-zinc-200 dark:border-white/5 rounded-3xl p-6 relative transition-all hover:border-indigo-500/20 shadow-xl ${isDragging ? "z-50 shadow-2xl scale-[1.02] border-indigo-500/50" : ""}`}
    >
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <button 
            {...attributes} 
            {...listeners}
            className="text-slate-900 dark:text-white/10 hover:text-slate-900 dark:text-white/40 cursor-grab active:cursor-grabbing p-1 -ml-2"
          >
            <GripVertical size={18} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm rounded-full border border-zinc-300 dark:border-white/10 shadow-inner">
            <span className="text-indigo-400">{getTypeIcon()}</span>
            <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest leading-none">
              {contentItem.type}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isSaving && (
            <span className="text-[9px] text-indigo-400 font-black animate-pulse flex items-center gap-1.5 bg-indigo-500/5 px-2 py-1 rounded-full border border-indigo-500/10">
              <span className="w-1 h-1 bg-indigo-500 rounded-full" /> {t.builder.saving.toUpperCase()}
            </span>
          )}
          <button
            onClick={handleDelete}
            className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-500/5 rounded-xl"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {contentItem.type === "TEXT" && (
        <textarea
          className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 text-sm text-zinc-800 dark:text-zinc-200 min-h-[140px] outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all placeholder:text-zinc-800 shadow-inner resize-y font-medium leading-relaxed"
          placeholder={t.builder.textPlaceholder}
          value={data.text || ""}
          onChange={(e) => handleDataChange(e.target.value)}
          onBlur={() => handleUpdate()}
        />
      )}

      {(contentItem.type === "VIDEO" || contentItem.type === "AUDIO" || contentItem.type === "IMAGE" || contentItem.type === "FILE") && (
        <div className="space-y-4">
          {contentItem.type === "VIDEO" && (
            <div className="flex items-center gap-2 mb-2 p-1 bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-xl w-fit">
              <button 
                onClick={() => handleDataChange("")}
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${!isInternal ? "bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white" : "text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300"}`}
              >
                {t.builder.externalLink}
              </button>
              <button 
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${isInternal ? "bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white" : "text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300"}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {t.builder.uploadFile}
              </button>
            </div>
          )}

          <div className="relative group/input">
            <input
              className={`w-full bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-2xl py-3.5 px-12 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all placeholder:text-zinc-800 shadow-inner font-bold`}
              placeholder={contentItem.type === "VIDEO" ? t.builder.videoPlaceholder : t.builder.urlPlaceholder.replace('{type}', contentItem.type.toLowerCase())}
              value={data.url || ""}
              onChange={(e) => handleDataChange(e.target.value)}
              onBlur={() => handleUpdate()}
            />
            {contentItem.type === "VIDEO" ? <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} /> : 
             contentItem.type === "IMAGE" ? <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} /> : 
             <FileBox className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />}
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-zinc-200 dark:bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-xl text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-slate-900 dark:text-white transition-all border border-zinc-200 dark:border-white/5"
            >
              {uploading ? <Loader2 size={16} className="animate-spin text-indigo-400" /> : <Upload size={16} />}
            </button>
          </div>

          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            accept={contentItem.type === "VIDEO" ? "video/*" : contentItem.type === "AUDIO" ? "audio/*" : contentItem.type === "IMAGE" ? "image/*" : ".pdf,.doc,.docx,.zip,.rar"}
          />

          {data.url && (
            <div className="flex items-center gap-3 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                {isInternal ? <FileBox size={14} /> : <Link size={14} />}
              </div>
              <div className="flex-1 truncate">
                 <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-1">Source Active</p>
                 <p className="text-[11px] text-slate-500 dark:text-zinc-500 dark:text-zinc-500 font-medium truncate">{data.name || data.url}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


