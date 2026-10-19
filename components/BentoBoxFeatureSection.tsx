"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsapUtils";
import CinematicSplitText from "@/components/CinematicSplitText";

export default function BentoBoxFeatureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const circuitPathRef = useRef<SVGPathElement>(null);
  const eyeBallRef = useRef<HTMLDivElement>(null);
  const eyePupilRef = useRef<HTMLDivElement>(null);

  /* ── GSAP ScrollTrigger Reveal & DrawSVG Animation ────────────────── */
  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Header reveal
      const headerEl = headerRef.current;
      if (headerEl) {
        gsap.fromTo(
          headerEl.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            stagger: 0.1,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: headerEl,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 2. Bento cards reveal
      const gridEl = gridRef.current;
      if (gridEl) {
        gsap.fromTo(
          gridEl.children,
          { scale: 0.95, y: 30, opacity: 0 },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 0.95,
            stagger: 0.1,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: gridEl,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 3. Vector & Path: DrawSVG circuit path animation in Box 1
      const circuitPathEl = circuitPathRef.current;
      if (circuitPathEl) {
        const pathLen = circuitPathEl.getTotalLength();
        circuitPathEl.style.strokeDasharray = `${pathLen}`;
        circuitPathEl.style.strokeDashoffset = `${pathLen}`;

        gsap.to(circuitPathEl, {
          strokeDashoffset: 0,
          duration: 2.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: circuitPathEl,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ── Interactive Physics: Smooth 60fps Eye Tracking with quickTo ──── */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    if (eyeBallRef.current) {
      gsap.to(eyeBallRef.current, {
        x: x * 26,
        y: y * 26,
        rotateX: -y * 22,
        rotateY: x * 22,
        duration: 0.35,
        ease: "power3.out",
      });
    }

    if (eyePupilRef.current) {
      gsap.to(eyePupilRef.current, {
        x: x * 14,
        y: y * 14,
        duration: 0.25,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeave = () => {
    if (eyeBallRef.current) {
      gsap.to(eyeBallRef.current, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.4)",
      });
    }
    if (eyePupilRef.current) {
      gsap.to(eyePupilRef.current, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.4)",
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-10 md:py-16 px-6 sm:px-12 max-w-[1440px] mx-auto w-full"
    >
      {/* Centered Top Header with GSAP Cinematic SplitText Reveal */}
      <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#71747E] block mb-3 will-change-transform">
          PROJECTHUB ARCHITECTURE
        </span>
        <CinematicSplitText
          tag="h2"
          type="words"
          duration={1.05}
          stagger={0.035}
          className="text-4xl sm:text-6xl md:text-[68px] font-extrabold tracking-[-0.04em] text-[#111215] leading-[1.05]"
        >
          Every project tells a story. Engineered for impact.
        </CinematicSplitText>
      </div>

      {/* Bento Box Grid with GSAP Staggered Pop-In */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* 1. Top-Left Box: "Connect, Build, Deploy" + DrawSVG Blueprint Line */}
        <div className="md:col-span-7 rounded-3xl bg-white border border-black/10 p-8 sm:p-10 art-card-shadow flex flex-col justify-between group overflow-hidden will-change-transform relative">
          {/* Decorative Vector Circuit SVG (DrawSVG effect) */}
          <svg
            className="absolute -right-10 top-1/2 -translate-y-1/2 w-[340px] h-[220px] pointer-events-none opacity-20"
            viewBox="0 0 340 220"
            fill="none"
          >
            <path
              ref={circuitPathRef}
              d="M 20,20 L 120,20 L 180,80 L 260,80 L 320,140 L 320,200"
              stroke="#111215"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 6"
            />
          </svg>

          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111215] tracking-tight">
              Instant GitHub &amp; Docker Sync
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#71747E] max-w-md">
              Connect your capstone repository. ProjectHub spins up live sandbox containers, extracts architecture diagrams, and verifies build tests automatically.
            </p>
          </div>

          {/* Miniature card stack preview */}
          <div className="mt-8 relative h-[200px] flex items-center justify-center">
            {[-25, 0, 25].map((offset, idx) => (
              <div
                key={idx}
                className="absolute w-[180px] h-[160px] rounded-2xl overflow-hidden art-card-shadow border border-black/10 transition-transform group-hover:scale-105"
                style={{
                  transform: `translateX(${offset}px) rotate(${offset / 6}deg)`,
                  zIndex: idx + 10,
                }}
              >
                <Image
                  src={
                    idx === 0
                      ? "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=500&q=80"
                      : idx === 1
                      ? "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=500&q=80"
                      : "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=500&q=80"
                  }
                  alt="mini project stack"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 2. Top-Right Box: 3D interactive tilt canvas with GSAP Physics */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="md:col-span-5 rounded-3xl bg-[#2055DE] text-white p-8 sm:p-10 art-card-shadow flex flex-col justify-between relative overflow-hidden group cursor-pointer will-change-transform"
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80 block mb-2">
              WORKSPACE ECOSYSTEM
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Spatial 3D Canvas
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-blue-100 max-w-xs">
              Real-time canvas with interactive spatial inspection and asset previews.
            </p>
          </div>

          <div className="mt-6 relative h-[210px] rounded-2xl overflow-hidden flex items-center justify-center">
            <Image
              src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80"
              alt="Spatial Canvas Preview"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Dynamic tilting eye graphic with GSAP Physics */}
            <div
              ref={eyeBallRef}
              className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-white/95 shadow-2xl flex items-center justify-center will-change-transform"
            >
              <div
                ref={eyePupilRef}
                className="w-9 h-9 rounded-full bg-[#121316] flex items-center justify-center will-change-transform"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom-Left Box: Automated CI/CD & Rubric Scoring */}
        <div className="md:col-span-5 rounded-3xl bg-white border border-black/10 p-8 sm:p-10 art-card-shadow flex flex-col justify-between group cursor-pointer will-change-transform">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#71747E] block mb-2">
              RUBRIC EVALUATION
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111215] tracking-tight">
              Faculty &amp; Peer Rubric Scoring
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#71747E]">
              Automated code complexity audits, test coverage checks, and faculty review scores to validate capstone rigor.
            </p>
          </div>

          {/* Authentic Live Rubric & Code Complexity Scorecard UI */}
          <div className="mt-6 rounded-2xl bg-[#0F172A] border border-white/10 p-4 flex flex-col justify-between shadow-inner h-[210px] text-white select-none">
            {/* Top Score Bar */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400">
                  RUBRIC SCORE: 98.4 / 100
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                GRADE A+
              </span>
            </div>

            {/* Rubric Progress Metrics */}
            <div className="space-y-2 py-1.5">
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-neutral-400">Test Coverage (Jest &amp; Cypress)</span>
                  <span className="text-white font-bold">99.2%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[99%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-neutral-400">Architecture &amp; Complexity</span>
                  <span className="text-white font-bold">Clean O(log n)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full w-[96%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-neutral-400">Security &amp; Secret Audit</span>
                  <span className="text-emerald-400 font-bold">0 Vulnerabilities</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full w-[100%]" />
                </div>
              </div>
            </div>

            {/* Faculty Sign-off Stamp */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5 text-white/90 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Faculty Endorsed (CS Chair)
              </span>
              <span className="text-amber-300 font-bold">4.9 ★ (38 Reviews)</span>
            </div>
          </div>
        </div>

        {/* 4. Bottom-Right Box: Recruiter Telemetry & Verified Profiles */}
        <div className="md:col-span-7 rounded-3xl bg-[#121316] text-white p-8 sm:p-10 art-card-shadow flex flex-col justify-between group overflow-hidden will-change-transform">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D7FA00] block mb-2">
                CAMPUS TO INDUSTRY RECRUITING
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Recruiter Telemetry &amp; Verified Profiles
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-sm">
                Recruiters from top technology companies inspect real commits, run test suites, and schedule direct interviews with student innovators.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-[240px] h-[190px] rounded-t-3xl bg-neutral-900 border-t-4 border-x-4 border-neutral-700 p-4 shadow-2xl relative overflow-hidden group-hover:-translate-y-2 transition-transform">
              <div className="w-16 h-1.5 rounded-full bg-neutral-700 mx-auto mb-3" />
              <div className="space-y-2">
                <div className="h-4 rounded bg-neutral-800 w-3/4" />
                <div className="h-8 rounded-xl bg-[#2055DE]/30 border border-[#2055DE]/50 flex items-center px-3 text-[10px] text-white">
                  Verified Contributor ID
                </div>
                <div className="h-8 rounded-xl bg-neutral-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
