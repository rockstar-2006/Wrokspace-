"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import SpeechTag from "@/components/SpeechTag";
import { ORIGINAL_HERO_CARDS } from "@/lib/data";

interface HeroIntroProps {
  onExploreClick?: () => void;
}

export default function HeroIntroSection({ onExploreClick }: HeroIntroProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Entrance animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <section className="relative pt-6 pb-20 sm:pt-10 sm:pb-28 flex flex-col items-center text-center px-4 overflow-hidden w-full max-w-[1440px] mx-auto min-h-[85vh] justify-between">
      {/* 1. Main Headline (Exact phrasing & geometry from Image 1) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto z-10 pt-2"
      >
        <h1 className="text-5xl sm:text-7xl md:text-[84px] font-extrabold tracking-[-0.045em] text-[#111215] leading-[1.04]">
          A place to display your <br />
          masterpiece.
        </h1>
      </motion.div>

      {/* 2. THE 7 FULL-BLEED ART CARDS WITH 3D PERSPECTIVE & SPEECH BUBBLES */}
      <div className="relative mt-8 sm:mt-12 w-full max-w-5xl h-[310px] sm:h-[360px] flex items-center justify-center">
        {/* Soft shadow base grounding the deck */}
        <div className="absolute bottom-4 w-[740px] h-12 bg-black/10 blur-2xl rounded-full pointer-events-none -z-10" />

        {/* Floating Speech Bubble 1: @coplin (Exact from Image 1, blue #2F6FED) */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
          className="absolute -top-4 left-[24%] sm:left-[27%] z-30 pointer-events-none"
        >
          <SpeechTag text="@coplin" color="#2F6FED" />
        </motion.div>

        {/* Floating Speech Bubble 2: @andrea (Exact from Image 1, green #57A37C) */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
          className="absolute -top-3 right-[18%] sm:right-[22%] z-30 pointer-events-none"
        >
          <SpeechTag text="@andrea" color="#57A37C" />
        </motion.div>

        {/* The Card Fan Deck with GSAP / Framer Spring Physics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative w-full h-full flex items-center justify-center perspective-[1200px]"
        >
          {ORIGINAL_HERO_CARDS.map((card, idx) => {
            const isHovered = hoveredIdx === idx;
            const anyHovered = hoveredIdx !== null;

            const currentRot = isHovered
              ? 0
              : anyHovered
              ? card.baseRotate * 1.25
              : card.baseRotate;
            const currentX = isHovered
              ? card.baseX * 1.15
              : anyHovered
              ? card.baseX * 1.05
              : card.baseX;
            const currentY = isHovered ? -32 : card.baseY;
            const currentScale = isHovered ? 1.14 : anyHovered ? 0.94 : 1;
            const currentZ = isHovered ? 60 : card.zIndex;

            return (
              <motion.div
                key={card.id}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                // Entrance animation from cluster to fan-out
                initial={{ y: 160, rotate: 0, opacity: 0, scale: 0.8 }}
                animate={{
                  x: currentX,
                  y: currentY,
                  rotate: currentRot,
                  scale: currentScale,
                  opacity: 1,
                  zIndex: currentZ,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 22,
                  mass: 0.7,
                }}
                className={`absolute w-[165px] sm:w-[200px] h-[225px] sm:h-[270px] rounded-[22px] sm:rounded-3xl overflow-hidden cursor-pointer select-none transition-shadow duration-300 ${
                  isHovered ? "art-card-shadow-active ring-2 ring-black/10" : "art-card-shadow"
                }`}
                style={{
                  transformOrigin: "bottom center",
                }}
              >
                {/* Full-bleed edge-to-edge artwork - NO white borders, NO text footers */}
                <div className="relative w-full h-full bg-slate-900 overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 640px) 165px, 200px"
                    className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 3. Subtitle Text BELOW the cards (Exact from Image 1) */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-6 text-xs sm:text-sm md:text-[15px] text-[#71747E] font-medium max-w-xl mx-auto tracking-tight"
      >
        Artists can display their masterpieces, and buyers can{" "}
        <span className="text-[#111215] font-semibold">discover and</span> acquire
      </motion.p>

      {/* 4. Single Dark CTA Pill + Read more (Exact from Image 1) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 pb-2"
      >
        <button
          onClick={onExploreClick}
          className="px-7 py-3 rounded-full bg-[#121316] text-white text-xs sm:text-[13px] font-semibold hover:bg-black transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 tracking-tight"
        >
          Join for $9.99/m
        </button>

        <a
          href="#explore"
          className="text-xs text-[#8E929E] hover:text-[#111215] font-medium transition-colors"
        >
          Read more
        </a>
      </motion.div>
    </section>
  );
}
