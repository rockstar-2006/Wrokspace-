"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Star, ExternalLink, Flame, CheckCircle2 } from "lucide-react";
import { HERO_CARDS } from "@/lib/data";

export default function HeroSection() {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  return (
    <section className="relative pt-12 pb-24 md:pt-16 md:pb-32 overflow-hidden flex flex-col items-center text-center px-4">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-coral/15 via-lime/20 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Small Category Pill */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/10 shadow-sm mb-6"
      >
        <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
        <span className="text-xs font-semibold tracking-wide text-charcoal uppercase">
          Department Innovation Registry 2026
        </span>
      </motion.div>

      {/* Main Headline (Exact phrasing & typography from the inspiration) */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-charcoal max-w-4xl mx-auto leading-[1.08]"
      >
        A place to display your <br className="hidden sm:inline" />
        <span className="relative inline-block">
          masterpiece.
          <span className="absolute -bottom-1 left-0 right-0 h-2 bg-lime -z-10 rounded-full rotate-[-1deg]" />
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 text-base sm:text-lg md:text-xl text-charcoal-muted max-w-2xl mx-auto leading-relaxed"
      >
        Curated department project registry. Students publish live builds and APKs,
        judges score with fair rubrics, and juniors never repeat old work.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <a
          href="#projects"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-charcoal text-white text-sm font-semibold hover:bg-black transition-all shadow-card hover:shadow-card-hover hover:-translate-y-0.5"
        >
          <span>Explore Registry</span>
          <ArrowRight className="w-4 h-4 text-lime" />
        </a>

        <a
          href="#submit"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-charcoal text-sm font-semibold border border-black/10 hover:bg-canvas-subtle transition-all shadow-sm hover:-translate-y-0.5"
        >
          <Sparkles className="w-4 h-4 text-coral" />
          <span>Submit Your Project</span>
        </a>
      </motion.div>

      {/* THE INTERACTIVE FANNING CARD DECK (0:00 - 0:03 in Dribbble reference) */}
      <div className="relative mt-16 md:mt-24 w-full max-w-4xl h-[340px] sm:h-[400px] flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center perspective-[1200px]">
          {HERO_CARDS.map((card, index) => {
            const isHovered = hoveredCardId === card.id;
            const anyHovered = hoveredCardId !== null;

            // Compute dynamic fanning transformation
            // When hovered, the cards fan out wider; the active card lifts up and straightens
            const currentRot = isHovered ? 0 : anyHovered ? card.rot * 1.3 : card.rot;
            const currentX = isHovered
              ? card.xOffset * 1.5
              : anyHovered
              ? card.xOffset * 1.25
              : card.xOffset;
            const currentY = isHovered ? -35 : card.yOffset;
            const currentScale = isHovered ? 1.08 : anyHovered ? 0.94 : 1;
            const currentZ = isHovered ? 50 : index * 10;

            return (
              <motion.div
                key={card.id}
                onMouseEnter={() => setHoveredCardId(card.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                animate={{
                  x: currentX,
                  y: currentY,
                  rotate: currentRot,
                  scale: currentScale,
                  zIndex: currentZ,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  mass: 0.8,
                }}
                className="absolute w-[200px] sm:w-[240px] h-[270px] sm:h-[320px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover border border-black/10 bg-white group select-none transition-shadow duration-300"
                style={{
                  transformOrigin: "bottom center",
                }}
              >
                {/* Image Background */}
                <div className="relative w-full h-[62%] overflow-hidden bg-slate-900">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 640px) 200px, 240px"
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    priority={index === 2}
                  />
                  {/* Subtle top pill badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-charcoal bg-white/95 backdrop-blur-md shadow-sm border border-black/5 uppercase">
                      {card.label}
                    </span>
                  </div>

                  {/* Stars Pill */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-black/60 backdrop-blur-md">
                    <Star className="w-2.5 h-2.5 fill-lime text-lime" />
                    <span>{card.stars}</span>
                  </div>
                </div>

                {/* Card Bottom Meta */}
                <div className="p-3 sm:p-3.5 flex flex-col justify-between h-[38%] bg-white text-left">
                  <div>
                    <span className="text-[10px] font-medium text-charcoal-muted uppercase tracking-wider block">
                      {card.category}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-charcoal tracking-tight truncate group-hover:text-coral transition-colors">
                      {card.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-black/5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {card.badge}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-canvas-subtle flex items-center justify-center group-hover:bg-coral group-hover:text-white transition-colors">
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Helpful Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-charcoal-muted mt-2 tracking-wide font-medium flex items-center gap-1.5"
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime" />
        Hover or tap cards to fan out and explore finalist builds
      </motion.p>
    </section>
  );
}
