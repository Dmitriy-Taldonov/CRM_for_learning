import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold font-mono text-zinc-800 animate-pulse">404</h1>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-4 mb-2">Lost in the ecosystem?</h2>
        <p className="text-slate-500 dark:text-zinc-500 dark:text-zinc-500 mb-12">The page you are looking for doesn't exist or has been moved.</p>
        <Link 
          href="/" 
          className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 hover:bg-white hover:text-black text-slate-900 dark:text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
