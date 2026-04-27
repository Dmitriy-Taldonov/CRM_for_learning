"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t.register.errorMismatch);
      return;
    }

    setIsLoading(true);

    try {
      await register({ email, password });
    } catch (err: any) {
      setError(err.message || t.register.errorFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100vh] items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-zinc-950 to-zinc-950 px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md space-y-8 relative">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative backdrop-blur-xl bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.register.title}
            </h2>
            <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
              {t.register.subtitle}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                {error}
              </div>
            )}
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  {t.register.email}
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full rounded-lg border-0 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700/50 py-3 px-4 text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-700 placeholder:text-slate-500 dark:text-zinc-500 dark:text-zinc-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm sm:leading-6 transition-all"
                  placeholder={t.register.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" title="password" className="sr-only">
                  {t.register.password}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="relative block w-full rounded-lg border-0 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700/50 py-3 px-4 text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-700 placeholder:text-slate-500 dark:text-zinc-500 dark:text-zinc-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm sm:leading-6 transition-all"
                  placeholder={t.register.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" title="confirm-password" className="sr-only">
                  {t.register.confirmPassword}
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="relative block w-full rounded-lg border-0 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700/50 py-3 px-4 text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-700 placeholder:text-slate-500 dark:text-zinc-500 dark:text-zinc-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm sm:leading-6 transition-all"
                  placeholder={t.register.confirmPassword}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg bg-purple-600 px-3 py-3 text-sm font-semibold text-slate-900 dark:text-white hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
              >
                {isLoading ? t.register.loading : t.register.submit}
              </button>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-zinc-100 dark:bg-zinc-950 px-4 text-slate-500 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-widest font-bold">{t.common.orContinueWith}</span>
              </div>
            </div>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    await googleLogin({ credential: credentialResponse.credential });
                  } catch (e: any) {
                    setError(e.message);
                  }
                }}
                onError={() => {
                  setError("Google Login Failed");
                }}
                theme="filled_black"
                size="large"
                shape="rectangular"
                width="100%"
                text="continue_with"
              />
            </div>

            <div className="text-center text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">{t.register.alreadyHaveAccount} </span>
              <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
                {t.register.signIn}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
