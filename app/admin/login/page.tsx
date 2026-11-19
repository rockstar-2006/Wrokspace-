"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  KeyRound,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function AdminLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const errorParam = params.get("error");
  const next = params.get("next");

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signedInAs, setSignedInAs] = useState<string | null>(null);

  useEffect(() => {
    import("next-auth/react").then(({ getSession }) =>
      getSession().then((s) => setSignedInAs(s?.user?.email || null))
    );
  }, []);

  const callbackUrl = next && next.startsWith("/admin") ? next : "/admin";

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage("Please enter both username/email and password.");
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      const { signIn } = await import("next-auth/react");
      const res = await signIn("admin-credentials", {
        email: usernameOrEmail.trim(),
        password: password.trim(),
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMessage("Invalid credentials. Please verify your username/email and password.");
        setBusy(false);
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Sign-in failed. Please try again.");
      setBusy(false);
    }
  };

  const signInGoogle = async () => {
    setBusy(true);
    const { signIn } = await import("next-auth/react");
    await signIn("google", { callbackUrl });
  };

  const bannerMessage =
    errorMessage ||
    (errorParam === "not_admin"
      ? `${signedInAs ? signedInAs : "This account"} is not registered as an administrator. Please sign in with an authorized account or contact the superadmin.`
      : null);

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] p-7 sm:p-9">
          
          {/* Header Icon & Brand */}
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-5 shadow-md">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          
          <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
            ProjectHub · Host console
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Administrator Sign-In
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Review student submissions, manage capstones, approve projects, and configure portal policies.
          </p>

          {/* Error Banner */}
          {bannerMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex gap-2.5 items-start">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{bannerMessage}</span>
            </div>
          )}

          {/* ══════════ CREDENTIALS FORM ══════════ */}
          <form onSubmit={handleCredentialsLogin} className="mt-5 space-y-4">
            
            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username or Email
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin or admin@domain.com"
                  required
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-xl bg-[#0F172A] hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Admin Console</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] font-bold text-slate-400 uppercase">Or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google SSO Button (Alternative) */}
          <button
            type="button"
            onClick={signInGoogle}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors disabled:opacity-60"
          >
            <GoogleMark />
            <span>Continue with Google</span>
          </button>

          <p className="mt-5 text-[11px] text-slate-400 leading-relaxed text-center">
            All administrative actions taken in the Host console are cryptographically tracked in the audit log.
          </p>
        </div>

        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to ProjectHub
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginInner />
    </Suspense>
  );
}
