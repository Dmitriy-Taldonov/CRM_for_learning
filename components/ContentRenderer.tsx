import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Music, PlayCircle, Download, FileBox, Eye } from "lucide-react";

interface ContentProps {
  content: any;
}

export default function ContentRenderer({ content }: ContentProps) {
  const { type, content: data } = content;

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // Support youtube.com/watch?v=...
    let match = url.match(/[?&]v=([^&]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    
    // Support youtu.be/...
    match = url.match(/youtu\.be\/([^?]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    
    // Support youtube.com/embed/...
    match = url.match(/embed\/([^?]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;

    return url;
  };

  const isYouTube = (url: string) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  switch (type) {
    case "TEXT":
      return (
        <div className="prose prose-invert prose-indigo max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed prose-p:mb-5 prose-headings:text-slate-900 dark:text-white prose-strong:text-indigo-300 prose-code:bg-white dark:bg-zinc-900 prose-code:p-1 prose-code:rounded prose-pre:bg-white dark:bg-zinc-900/50 prose-pre:border prose-pre:border-zinc-200 dark:border-zinc-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data.text || ""}
          </ReactMarkdown>
        </div>
      );
    
    case "VIDEO":
      const embedUrl = getEmbedUrl(data.url);
      const isInternal = !isYouTube(data.url);

      return (
        <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 my-10 ring-1 ring-zinc-800/50">
          {embedUrl && !isInternal ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : data.url ? (
            <video
              src={data.url}
              controls
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-100 dark:bg-zinc-950/50">
              <span className="text-sm italic font-medium tracking-tight">No valid video source provided</span>
            </div>
          )}
        </div>
      );

    case "AUDIO":
      return (
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl my-8 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg">
              <Music size={24} />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-black text-sm tracking-tight">{data.name || "Audio Resource"}</h4>
              <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Audio Content</p>
            </div>
          </div>
          <audio src={data.url} controls className="w-full" />
        </div>
      );

    case "IMAGE":
      return (
        <div className="my-10 space-y-3">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-zinc-900">
             <img src={data.url} alt="" className="w-full h-auto" />
          </div>
          {data.caption && <p className="text-center text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-xs font-medium italic">{data.caption}</p>}
        </div>
      );

    case "FILE":
      return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none border border-zinc-200 dark:border-white/5 p-6 rounded-3xl my-8 group hover:border-indigo-500/30 transition-all duration-300 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm border border-zinc-300 dark:border-white/10 rounded-2xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all shadow-inner">
              <FileBox size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="text-zinc-900 dark:text-zinc-100 font-black text-base tracking-tight leading-none truncate max-w-md">{data.name || "Downloadable Resource"}</h4>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                <span>{data.size ? `${(data.size / (1024 * 1024)).toFixed(2)} MB` : "File"}</span>
                <span className="w-1 h-1 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full" />
                <span>Resource</span>
              </div>
            </div>
          </div>
          <a 
            href={data.url} 
            download={data.name}
            className="px-6 py-3 bg-zinc-100 dark:bg-white/[0.05] hover:bg-white text-zinc-700 dark:text-zinc-300 hover:text-black rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 border border-zinc-200 dark:border-white/5"
          >
            <Download size={14} /> Download
          </a>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-white dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-slate-500 dark:text-zinc-500 dark:text-zinc-500 italic text-sm text-center">
          Unsupported content type
        </div>
      );
  }
}



