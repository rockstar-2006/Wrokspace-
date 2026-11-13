"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, Flip, ScrollTrigger } from "@/lib/gsapUtils";
import { ProjectCategory } from "@/lib/firebase/types";
import ScrambleText from "@/components/animations/ScrambleText";

interface WelcomeBannerProps {
  activeCategory: ProjectCategory;
  onSelectCategory: (category: ProjectCategory) => void;
}

const CATEGORIES: ProjectCategory[] = [
  "All",
  "Web Apps",
  "Mobile Apps",
  "AI / ML",
  "Hardware",
  "Others",
];

export default function WelcomeBanner3D({
  activeCategory,
  onSelectCategory,
}: WelcomeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const rotatingWordRef = useRef<HTMLSpanElement>(null);
  const [imageError, setImageError] = React.useState(false);
  const words = ["Amazing", "Innovative", "Visionary", "Creative", "Inspiring"];
  const wordIndexRef = useRef(0);

  // Smooth GSAP Entrance, Parallax Motion, Continuous Rotating Word & Flip Morphing
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Staggered reveal animation on mount
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -16, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7 }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.4"
        )
        .fromTo(
          descRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          pillsRef.current?.children || [],
          { opacity: 0, y: 14, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06 },
          "-=0.4"
        )
        .fromTo(
          imageRef.current,
          { opacity: 0, scale: 0.88, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 1, ease: "back.out(1.4)" },
          "-=0.7"
        );

      // 2. Continuous Organic 3D Floating Animation on the Illustration
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          y: -12,
          rotation: 0.8,
          duration: 3.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      // 4. Continuous GSAP Rotating Word Text Animation
      const interval = setInterval(() => {
        if (!rotatingWordRef.current) return;
        gsap.to(rotatingWordRef.current, {
          y: -20,
          opacity: 0,
          scale: 0.9,
          duration: 0.35,
          ease: "power2.in",
          onComplete: () => {
            wordIndexRef.current = (wordIndexRef.current + 1) % words.length;
            if (rotatingWordRef.current) {
              rotatingWordRef.current.innerText = words[wordIndexRef.current];
              gsap.fromTo(
                rotatingWordRef.current,
                { y: 20, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.7)" }
              );
            }
          },
        });
      }, 2600);

      return () => clearInterval(interval);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // GSAP Flip Morphing when user switches categories
  const handleCategorySelect = (cat: ProjectCategory) => {
    if (cat === activeCategory) return;
    if (typeof window !== "undefined" && pillsRef.current) {
      const pills = pillsRef.current.querySelectorAll(".category-pill");
      const state = Flip.getState(pills);
      onSelectCategory(cat);
      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 0.4,
          ease: "power2.out",
          scale: true,
        });
      });
    } else {
      onSelectCategory(cat);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-[28px] bg-white border border-[#E2E8F0]/80 p-8 sm:p-10 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] overflow-hidden mb-10 select-none transition-all duration-300 hover:border-[#CBD5E1]"
    >
      {/* Background Soft Ambient Light with Parallax Speed */}
      <div
        data-speed="-0.2"
        className="absolute top-0 right-0 w-[550px] h-full bg-gradient-to-l from-indigo-50/50 via-purple-50/15 to-transparent pointer-events-none"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Text & Categories */}
        <div className="lg:col-span-6">
          {/* Badge with Glitch / ScrambleText */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] text-[11px] font-bold mb-4 shadow-2xs group cursor-pointer"
          >
            <span className="text-sm leading-none animate-pulse">✦</span>
            <ScrambleText triggerOn="hover" duration={0.8}>
              Welcome to Project Hub
            </ScrambleText>
          </div>

          {/* Headline with continuous rotating split-word GSAP animation */}
          <h1
            ref={titleRef}
            className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-[#0F172A] leading-[1.18] mb-3.5"
          >
            Discover{" "}
            <span
              ref={rotatingWordRef}
              className="inline-block bg-gradient-to-r from-[#4338CA] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent"
            >
              Amazing
            </span>{" "}
            <br className="hidden sm:inline" />
            Student Projects
          </h1>

          {/* Subtitle */}
          <p
            ref={descRef}
            className="text-xs sm:text-[13px] text-[#64748B] max-w-md leading-relaxed font-medium mb-8"
          >
            Explore innovative projects built by our talented students.
            Get inspired, learn, and be a part of the journey.
          </p>

          {/* Category Filter Pills with Flip Morphing */}
          <div
            ref={pillsRef}
            className="flex flex-wrap items-center gap-2 sm:gap-2.5"
          >
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`category-pill px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#4338CA] text-white shadow-md shadow-indigo-600/30 scale-105"
                      : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: 3D Floating Isometric Illustration with GSAP Parallax and Speed */}
        <div className="lg:col-span-6 relative flex items-center justify-end min-h-[250px]">
          <div
            data-speed="0.25"
            className="relative w-full h-[250px] sm:h-[280px] flex items-center justify-center lg:justify-end will-change-transform"
          >
            <div
              ref={imageRef}
              className="relative w-full h-full flex items-center justify-center lg:justify-end will-change-transform"
            >
              {/* The clean 3D isometric artwork seamlessly blended with graceful SVG fallback */}
              {!imageError ? (
                <Image
                  src="/assets/dashboard_banner_illustration_clean_1791651742440.jpg"
                  alt="Discover Amazing Student Projects"
                  width={560}
                  height={340}
                  priority
                  onError={() => setImageError(true)}
                  className="object-contain max-h-[270px] scale-105 mix-blend-multiply hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full max-w-[440px] h-[220px] rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200/50 p-6 flex items-center justify-around shadow-sm backdrop-blur-xs">
                  <div className="w-28 h-36 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white flex flex-col justify-between shadow-lg transform -rotate-6">
                    <span className="text-xl font-mono">&lt;/&gt;</span>
                    <div className="space-y-1">
                      <div className="h-1.5 w-12 bg-white/60 rounded" />
                      <div className="h-1.5 w-16 bg-white/40 rounded" />
                    </div>
                  </div>
                  <div className="w-36 h-40 rounded-2xl bg-white border border-slate-200 p-4 shadow-xl transform rotate-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Analytics</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-indigo-100 rounded" />
                      <div className="h-2 w-3/4 bg-purple-100 rounded" />
                      <div className="h-2 w-1/2 bg-blue-100 rounded" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600">SMVITM Showcase</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
