"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Code2, Smartphone, Cpu, Award } from "lucide-react";

export default function ValuePropositionSection() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const previewCards = [
    {
      title: "PulseSync P2P Engine",
      tag: "WEB 3.0 & CRDT",
      author: "Karan Verma (Batch '25)",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      accent: "#FF5238",
      stats: "128 Stars • Live Vercel",
    },
    {
      title: "BioEcho Acoustic APK",
      tag: "ANDROID NATIVE",
      author: "Devansh Patel (Batch '24)",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80",
      accent: "#10B981",
      stats: "GitHub Releases • Signed APK",
    },
    {
      title: "NeuroVision Core",
      tag: "VISION TRANSFORMER",
      author: "Priya Nair (Batch '25)",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
      accent: "#6366F1",
      stats: "PyTorch • ONNX Edge",
    },
  ];

  return (
    <section className="py-20 md:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Bold Phrasing & Pitch */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral/10 text-coral border border-coral/20 text-xs font-bold tracking-wider uppercase mb-5">
            <span>SHOWCASE & REGISTRY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-charcoal leading-[1.15]">
            Showcase, compare, <br />
            <span className="text-coral">&amp; discover</span> every build <br />
            in one department hub.
          </h2>

          <p className="mt-6 text-base sm:text-lg text-charcoal-muted leading-relaxed max-w-xl">
            A dynamic campus ecosystem where student engineers publish verified repositories,
            demonstrate live deployments, and upload clean demo videos. Juniors inspect past
            solutions instead of rebuilding wheels from scratch.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <a
              href="#submit"
              className="px-6 py-3 rounded-full bg-charcoal text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-2 shadow-card"
            >
              <span>Submission Guidelines</span>
              <ArrowUpRight className="w-4 h-4 text-lime" />
            </a>
            <div className="flex items-center gap-2 text-xs text-charcoal-muted font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Google OAuth Restricted (@college.edu)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Shuffling / Interactive Card Display (0:04-0:06 in video) */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[380px]">
          <div className="relative w-full max-w-[420px] h-[360px]">
            {previewCards.map((item, idx) => {
              const isActive = activeTab === idx;
              // Stacked cards offset
              const offsetAngle = (idx - 1) * 6;
              const offsetX = (idx - 1) * 24;
              const offsetY = idx * 12;

              return (
                <motion.div
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  animate={{
                    rotate: isActive ? 0 : offsetAngle,
                    x: isActive ? 0 : offsetX,
                    y: isActive ? -10 : offsetY,
                    scale: isActive ? 1.02 : 0.95,
                    zIndex: isActive ? 30 : 20 - idx,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className="absolute inset-0 rounded-3xl bg-white border border-black/10 shadow-card hover:shadow-card-hover cursor-pointer overflow-hidden p-3.5 flex flex-col justify-between"
                >
                  <div className="relative w-full h-[220px] rounded-2xl overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/20">
                      {item.tag}
                    </div>
                  </div>

                  <div className="pt-3 pb-1 px-1 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-charcoal truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-charcoal-muted">{item.author}</p>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-canvas-subtle font-semibold text-charcoal border border-black/5">
                      {item.stats}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
