"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, ArrowRight, Shield, Award, Terminal } from "lucide-react";

export default function SegmentedVisionSection() {
  const [activeTab, setActiveTab] = useState<"students" | "judges">("students");

  const studentFeatures = [
    {
      title: "Permanent Portfolio & Proof of Work",
      desc: "Each project gets a permanent URL with verified badges, demo video embeds, and team attribution. Showcase your skills directly to recruiters.",
      image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=600&q=80",
      tag: "STUDENT PORTFOLIO",
      metric: "100% Retained Rights",
    },
    {
      title: "Zero Repeated Junior Projects",
      desc: "Juniors can query the registry by tech stack, batch, and problem domain before proposing a final-year project, ensuring innovation.",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80",
      tag: "KNOWLEDGE ARCHIVE",
      metric: "5+ Years Indexed",
    },
  ];

  const judgeFeatures = [
    {
      title: "Multi-Criteria Rubric Scoring",
      desc: "Judges review code architecture, live deployment responsiveness, UI design polish, and defense presentation with weighted criteria.",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
      tag: "FAIR EVALUATION",
      metric: "Zero Bias Standard",
    },
    {
      title: "Broken Link & Dead URL Guardian",
      desc: "Automated daily health checks ensure live deployments and GitHub APK releases are online before judging commences.",
      image: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=600&q=80",
      tag: "AUDIT DAEMON",
      metric: "99.9% Uptime Verified",
    },
  ];

  const currentFeatures = activeTab === "students" ? studentFeatures : judgeFeatures;

  return (
    <section id="features" className="py-20 md:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral/10 text-coral text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ROLE-TAILORED EXPERIENCE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-charcoal">
            Our vision for any <br />
            department technology.
          </h2>
        </div>

        {/* The Segmented Pill Toggle (0:18-0:20 in video) */}
        <div className="p-1.5 rounded-full bg-white border border-black/10 shadow-sm inline-flex self-start md:self-auto">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === "students"
                ? "text-white"
                : "text-charcoal-muted hover:text-charcoal"
            }`}
          >
            {activeTab === "students" && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 bg-charcoal rounded-full -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            Student Innovators
          </button>

          <button
            onClick={() => setActiveTab("judges")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === "judges"
                ? "text-white"
                : "text-charcoal-muted hover:text-charcoal"
            }`}
          >
            {activeTab === "judges" && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 bg-charcoal rounded-full -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            Judges &amp; Faculty
          </button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {currentFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 rounded-full bg-canvas-subtle border border-black/5 text-[11px] font-bold tracking-wider text-charcoal uppercase">
                    {feat.tag}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {feat.metric}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-charcoal tracking-tight group-hover:text-coral transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-charcoal-muted leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="mt-8 relative h-[220px] rounded-2xl overflow-hidden bg-slate-900 border border-black/5">
                <Image
                  src={feat.image}
                  alt={feat.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
