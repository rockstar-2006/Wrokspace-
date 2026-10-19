"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import SpeechTag from "@/components/SpeechTag";

export default function MarketplaceTransitionSection() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const showcaseCards = [
    {
      id: "card-bosch",
      title: "Bosch Breugel 1990",
      image: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=700&q=85",
      authorTag: "@howard",
      tagColor: "#B8281A",
      tagPos: { top: "-18px", left: "12%" },
    },
    {
      id: "card-neunoir",
      title: "Neu Noir 3D",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=700&q=85",
      authorTag: null,
      tagColor: null,
      tagPos: null,
    },
    {
      id: "card-collage",
      title: "Punk Collage '24",
      image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=700&q=85",
      authorTag: "@robin",
      tagColor: "#111215",
      tagPos: { top: "-18px", right: "14%" },
    },
    {
      id: "card-vangogh",
      title: "Impressionist Oil",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=700&q=85",
      authorTag: null,
      tagColor: null,
      tagPos: null,
    },
    {
      id: "card-yellow",
      title: "Friends Pop Art",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=700&q=85",
      authorTag: null,
      tagColor: null,
      tagPos: null,
    },
  ];

  return (
    <section id="explore" className="py-24 md:py-32 px-6 sm:px-12 max-w-[1440px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Headline and Pitch (Exact from Image 2) */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#71747E] mb-5">
            E-COMMERCE
          </span>

          <h2 className="text-4xl sm:text-6xl md:text-[68px] font-extrabold tracking-[-0.04em] text-[#111215] leading-[1.04]">
            Showcase, Sell, <br />
            <span className="text-[#A82218]">&amp; acquire arts to</span> <br />
            our marketplace.
          </h2>

          <p className="mt-8 text-sm sm:text-base text-[#71747E] leading-relaxed max-w-lg font-normal">
            Dynamic community where artists and buyers seamlessly merge. ArtFusion brings together creators and enthusiasts to share creativity.
          </p>

          <div className="mt-10 flex items-center gap-5">
            <button className="px-7 py-3 rounded-full bg-[#121316] text-white text-xs sm:text-[13px] font-semibold hover:bg-black transition-all shadow-md">
              Join for $9.99/m
            </button>
            <a
              href="#featured"
              className="text-xs text-[#8E929E] hover:text-[#111215] font-medium transition-colors"
            >
              Read more
            </a>
          </div>
        </div>

        {/* Right Column: Stacked Cards with Speech Bubbles (Exact from Image 2) */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[440px]">
          {/* Card Stack Container */}
          <div className="relative w-full max-w-[460px] h-[340px] sm:h-[380px] flex items-center justify-center">
            {showcaseCards.map((c, idx) => {
              // Staggered horizontal offset
              const xOffset = (idx - 1.5) * 60;
              const yOffset = idx * 10;
              const zIdx = 30 - idx;

              return (
                <motion.div
                  key={c.id}
                  animate={{
                    x: xOffset,
                    y: yOffset,
                    scale: 1 - idx * 0.04,
                    zIndex: zIdx,
                  }}
                  transition={{ type: "spring", stiffness: 240, damping: 22 }}
                  className="absolute w-[200px] sm:w-[230px] h-[260px] sm:h-[300px] rounded-[24px] overflow-hidden art-card-shadow bg-white border border-black/10 select-none group cursor-pointer"
                >
                  <div className="relative w-full h-full bg-slate-900">
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  {/* Speech bubble tag if assigned */}
                  {c.authorTag && c.tagPos && (
                    <div
                      className="absolute z-40"
                      style={c.tagPos}
                    >
                      <SpeechTag text={c.authorTag} color={c.tagColor!} />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Pinned Vertical Chevron Arrows on the far right (Exact from Image 2) */}
            <div className="absolute -right-2 sm:-right-6 flex flex-col gap-2 z-40">
              <button
                onClick={() => setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : showcaseCards.length - 1))}
                aria-label="Previous card"
                className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#71747E] hover:text-[#111215] shadow-sm hover:scale-105 transition-all"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveCardIndex((prev) => (prev < showcaseCards.length - 1 ? prev + 1 : 0))}
                aria-label="Next card"
                className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#71747E] hover:text-[#111215] shadow-sm hover:scale-105 transition-all"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
