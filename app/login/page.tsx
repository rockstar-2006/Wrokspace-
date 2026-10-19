"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Send, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import RoleSelector from "@/components/auth/RoleSelector";
import ProjectShowcase3D from "@/components/auth/ProjectShowcase3D";

// Human-readable Firebase error messages
function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase. Add 'localhost' to Firebase Console → Authentication → Settings → Authorized domains.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup. Please allow popups for this site and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return ""; // silent — user chose to close
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/too-many-requests":
      return "Too many sign-in attempts. Please wait a moment and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.";
    default:
      return `Sign-in error (${code}). Please try again or use a saved account.`;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    loginWithRealGoogle,
    role,
    setRole,
    user,
    profile,
    isLoading,
  } = useAuth();

  // Redirect already-authenticated users away
  useEffect(() => {
    if (!isLoading && user?.uid) {
      if (profile && !profile.profileCompleted) {
        router.replace("/dashboard/profile");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, profile, isLoading, router]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Surface OAuth callback errors if returned via URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        if (err === "OAuthCallback") {
          setErrorMessage("Google Sign-In returned an OAuth verification mismatch. You can also pick or enter your campus Google account directly.");
        } else {
          setErrorMessage(`Sign-in error (${err}). Please try again.`);
        }
      }
    }
  }, []);

  // ── Email / USN login ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage("Please enter your email address or register number.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await login(identifier, password, role);
      if (res.success) {
        router.push(res.profileCompleted ? "/dashboard" : "/dashboard/profile");
      } else {
        setErrorMessage("Sign-in failed. Please check your credentials and try again.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Real Google OAuth ───────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("projecthub_user_logged_out");
    }

    try {
      const res = await loginWithRealGoogle(role);
      if (res.success) {
        router.push(res.profileCompleted ? "/dashboard" : "/dashboard/profile");
      }
    } catch (firebaseErr: any) {
      const code: string = firebaseErr?.code ?? "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return;
      }
      console.warn("Firebase Google popup error:", firebaseErr);
      setErrorMessage(
        code ? getFirebaseErrorMessage(code) : firebaseErr?.message || "Google sign-in failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading / session-rehydration screen
  if (isLoading || user?.uid) {
    return (
      <div className="h-screen w-full bg-[#EEF2F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <div className="w-6 h-6 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">
              {typeof window !== "undefined" && window.sessionStorage.getItem("projecthub_google_redirect_pending")
                ? "Completing Google sign-in…"
                : "Welcome Back"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Synchronizing your session…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#EEF2F6] flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden selection:bg-[#FF4A38] selection:text-white">
      <div className="w-full max-w-[1240px] h-full max-h-[96vh] lg:max-h-[760px] bg-white rounded-3xl lg:rounded-[36px] shadow-2xl shadow-slate-300/60 border border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">

        {/* Left — 3D showcase */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-50/90 via-white to-blue-50/30 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between overflow-hidden">
          <ProjectShowcase3D />
        </div>

        {/* Right — login form */}
        <div className="lg:col-span-5 p-5 sm:p-8 xl:p-10 flex flex-col justify-between relative bg-white overflow-y-auto lg:overflow-hidden">
          <div>
            <div className="mb-5">
              <h2 className="text-2xl sm:text-3xl font-black tracking-[-0.03em] text-[#0F172A]">
                Welcome Back!
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 font-medium">
                Log in to your Project Hub account
              </p>
            </div>

            <div className="mb-4">
              <RoleSelector activeRole={role} onChange={setRole} />
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200/60 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-600 text-xs font-semibold leading-snug">{errorMessage}</p>
              </div>
            )}

            {/* Email / USN form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email / Register Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email or register number"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert("Please contact your campus department coordinator to reset credentials.")}
                  className="font-bold text-[#FF5A36] hover:text-[#E04826] transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1.5 py-3 px-5 rounded-xl bg-gradient-to-r from-[#FF5A36] to-[#FF7A50] hover:from-[#E84E2A] hover:to-[#FF683C] text-white text-xs sm:text-sm font-black shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Signing in…</span></>
                ) : (
                  <><span>Login</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 absolute">OR</span>
            </div>

            {/* Google OAuth button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-xs disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <div className="mt-4 text-center text-[11px] text-slate-500">
              <span>Don&apos;t have an account? </span>
              <button
                type="button"
                onClick={() => alert("Student accounts are created automatically on first Google sign-in or email entry.")}
                className="font-bold text-[#FF5A36] hover:underline"
              >
                Sign in to auto-register
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-2 flex items-end justify-between text-slate-400 select-none">
            <Link href="/" className="text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors">
              ← Back to ProjectHub
            </Link>
            <div className="flex items-center gap-1.5 text-right">
              <div>
                <p className="text-[11px] font-handwriting italic text-slate-500 leading-tight">Better Projects</p>
                <p className="text-[11px] font-handwriting italic text-slate-500 leading-tight">Brighter Futures</p>
              </div>
              <Send className="w-4 h-4 text-indigo-400 transform -rotate-12" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
