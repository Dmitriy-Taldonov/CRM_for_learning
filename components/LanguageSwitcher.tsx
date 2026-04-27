'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { Languages } from 'lucide-react';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 transition-colors bg-zinc-200 dark:bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-full border border-zinc-300 dark:border-white/10"
      >
        <Languages className="w-4 h-4" />
        <span className="uppercase">{language}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-zinc-900/90 p-1 shadow-2xl backdrop-blur-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as 'en' | 'ru');
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                  language === lang.code
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:bg-black/5 dark:bg-white/5 hover:text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <span>{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
