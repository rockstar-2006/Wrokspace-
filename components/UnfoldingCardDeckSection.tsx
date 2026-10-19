"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Layers, Sparkles, Star, GitBranch, ShieldCheck } from "lucide-react";

export default function UnfoldingCardDeckSection() {
  const [isSpread, setIsSpread] = useState(false);

  const cards = [
    {
      id: "deck-1",
      tag: "AUDITED CODE",
      title: "Clean Repositories",
      desc: "Mandatory README, license, and branch guidelines.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      color: "#111215",
      xSpread: -320,
      rot: -8,
    },
    {
      id: "deck-2",
      tag: "STAFF PICK",
      title: "Faculty Endorsed",
      desc: "Vetted by subject professors for novel logic.",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
      color: "#FF5238",
      xSpread: -160,
      rot: -4,
    },
    {
      id: "deck-3",
      tag: "ANDROID APK",
      title: "Signed Releases",
      desc: "Downloadable APK binaries linked to GitHub releases.",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80",
      color: "#10B981",
      xSpread: 0,
      rot: 0,
    },
    {
      id: "deck-4",
      tag: "BATCH 2026",
      title: "Annual Archive",
      desc: "Archived across years so juniors never duplicate old work.",
      image: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=600&q=80",
      color: "#F59E0B",
      xSpread: 160,
      rot: 4,
    },
    {
      id: "deck-5",
      tag: "AI BENCHMARKS",
      title: "Reproducible Weights",
      desc: "Verifiable weights and inference benchmarks.",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
      color: "#6366F1",
      xSpread: 320,
      rot: 8,
    },
  ];

  return (
    <section className="py-24 md:py-32 px-4 sm:px-8 max-w-7xl mx-auto w-full text-center overflow-hidden">
      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas-subtle border border-black/10 text-xs font-bold uppercase tracking-wider text-charcoal mb-4">
          <Layers className="w-3.5 h-3.5 text-coral" />
          <span>PROJECT LIFECYCLE</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-charcoal leading-tight">
          Whether you&apos;re a junior seeking past solutions, <br />
          or a judge scoring finalists —
        </h2>

        <p className="mt-4 text-base sm:text-lg text-charcoal-muted max-w-xl mx-auto">
          ProjectHub connects your college department to verified excellence. Tap or hover below to unfold the standards deck.
        </p>
      </div>

      {/* The Unfolding Card Deck (0:13 - 0:17 in video) */}
      <div
        className="relative mt-16 md:mt-24 h-[420px] sm:h-[460px] flex items-center justify-center cursor-pointer select-none"
        onMouseEnter={() => setIsSpread(true)}
        onMouseLeave={() => setIsSpread(false)}
        onClick={() => setIsSpread(!isSpread)}
      >
        <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
          {cards.map((card, idx) => {
            return (
              <motion.div
                key={card.id}
                animate={{
                  x: isSpread ? card.xSpread : (idx - 2) * 16,
                  y: isSpread ? 0 : idx * 6,
                  rotate: isSpread ? card.rot : (idx - 2) * 3,
                  scale: isSpread ? 1 : 1 - Math.abs(idx - 2) * 0.05,
                  zIndex: isSpread ? 10 + idx : 30 - Math.abs(idx - 2),
                }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 22,
                }}
                className="absolute w-[220px] sm:w-[250px] h-[320px] sm:h-[370px] rounded-3xl bg-white border border-black/10 shadow-card hover:shadow-card-hover overflow-hidden flex flex-col justify-between p-3.5 group transition-shadow duration-300"
              >
                {/* Image Area */}
                <div className="relative w-full h-[60%] rounded-2xl overflow-hidden bg-slate-900">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="250px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-charcoal bg-white/95 backdrop-blur-md shadow-sm uppercase">
                      {card.tag}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-2 text-left flex flex-col justify-between h-[40%]">
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-charcoal group-hover:text-coral transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-xs text-charcoal-muted mt-1 leading-snug line-clamp-2">
                      {card.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-charcoal-muted pt-2 border-t border-black/5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Submission Standard</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-charcoal-muted font-medium">
        <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
        <span>{isSpread ? "Hover outside to collapse deck" : "Hover or click above to fan out the deck"}</span>
      </div>
    </section>
  );
}
