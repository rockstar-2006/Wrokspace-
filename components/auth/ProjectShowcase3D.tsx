"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Code2, Cloud, BarChart2, Box, Rocket, Users, Lightbulb } from "lucide-react";
import { gsap } from "@/lib/gsapUtils";

export default function ProjectShowcase3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Gentle floating loops for 3D elements
      if (card1Ref.current) {
        gsap.to(card1Ref.current, {
          y: -6,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (card2Ref.current) {
        gsap.to(card2Ref.current, {
          y: 5,
          duration: 2.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.4,
        });
      }
      if (card3Ref.current) {
        gsap.to(card3Ref.current, {
          y: -7,
          duration: 3.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.8,
        });
      }
      if (phoneRef.current) {
        gsap.to(phoneRef.current, {
          y: 6,
          rotation: 4,
          duration: 3.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.2,
        });
      }

      // Parallax mouse follow on container
      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        if (card1Ref.current) {
          gsap.to(card1Ref.current, {
            rotateY: x * 8,
            rotateX: -y * 8,
            duration: 0.8,
            ease: "power2.out",
          });
        }
        if (card2Ref.current) {
          gsap.to(card2Ref.current, {
            rotateY: x * 10,
            rotateX: -y * 10,
            duration: 0.8,
            ease: "power2.out",
          });
        }
        if (card3Ref.current) {
          gsap.to(card3Ref.current, {
            rotateY: x * 9,
            rotateX: -y * 9,
            duration: 0.8,
            ease: "power2.out",
          });
        }
      };

      const container = containerRef.current;
      if (!container) return;
      container.addEventListener("mousemove", handleMouseMove);

      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col justify-between p-5 sm:p-7 xl:p-9 overflow-hidden select-none"
      style={{ perspective: "1200px" }}
    >
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-6 left-6 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-orange-200/15 rounded-full blur-3xl pointer-events-none" />

      {/* ── Top Header & Tagline ── */}
      <div className="relative z-10 shrink-0">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-[#0F172A] rounded-[9px] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L2 14L14 18L14 2Z" fill="#818CF8" />
                <path d="M14 18L26 14L14 2V18Z" fill="#C084FC" opacity="0.9" />
                <path d="M14 18L2 14L14 26V18Z" fill="#6366F1" opacity="0.95" />
                <path d="M14 26L26 14L14 18V26Z" fill="#A855F7" />
              </svg>
            </div>
          </div>
          <span className="text-lg font-black tracking-tight text-[#0F172A]">
            Project Hub
          </span>
        </div>

        {/* Small Uppercase Subtitle */}
        <p className="text-[10px] font-black tracking-[0.2em] text-[#818CF8] uppercase mb-1">
          EXPLORE • LEARN • BUILD
        </p>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-black tracking-[-0.03em] text-[#0F172A] leading-[1.12]">
          Your Projects, <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            One{" "}
          </span>
          <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Place.
          </span>
        </h1>

        <p className="mt-1.5 text-[11px] sm:text-xs text-[#64748B] max-w-sm leading-relaxed font-medium">
          Discover, showcase and explore innovative projects from your
          department. Connect, learn and be a part of the journey.
        </p>
      </div>

      {/* ── Center 3D Floating Project Cluster (Spacious, Non-Overlapping) ── */}
      <div className="relative my-auto w-full h-[290px] sm:h-[310px] xl:h-[330px] select-none">
        {/* Floating Ambient Decorative Items */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating Purple Bar Chart */}
          <div
            className="absolute top-2 right-40 px-2.5 py-1.5 rounded-xl bg-indigo-500 text-white shadow-md shadow-indigo-500/25 flex items-center gap-1 animate-bounce"
            style={{ animationDuration: "4s" }}
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </div>

          {/* Floating Orange Cube */}
          <div className="absolute top-6 left-1 w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-400 to-amber-300 shadow-sm shadow-orange-400/25 flex items-center justify-center text-white transform -rotate-12">
            <Box className="w-4 h-4" />
          </div>

          {/* Floating Blue Cloud Folder */}
          <div className="absolute bottom-6 left-[42%] w-10 h-8 rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/25 flex items-center justify-center transform -rotate-6 z-10">
            <Cloud className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 1. Large Card: JourneyBuddy AI (Upper Center-Left) */}
        <div
          ref={card1Ref}
          className="absolute z-20 top-0 left-8 sm:left-12 w-[210px] sm:w-[225px] rounded-2xl bg-white border border-slate-100 shadow-xl p-2.5 transform -rotate-2 hover:scale-105 transition-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Card Window Header */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          {/* Media Banner with Video Play Button */}
          <div className="relative h-20 rounded-xl overflow-hidden mb-2 group">
            <Image
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80"
              alt="JourneyBuddy preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110">
                <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
              </div>
            </div>
          </div>

          {/* Badge & Info */}
          <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-bold block w-max mb-0.5">
            Web Application
          </span>
          <h4 className="text-xs font-black text-[#0F172A] leading-tight">
            JourneyBuddy AI
          </h4>
          <p className="text-[9px] text-[#64748B] mb-1.5">
            AI Travel Assistant
          </p>

          {/* Tags */}
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[8px] font-medium">
              React
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[8px] font-medium">
              FastAPI
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[8px] font-medium">
              Firebase
            </span>
          </div>
        </div>

        {/* 2. Floating Phone Mockup (Top Far-Right, Fully Visible) */}
        <div
          ref={phoneRef}
          className="absolute z-20 top-1 right-2 sm:right-4 w-[95px] sm:w-[106px] h-[160px] sm:h-[172px] rounded-2xl bg-[#0F172A] p-1.5 shadow-2xl border-2 border-slate-800 text-white flex flex-col justify-between transform rotate-3 hover:scale-105 transition-transform"
        >
          {/* Phone Speaker Notch */}
          <div className="w-7 h-1 rounded-full bg-slate-700 mx-auto" />
          <div className="p-0.5">
            <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">
              Explore
            </p>
            <p className="text-[8px] font-black leading-tight">
              Your Next Trip
            </p>
          </div>
          <div className="relative h-20 sm:h-22 rounded-lg overflow-hidden shadow-inner">
            <Image
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80"
              alt="Mobile Screen"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-4 h-0.5 rounded-full bg-slate-700 mx-auto" />
        </div>

        {/* 3. Bottom-Left Card: CropMate (Far Left) */}
        <div
          ref={card2Ref}
          className="absolute z-20 bottom-1 left-0 sm:left-2 w-[130px] sm:w-[138px] rounded-2xl bg-[#0F172A] text-white p-2.5 shadow-xl border border-slate-700 transform -rotate-4 hover:scale-105 transition-transform"
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[8px] font-bold block w-max mb-0.5">
            Mobile App
          </span>
          <h5 className="text-[11px] font-black leading-tight">CropMate</h5>
          <p className="text-[8px] text-slate-400 mb-1.5">Smart Agriculture</p>
          <div className="flex flex-wrap gap-1">
            <span className="text-[7px] px-1 py-0.5 rounded bg-slate-800 text-slate-300">
              Python
            </span>
            <span className="text-[7px] px-1 py-0.5 rounded bg-slate-800 text-slate-300">
              TensorFlow
            </span>
          </div>
        </div>

        {/* 4. Bottom Center-Right Card: Guardian AI (Completely clear of Phone Mockup) */}
        <div
          ref={card3Ref}
          className="absolute z-25 bottom-1 right-28 sm:right-32 w-[135px] sm:w-[145px] rounded-2xl bg-white p-2.5 shadow-2xl border border-slate-100 transform -rotate-1 hover:scale-105 transition-transform"
        >
          <div className="relative h-13 rounded-lg overflow-hidden mb-1">
            <Image
              src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80"
              alt="Guardian AI"
              fill
              className="object-cover"
            />
          </div>
          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[8px] font-bold block w-max mb-0.5">
            Hardware
          </span>
          <h5 className="text-[11px] font-black text-[#0F172A] leading-tight">Guardian AI</h5>
          <p className="text-[8px] text-slate-500 mb-1">CCTV Surveillance</p>
          <div className="flex flex-wrap gap-1">
            <span className="text-[7px] px-1 py-0.5 rounded bg-slate-100 text-slate-700">
              YOLOv8
            </span>
            <span className="text-[7px] px-1 py-0.5 rounded bg-slate-100 text-slate-700">
              Python
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom 3 Feature Pillars (Exact from Image 1) ── */}
      <div className="relative z-10 pt-3 border-t border-slate-200/60 grid grid-cols-3 gap-2 shrink-0">
        {/* Pillar 1 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs shrink-0">
            <Rocket className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-[#0F172A] leading-tight">Showcase</p>
            <p className="text-[10px] text-[#64748B] leading-tight">Your Innovation</p>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-[#0F172A] leading-tight">Learn From</p>
            <p className="text-[10px] text-[#64748B] leading-tight">Your Peers</p>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-[#0F172A] leading-tight">Build Your</p>
            <p className="text-[10px] text-[#64748B] leading-tight">Future</p>
          </div>
        </div>
      </div>
    </div>
  );
}
