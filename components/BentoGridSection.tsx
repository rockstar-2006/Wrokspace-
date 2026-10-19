"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Shield, RefreshCw, Sliders, Mail, Lock, CheckCircle2 } from "lucide-react";

export default function BentoGridSection() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas-subtle border border-black/10 text-xs font-bold uppercase tracking-wider text-charcoal mb-4">
          <Sparkles className="w-3.5 h-3.5 text-lime" />
          <span>PRODUCTION-GRADE REGISTRY</span>
        </div>

        {/* Exact phrase inspired by 0:24 in the video */}
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-charcoal leading-tight">
          Every project <br />
          <span className="text-coral">tells a story.</span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-charcoal-muted max-w-xl mx-auto">
          Engineered with strict RLS policies, automated dead-link crawlers, and privacy-first recruiter routing.
        </p>
      </div>

      {/* The Bento-Box Grid (0:24-0:27 in video) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bento 1: Large Left Card (7 cols) */}
        <div className="md:col-span-7 rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <span className="px-3 py-1 rounded-full bg-canvas-subtle text-[11px] font-bold tracking-wider text-charcoal uppercase border border-black/5">
              Knowledge Repository
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight mt-4 group-hover:text-coral transition-colors">
              Search by Architecture, Avoid Repeat Work.
            </h3>
            <p className="mt-2 text-sm sm:text-base text-charcoal-muted max-w-md">
              Juniors can query the registry by tech stack, batch, and problem domain before submitting synopses.
            </p>
          </div>

          {/* Visual Simulation */}
          <div className="mt-8 pt-4 flex flex-wrap gap-2">
            {["Next.js App Router", "Kotlin Native APK", "PyTorch Transformer", "Supabase RLS", "WebGL Shaders", "ESP32 Firmware"].map(
              (tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-canvas-subtle text-xs font-semibold text-charcoal border border-black/5 hover:bg-lime transition-colors"
                >
                  #{tag}
                </span>
              )
            )}
          </div>
        </div>

        {/* Bento 2: Right Top Card (5 cols) */}
        <div className="md:col-span-5 rounded-3xl bg-charcoal text-white p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-coral/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-white/10 text-lime text-[11px] font-bold tracking-wider uppercase border border-white/10">
                Daemon Service
              </span>
              <RefreshCw className="w-4 h-4 text-lime animate-spin" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Dead-Link Checker
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              Automated scheduled cron checks flag broken Vercel, Netlify, and GitHub links before judges review.
            </p>
          </div>

          <div className="mt-6 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <span className="text-neutral-300">Status: 142/142 Online</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Healthy
            </span>
          </div>
        </div>

        {/* Bento 3: Left Bottom Card (5 cols) */}
        <div className="md:col-span-5 rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-canvas-subtle text-[11px] font-bold tracking-wider uppercase text-charcoal border border-black/5">
                Privacy First
              </span>
              <Lock className="w-4 h-4 text-coral" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-charcoal tracking-tight">
              &quot;Interested?&quot; Inquiries
            </h3>
            <p className="mt-2 text-sm text-charcoal-muted">
              Recruiters and startups connect via an admin-brokered gateway. Student personal emails are never exposed publicly.
            </p>
          </div>

          <div className="mt-6 p-3 rounded-2xl bg-canvas-subtle border border-black/5 flex items-center gap-3">
            <Mail className="w-5 h-5 text-coral shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-charcoal">Recruiter Interest Pipeline</p>
              <p className="text-charcoal-muted text-[11px]">Reviewed &amp; forwarded by department faculty</p>
            </div>
          </div>
        </div>

        {/* Bento 4: Right Bottom Card (7 cols) */}
        <div className="md:col-span-7 rounded-3xl bg-lime/20 border border-lime/40 p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-white text-[11px] font-bold tracking-wider uppercase text-charcoal shadow-sm border border-black/5">
                Competition Mode
              </span>
              <Sliders className="w-4 h-4 text-charcoal" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
              Transparent Rubric Scoring
            </h3>
            <p className="mt-2 text-sm sm:text-base text-charcoal-muted">
              Judges score using standardized criteria: Problem Impact (30%), Technical Depth (30%), Code Quality (20%), and Live Defense (20%).
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Impact", val: "30%" },
              { label: "Depth", val: "30%" },
              { label: "Code", val: "20%" },
              { label: "Defense", val: "20%" },
            ].map((metric, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white border border-black/10 text-center shadow-sm">
                <span className="text-[10px] text-charcoal-muted uppercase block font-semibold">{metric.label}</span>
                <span className="text-sm font-extrabold text-charcoal">{metric.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
