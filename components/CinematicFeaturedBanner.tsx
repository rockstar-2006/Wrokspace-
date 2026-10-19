"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, Sparkles, Terminal, Shield, Award, Users } from "lucide-react";

export default function CinematicFeaturedBanner() {
  return (
    <section id="featured" className="py-16 md:py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {/* The Iconic Coral Terracotta Banner (0:07-0:11 in video) */}
      <div className="relative w-full rounded-3xl md:rounded-4xl bg-coral overflow-hidden p-6 sm:p-10 md:p-14 text-white shadow-coral">
        {/* Subtle patterned overlay / lighting */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text Content */}
          <div className="md:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5 text-lime" />
              <span>COHORT 2026 / ANNUAL SHOWCASE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08]">
              Gateway to <br />
              <span className="underline decoration-lime decoration-4 underline-offset-4">
                student innovators.
              </span>
            </h2>

            <p className="mt-6 text-white/90 text-sm sm:text-base md:text-lg max-w-lg leading-relaxed">
              Every project represents hundreds of hours of design, architecture, and debugging.
              Explore verified repositories, inspect APK binaries, and connect directly with the teams.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#projects"
                className="px-6 py-3.5 rounded-full bg-white text-charcoal font-bold text-xs sm:text-sm hover:bg-lime hover:text-charcoal transition-all shadow-md flex items-center gap-2"
              >
                <span>View Finalist Projects</span>
                <ArrowUpRight className="w-4 h-4 text-coral" />
              </a>
              <div className="px-4 py-3.5 rounded-full bg-black/20 backdrop-blur-md border border-white/15 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                <span>142 Active Submissions</span>
              </div>
            </div>
          </div>

          {/* Right Visual: Student Innovator Cutout (Matching the portrait in the reference video) */}
          <div className="md:col-span-5 relative flex items-center justify-center">
            <div className="relative w-[260px] sm:w-[320px] h-[320px] sm:h-[380px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 rotate-1 hover:rotate-0 transition-transform duration-500 group">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                alt="Student Innovator"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-white/95 backdrop-blur-md text-charcoal shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-charcoal">
                      Aarav Sharma
                    </h4>
                    <p className="text-[10px] text-charcoal-muted">
                      CampusFlow OS • Batch of 2024
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-coral text-white text-[10px] font-bold">
                    #1 Finalist
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Proof Bar Underneath (0:10-0:12 in video) */}
      <div className="mt-14 pt-10 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-charcoal-muted block">
            Department Standards
          </span>
          <p className="text-sm font-semibold text-charcoal">
            Audited repositories &amp; verified APK releases
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-charcoal-muted font-semibold text-xs sm:text-sm">
          <span className="flex items-center gap-2 hover:text-charcoal transition-colors">
            <Terminal className="w-4 h-4 text-coral" /> GitHub Verified
          </span>
          <span className="flex items-center gap-2 hover:text-charcoal transition-colors">
            <Shield className="w-4 h-4 text-emerald-600" /> College SSO Domain
          </span>
          <span className="flex items-center gap-2 hover:text-charcoal transition-colors">
            <Award className="w-4 h-4 text-amber-500" /> Faculty Rubrics
          </span>
          <span className="flex items-center gap-2 hover:text-charcoal transition-colors">
            <Users className="w-4 h-4 text-indigo-600" /> Open to Recruiters
          </span>
        </div>
      </div>
    </section>
  );
}
