"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, UploadCloud, Video, Github } from "lucide-react";

export default function SubmissionCallout() {
  const [agreed, setAgreed] = useState(false);

  return (
    <section id="submit" className="py-20 md:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      <div className="rounded-3xl md:rounded-4xl bg-charcoal text-white p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-2xl">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-coral/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-lime/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-lime border border-white/10 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COLLEGE SUBMISSION GATEWAY</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to submit your <br />
              <span className="text-lime">project masterpiece?</span>
            </h2>

            <p className="mt-6 text-neutral-300 text-sm sm:text-base leading-relaxed max-w-lg">
              Sign in with your verified college Google account. Every project undergoes admin review
              before publishing live on the department registry.
            </p>

            <div className="mt-8 space-y-3 max-w-md">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-lime shrink-0" />
                <span>GitHub Repository with clean README &amp; documentation</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-lime shrink-0" />
                <span>3–5 high-resolution UI screenshots or device renders</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-lime shrink-0" />
                <span>2-minute unlisted YouTube demo video walkthrough</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-lime shrink-0" />
                <span>Student listing &amp; privacy consent agreement</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-2">Student Verification</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Restricted to verified college domain (@college.edu)
            </p>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-semibold text-neutral-200">
                    Google OAuth Restricted
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold">
                  Enforced
                </span>
              </div>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-coral focus:ring-coral w-4 h-4"
                />
                <span className="text-[11px] text-neutral-300 leading-snug">
                  I agree to publish my repository and media on ProjectHub and understand the evaluation rubric is final.
                </span>
              </label>

              <button
                onClick={() => {
                  if (!agreed) {
                    alert("Please check the consent agreement first.");
                    return;
                  }
                  alert("Opening Google OAuth restricted to your college domain (@college.edu)...");
                }}
                className={`w-full py-3.5 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  agreed
                    ? "bg-coral text-white hover:bg-coral-hover shadow-coral"
                    : "bg-white/20 text-neutral-400 cursor-not-allowed"
                }`}
              >
                <span>Sign In to Start Submission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
