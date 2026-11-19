"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";

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
  const params = useSearchParams();
  const error = params.get("error");
  const next = params.get("next");
  const [busy, setBusy] = useState(false);
  const [signedInAs, setSignedInAs] = useState<string | null>(null);

  useEffect(() => {
    import("next-auth/react").then(({ getSession }) =>
      getSession().then((s) => setSignedInAs(s?.user?.email || null))
    );
  }, []);

  const callbackUrl = next && next.startsWith("/admin") ? next : "/admin";

  const signInGoogle = async () => {
    setBusy(true);
    const { signIn } = await import("next-auth/react");
    await signIn("google", { callbackUrl });
  };

  const switchAccount = async () => {
    setBusy(true);
    const { signOut } = await import("next-auth/react");
    await signOut({ redirect: false });
    setSignedInAs(null);
    setBusy(false);
  };

  const message =
    error === "not_admin"
      ? `${signedInAs ? signedInAs : "This Google account"} is not on the Host allowlist. Sign in with an administrator account.`
      : error === "session"
      ? "Your admin session expired or was revoked. Please sign in again."
      : error
      ? `Sign-in failed (${error}). Please try again.`
      : null;

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] p-7 sm:p-9">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-5">
            <ShieldCheck className="w-6 h-6 text-indigo-300" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-indigo-600">ProjectHub · Host console</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">Administrator sign-in</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Review submissions, manage every hosted project and account, and configure the portal. Access is limited to
            Google accounts on the Host allowlist.
          </p>

          {message && (
            <div className="mt-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex gap-2.5">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <button
            type="button"
            onClick={signInGoogle}
            disabled={busy}
            className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-sm font-bold text-slate-800 transition-colors disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleMark />}
            Continue with Google
          </button>

          {signedInAs && error === "not_admin" && (
            <button
              type="button"
              onClick={switchAccount}
              disabled={busy}
              className="mt-3 w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Sign out of {signedInAs}
            </button>
          )}

          <p className="mt-6 text-[11px] text-slate-400 leading-relaxed">
            Admins are configured with the <code className="font-mono text-slate-500">ADMIN_EMAILS</code> server
            environment variable. All actions taken in the console are recorded in the audit log.
          </p>
        </div>
        <Link href="/" className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">
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
