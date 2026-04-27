import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-100 dark:bg-zinc-950 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-32 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider mb-8 animate-fade-in uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Version 1.0 (MVP) is Live
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 max-w-4xl leading-[0.9] animate-fade-in" style={{ animationDelay: '0.1s' }}>
          MASTER YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-300% animate-gradient">FUTURE</span> WITH US
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl max-w-2xl mb-12 animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
          A premium, high-performance learning ecosystem crafted for the next generation of architects, developers and creators.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Link
            href="/login"
            className="group relative px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Learning
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          <Link 
            href="/courses" 
            className="px-8 py-4 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-700 transition-all hover:bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700"
          >
            Browse Courses
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-zinc-900/50 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-900 dark:text-white font-black tracking-tighter text-xl">
            ANTIGRAVITY<span className="text-indigo-500">.</span>
          </div>
          <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 text-xs font-medium">
            © 2026 ANTIGRAVITY LMS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-slate-900 dark:text-white transition-colors text-xs font-bold uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 hover:text-slate-900 dark:text-white transition-colors text-xs font-bold uppercase tracking-widest">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
