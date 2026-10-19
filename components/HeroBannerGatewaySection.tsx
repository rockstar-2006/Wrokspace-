"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export default function HeroBannerGatewaySection() {
  return (
    <section id="featured" className="py-16 md:py-24 px-6 sm:px-12 max-w-[1440px] mx-auto w-full">
      {/* 1. Header (Exact from Image 3) */}
      <div className="mb-10 text-left">
        <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#71747E] block mb-4">
          CLASS BY REATHA C. PHELAN
        </span>

        <h2 className="text-5xl sm:text-7xl md:text-[80px] font-extrabold tracking-[-0.04em] leading-[1.02]">
          <span className="text-[#111215]">Gateway to</span> <br />
          <span className="text-[#111215]">artist </span>
          <span className="text-[#8E929E]">people.</span>
        </h2>
      </div>

      {/* 2. THE EXPANDING TERRACOTTA BANNER (Exact from Image 3) */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0.9 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full rounded-3xl md:rounded-[36px] bg-[#EE5838] overflow-hidden text-white shadow-2xl min-h-[380px] sm:min-h-[500px] flex items-center justify-center p-6 sm:p-12 select-none"
      >
        {/* Top-Left Pinned: Vertical Segmented Pill (Exact from Image 3) */}
        <div className="absolute top-6 left-6 z-30 w-8 sm:w-9 h-14 sm:h-16 rounded-full overflow-hidden flex flex-col border border-white/20 shadow-md">
          <div className="w-full h-1/2 bg-white" />
          <div className="w-full h-1/2 bg-[#121316]" />
        </div>

        {/* Top-Right Pinned: Three Dots '...' (Exact from Image 3) */}
        <div className="absolute top-6 right-6 z-30 text-white/80 hover:text-white cursor-pointer">
          <MoreHorizontal className="w-6 h-6" />
        </div>

        {/* Central High-Resolution Artist Portrait (Exact composition from Image 3) */}
        <div className="relative w-full max-w-[560px] h-[320px] sm:h-[450px] mx-auto flex items-center justify-center">
          <Image
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85"
            alt="Artist Portrait with Sunglasses"
            fill
            className="object-cover rounded-2xl"
            priority
          />
        </div>

        {/* Bottom-Left Pinned: "Watch" Pill Button (Exact from Image 3) */}
        <div className="absolute bottom-6 left-6 z-30">
          <button className="px-6 py-2 rounded-full bg-white text-[#111215] text-xs font-bold border border-white/80 hover:bg-neutral-100 shadow-md transition-all">
            Watch
          </button>
        </div>

        {/* Bottom-Right Pinned: Circular Arrows '<' and '>' (Exact from Image 3) */}
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2.5">
          <button
            aria-label="Previous slide"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#111215] flex items-center justify-center hover:bg-neutral-100 shadow-md transition-transform hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5 text-[#111215]" />
          </button>
          <button
            aria-label="Next slide"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#111215] flex items-center justify-center hover:bg-neutral-100 shadow-md transition-transform hover:scale-105"
          >
            <ChevronRight className="w-5 h-5 text-[#111215]" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
