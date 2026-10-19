"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Tag, Sparkles, Grid, Sun, Waves } from "lucide-react";
import SpeechTag from "@/components/SpeechTag";
import { PARTNER_LOGOS } from "@/lib/data";

export default function LogoCarouselCopyRevealSection() {
  const [unstacked, setUnstacked] = useState(false);

  const middleDeckCards = [
    {
      id: "deck-blue",
      title: "Fluffy Worm",
      accent: "#2055DE",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=85",
      x: 0,
      y: 0,
      rot: 0,
      z: 30,
    },
    {
      id: "deck-green",
      title: "Chlorophyll",
      accent: "#2A9D8F",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=700&q=85",
      x: -30,
      y: 12,
      rot: -5,
      z: 25,
    },
    {
      id: "deck-orange",
      title: "Citrus Pop",
      accent: "#E76F51",
      image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=700&q=85",
      x: -60,
      y: 24,
      rot: -10,
      z: 20,
    },
    {
      id: "deck-yellow",
      title: "Friends Pack",
      accent: "#E9C46A",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=700&q=85",
      x: -90,
      y: 36,
      rot: -15,
      z: 15,
    },
    {
      id: "deck-bw",
      title: "Type Archive",
      accent: "#264653",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=700&q=85",
      x: -120,
      y: 48,
      rot: -20,
      z: 10,
    },
  ];

  return (
    <section className="py-24 md:py-36 px-6 sm:px-12 max-w-[1440px] mx-auto w-full text-center overflow-hidden">
      {/* 1. "Trusted by the best." Partner Logo Carousel (Exact from Image 4) */}
      <div className="mb-28 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] text-[#111215]">
              Trusted by the best.
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-[#8E929E] max-w-md">
              Our growth hackers are experts in the identifying and capitalizing on the most
            </p>
          </div>

          {/* Right circular arrows '<' and '>' (Exact from Image 4) */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              aria-label="Previous logo"
              className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center text-[#71747E] hover:text-[#111215] hover:bg-neutral-50 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              aria-label="Next logo"
              className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center text-[#71747E] hover:text-[#111215] hover:bg-neutral-50 transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Infinite Continuous Logo Marquee */}
        <div className="w-full overflow-hidden flex items-center py-4 border-b border-black/5">
          <div className="flex items-center gap-16 sm:gap-24 animate-marquee w-max">
            {PARTNER_LOGOS.concat(PARTNER_LOGOS).map((logo, idx) => (
              <span
                key={idx}
                className="text-base sm:text-xl font-bold tracking-tight text-[#8E929E] uppercase select-none opacity-60 hover:opacity-100 transition-opacity"
              >
                {logo.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Central Narrative Block with 3D Deck Dropping in the Middle (Exact from Image 5) */}
      <div
        className="relative max-w-4xl mx-auto py-12 cursor-pointer select-none"
        onMouseEnter={() => setUnstacked(true)}
        onMouseLeave={() => setUnstacked(false)}
        onClick={() => setUnstacked(!unstacked)}
      >
        {/* Floating Speech Bubble: @alician (Exact from Image 5, black #111215) */}
        <div className="absolute top-2 left-[12%] sm:left-[18%] z-40">
          <SpeechTag text="@alician" color="#111215" />
        </div>

        {/* Floating Speech Bubble: @andrea (Exact from Image 5, blue #2055DE) */}
        <div className="absolute top-6 right-[8%] sm:right-[15%] z-40">
          <SpeechTag text="@andrea" color="#2055DE" />
        </div>

        {/* Central 3D Deck of Cards (Exact from Image 5) */}
        <div className="relative my-10 h-[340px] sm:h-[400px] flex items-center justify-center">
          {middleDeckCards.map((c, i) => {
            const spreadX = unstacked ? (i - 2) * 110 : c.x;
            const spreadY = unstacked ? 0 : c.y;
            const spreadRot = unstacked ? (i - 2) * 8 : c.rot;

            return (
              <motion.div
                key={c.id}
                animate={{
                  x: spreadX,
                  y: spreadY,
                  rotate: spreadRot,
                  scale: unstacked ? 1.05 : 1,
                  zIndex: c.z,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="absolute w-[200px] sm:w-[240px] h-[270px] sm:h-[320px] rounded-3xl overflow-hidden art-card-shadow bg-white border border-black/10 select-none group"
              >
                <div className="relative w-full h-full bg-slate-900">
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    className="object-cover"
                  />
                  {/* Fluffy Worm Text Overlay for top card */}
                  {i === 0 && (
                    <div className="absolute top-4 left-4 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/90 block">
                        FLUFFY WORM
                      </span>
                      <span className="text-[9px] text-white/70">POSTER TEMPLATE</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Typography Block with Inline Embellishments (Exact from Image 5) */}
        <h2 className="text-3xl sm:text-5xl md:text-[54px] font-extrabold tracking-[-0.04em] text-[#111215] leading-[1.14] mt-6">
          Whether you&apos;re an artist looking to sell your work <br />
          / or buyer seeking{" "}
          <span className="text-[#12B886] inline-flex items-center gap-1 font-extrabold">
            unique pieces
            <span className="inline-block text-base">🏺</span>
          </span>{" "}
          connects <br />
          you to world of creativity{" "}
          <span className="text-[#E76F51] inline-flex items-center gap-1 font-extrabold">
            commerce.
            <Tag className="w-5 h-5 inline text-[#E76F51] fill-[#E76F51]/20 -rotate-45" />
          </span>
        </h2>

        {/* Bottom Pill Dock with 3 circular icons (Exact from Image 5) */}
        <div className="mt-14 inline-flex items-center gap-4 p-2 px-4 rounded-full bg-white border border-black/10 shadow-sm">
          <button aria-label="Feature 1" className="p-2 rounded-full hover:bg-neutral-100 text-[#111215] transition-colors">
            <Sun className="w-4 h-4" />
          </button>
          <button aria-label="Feature 2" className="p-2 rounded-full hover:bg-neutral-100 text-[#111215] transition-colors">
            <Grid className="w-4 h-4" />
          </button>
          <button aria-label="Feature 3" className="p-2 rounded-full hover:bg-neutral-100 text-[#111215] transition-colors">
            <Waves className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
