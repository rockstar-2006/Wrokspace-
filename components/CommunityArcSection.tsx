"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Sparkles, Star, Github, ArrowUpRight } from "lucide-react";
import { STUDENT_CREATORS } from "@/lib/data";

export default function CommunityArcSection() {
  const [activeCreator, setActiveCreator] = useState<number>(0);

  // Arched positions around the headline
  const avatarPositions = [
    { x: -280, y: 70, rot: -16 },
    { x: -170, y: -20, rot: -8 },
    { x: -55, y: -60, rot: -2 },
    { x: 55, y: -60, rot: 2 },
    { x: 170, y: -20, rot: 8 },
    { x: 280, y: 70, rot: 16 },
  ];

  return (
    <section id="creators" className="py-24 md:py-36 px-4 max-w-7xl mx-auto w-full text-center relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-coral/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Center text container */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/10 text-xs font-bold uppercase tracking-wider text-charcoal mb-4 shadow-sm">
          <Users className="w-3.5 h-3.5 text-coral" />
          <span>DEPARTMENT INNOVATORS</span>
        </div>

        {/* The Exact Headline from 0:21-0:23 in the video */}
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-charcoal leading-tight">
          You will find yourself <br />
          <span className="text-coral">among us.</span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-charcoal-muted max-w-lg mx-auto">
          From first-year hackers to graduating finalists. Join over 300+ student
          builders sharing their proudest work.
        </p>
      </div>

      {/* The Curved Avatar Arc (0:21 - 0:23 in video) */}
      <div className="relative mt-16 h-[260px] sm:h-[300px] flex items-center justify-center">
        {STUDENT_CREATORS.map((creator, idx) => {
          const pos = avatarPositions[idx % avatarPositions.length];
          const isSelected = activeCreator === idx;

          return (
            <motion.div
              key={idx}
              onMouseEnter={() => setActiveCreator(idx)}
              animate={{
                x: pos.x,
                y: pos.y,
                rotate: isSelected ? 0 : pos.rot,
                scale: isSelected ? 1.25 : 1,
                zIndex: isSelected ? 40 : 10 + idx,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="absolute cursor-pointer group"
            >
              <div
                className={`relative w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl p-1 bg-white border shadow-card transition-all ${
                  isSelected ? "border-coral ring-4 ring-coral/20" : "border-black/10 hover:border-black/20"
                }`}
              >
                <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-200">
                  <Image
                    src={creator.avatar}
                    alt={creator.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Little Batch Tag */}
                <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-full bg-charcoal text-[9px] font-bold text-white shadow-sm">
                  {creator.batch.replace("Batch ", "")}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Creator Detail Card (Matches popup profile badges in video 0:31-0:34) */}
      <motion.div
        key={activeCreator}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="mt-6 inline-flex items-center gap-4 px-5 py-3 rounded-2xl bg-white border border-black/10 shadow-card text-left"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden relative border border-black/10">
          <Image
            src={STUDENT_CREATORS[activeCreator].avatar}
            alt={STUDENT_CREATORS[activeCreator].name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm text-charcoal">
              {STUDENT_CREATORS[activeCreator].name}
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-coral/10 text-coral text-[10px] font-bold">
              {STUDENT_CREATORS[activeCreator].batch}
            </span>
          </div>
          <p className="text-xs text-charcoal-muted font-medium">
            Project: <strong className="text-charcoal font-semibold">{STUDENT_CREATORS[activeCreator].project}</strong> • {STUDENT_CREATORS[activeCreator].role}
          </p>
        </div>
        <div className="pl-3 border-l border-black/10 text-right">
          <span className="text-[10px] text-charcoal-muted uppercase block font-semibold">Reputation</span>
          <span className="text-xs font-extrabold text-charcoal">{STUDENT_CREATORS[activeCreator].followers}</span>
        </div>
      </motion.div>
    </section>
  );
}
