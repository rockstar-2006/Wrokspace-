"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsapUtils";

export default function GatewayExpandStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);

  /* ── GSAP Text Reveal with ScrollTrigger ───────────────────────────── */
  useEffect(() => {
    const headerEl = headerRef.current;
    if (typeof window === "undefined" || !headerEl) return;

    const ctx = gsap.context(() => {
      const targets = [
        tagRef.current,
        line1Ref.current,
        line2Ref.current,
        line3Ref.current,
      ].filter(Boolean);

      if (targets.length > 0) {
        gsap.from(targets, {
          yPercent: 110,
          opacity: 0,
          duration: 1.1,
          stagger: 0.1,
          ease: "power4.out",
          force3D: true,
          scrollTrigger: {
            trigger: headerEl,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.6,
  });

  // Container width expands from 84% to 100% as you scroll
  const containerWidth = useTransform(smoothProgress, [0.15, 0.55], ["84%", "100%"]);
  const containerRadius = useTransform(smoothProgress, [0.15, 0.55], [36, 16]);

  // Portrait image scales and drifts with parallax
  const portraitScale = useTransform(smoothProgress, [0.15, 0.6], [0.92, 1.04]);
  const portraitY = useTransform(smoothProgress, [0.15, 0.7], [-30, 30]);

  // Circular navigation buttons slide in from left and right borders
  const leftButtonX = useTransform(smoothProgress, [0.25, 0.5], [-60, 0]);
  const rightButtonX = useTransform(smoothProgress, [0.25, 0.5], [60, 0]);
  const buttonOpacity = useTransform(smoothProgress, [0.25, 0.45], [0, 1]);

  return (
    <section
      ref={containerRef}
      id="featured"
      className="relative pt-4 pb-2 md:pb-4 w-full flex flex-col items-center overflow-hidden"
    >
      {/* 1. Header with GSAP Masked Text Reveal */}
      <div ref={headerRef} className="w-full max-w-[1440px] px-6 sm:px-12 mb-6 text-left">
        <div className="overflow-hidden mb-3">
          <span
            ref={tagRef}
            className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#71747E] block will-change-transform"
          >
            PROJECTHUB SPOTLIGHT — 2026 COHORT
          </span>
        </div>

        <h2 className="text-5xl sm:text-7xl md:text-[80px] font-extrabold tracking-[-0.04em] leading-[1.02]">
          <span className="block overflow-hidden py-0.5">
            <span ref={line1Ref} className="text-[#111215] block will-change-transform">
              Gateway to
            </span>
          </span>
          <span className="block overflow-hidden py-0.5">
            <span ref={line2Ref} className="text-[#111215] inline-block will-change-transform mr-3">
              student creator
            </span>
            <span ref={line3Ref} className="text-[#8E929E] inline-block will-change-transform">
              projects.
            </span>
          </span>
        </h2>
      </div>

      {/* 2. THE EXPANDING RED / TERRACOTTA CONTAINER (width: 84% -> 100vw on scroll) */}
      <motion.div
        style={{
          width: containerWidth,
          borderRadius: containerRadius,
        }}
        className="relative bg-[#EE5838] overflow-hidden text-white shadow-2xl min-h-[460px] sm:min-h-[580px] flex items-center justify-center p-6 sm:p-14 select-none transition-shadow"
      >
        {/* Top-Left Pinned: Vertical Segmented Pill Toggle */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-30 w-8 sm:w-9 h-14 sm:h-16 rounded-full overflow-hidden flex flex-col border border-white/20 shadow-md">
          <div className="w-full h-1/2 bg-white" />
          <div className="w-full h-1/2 bg-[#121316]" />
        </div>

        {/* Top-Right Pinned: Three Dots '...' */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-30 text-white/80 hover:text-white cursor-pointer">
          <MoreHorizontal className="w-6 h-6" />
        </div>

        {/* Center High-Tech Flagship Project Window with Parallax Drift */}
        <motion.div
          style={{
            scale: portraitScale,
            y: portraitY,
          }}
          className="relative w-full max-w-[680px] h-[360px] sm:h-[460px] mx-auto flex items-center justify-center rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-[#0D0F12]"
        >
          {/* macOS Glassmorphism Window Header */}
          <div className="absolute top-0 inset-x-0 h-10 bg-black/60 backdrop-blur-md border-b border-white/10 z-20 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
              <span className="ml-3 text-[11px] font-mono text-white/70 font-medium">
                neural-canvas-ai // v2.6-prod
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ● LIVE DEPLOYMENT
              </span>
            </div>
          </div>

          {/* Project Screenshot / High-Tech UI Dashboard */}
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85"
            alt="ProjectHub Flagship Capstone - Neural Canvas AI"
            fill
            className="object-cover mt-5"
            priority
          />

          {/* Overlay Project Meta Badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

          <div className="absolute bottom-5 inset-x-5 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-left">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-[#FF4A38] text-white text-[10px] font-bold uppercase tracking-wider mb-1.5 inline-block">
                STUDENT CAPSTONE FINALIST &apos;26
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Neural Canvas AI — Generative WebGL &amp; Model Hub
              </h3>
              <p className="text-xs text-white/80 font-mono mt-0.5">
                Stack: Next.js 14 • Three.js • PyTorch • CUDA • Docker
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold text-white">18.4K ★</span>
              <span className="text-white/40">|</span>
              <span className="text-[11px] text-white/80">99.8% Test Passed</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom-Left Pinned: "Inspect Project Code" Pill Button */}
        <motion.div
          style={{
            x: leftButtonX,
            opacity: buttonOpacity,
          }}
          className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-30"
        >
          <a
            href="#directory"
            className="px-6 py-2.5 rounded-full bg-white text-[#111215] text-xs font-bold border border-white/80 hover:bg-neutral-100 shadow-md transition-all inline-block"
          >
            Inspect Project Code
          </a>
        </motion.div>

        {/* Bottom-Right Pinned: Circular Arrows '<' and '>' Sliding into corners */}
        <motion.div
          style={{
            x: rightButtonX,
            opacity: buttonOpacity,
          }}
          className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-30 flex items-center gap-2.5"
        >
          <button
            aria-label="Previous slide"
            className="w-10 h-10 rounded-full bg-white text-[#111215] flex items-center justify-center hover:bg-neutral-100 shadow-md transition-transform hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5 text-[#111215]" />
          </button>
          <button
            aria-label="Next slide"
            className="w-10 h-10 rounded-full bg-white text-[#111215] flex items-center justify-center hover:bg-neutral-100 shadow-md transition-transform hover:scale-105"
          >
            <ChevronRight className="w-5 h-5 text-[#111215]" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
