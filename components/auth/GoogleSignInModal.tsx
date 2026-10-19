"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, UserPlus, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { AuthService } from "@/lib/firebase/authService";

interface GoogleAccount {
  email: string;
  displayName: string;
  photoURL?: string;
  profileCompleted?: boolean;
  studentCode?: string;
}

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when user picks a previously-saved account from the list */
  onSelectAccount: (account: GoogleAccount) => void;
  /** Called when user wants to launch the real Google OAuth popup/redirect */
  onRealGoogleSignIn?: () => void;
  isSubmitting?: boolean;
}

export default function GoogleSignInModal({
  isOpen,
  onClose,
  onSelectAccount,
  onRealGoogleSignIn,
  isSubmitting = false,
}: GoogleSignInModalProps) {
  const [savedAccounts, setSavedAccounts] = useState<GoogleAccount[]>([]);
  /** null = show accounts list (or OAuth button); true = show manual-entry form */
  const [showManualForm, setShowManualForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const stored = AuthService.getSavedGoogleAccounts();
    setSavedAccounts(stored);
    setShowManualForm(false); // always start on the accounts list / OAuth button view
    setError(null);
    setCustomName("");
    setCustomEmail("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = customEmail.trim();
    const nameTrimmed = customName.trim();
    if (!emailTrimmed) { setError("Please enter your Google email address."); return; }
    if (!emailTrimmed.includes("@")) { setError("Please enter a valid email (e.g. name@gmail.com)."); return; }
    onSelectAccount({
      email: emailTrimmed,
      displayName: nameTrimmed || emailTrimmed.split("@")[0],
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emailTrimmed)}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-2 shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black text-[#0F172A] leading-tight">Sign in with Google</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Choose an account to continue to Project Hub</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {!showManualForm ? (
            <div className="space-y-3">

              {/* PRIMARY ACTION — always shown at top: launch real Google OAuth */}
              {onRealGoogleSignIn && (
                <button
                  onClick={() => { onClose(); onRealGoogleSignIn(); }}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google Account</span>
                </button>
              )}

              {/* Saved accounts (only shown if any exist) */}
              {savedAccounts.length > 0 && (
                <>
                  <div className="flex items-center gap-2 my-1">
                    <div className="flex-1 border-t border-slate-100" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or pick saved account</span>
                    <div className="flex-1 border-t border-slate-100" />
                  </div>

                  <div className="space-y-2">
                    {savedAccounts.map((account) => (
                      <button
                        key={account.email}
                        disabled={isSubmitting}
                        onClick={() => onSelectAccount(account)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {account.photoURL ? (
                              <Image src={account.photoURL} alt={account.displayName} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-sm">
                                {account.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {account.displayName}
                              </span>
                              {account.profileCompleted && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-100">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">{account.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {account.studentCode ? (
                            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                              {account.studentCode}
                            </span>
                          ) : (
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-all" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Link to manual email form (last resort) */}
              <button
                disabled={isSubmitting}
                onClick={() => setShowManualForm(true)}
                className="w-full mt-1 flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-dashed border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 text-xs font-semibold transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enter email manually instead</span>
              </button>
            </div>
          ) : (
            /* Manual email entry form — only as a last resort */
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 font-medium -mt-1">
                Enter your Google account details. This won&apos;t verify your identity but lets you access a saved session.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Bhushan Poojary"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Google Email Address</label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. bhushan.student@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Isolated Account · Unique Student UID
            </span>
            <span>Project Hub Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
