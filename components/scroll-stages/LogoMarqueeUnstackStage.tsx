"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight, Tag, Sun, Grid, Waves } from "lucide-react";
import { gsap, ScrollTrigger, Draggable } from "@/lib/gsapUtils";
import SpeechTag from "@/components/SpeechTag";
import { PARTNER_LOGOS } from "@/lib/data";

export default function LogoMarqueeUnstackStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeHeaderRef = useRef<HTMLDivElement>(null);
  const narrativeTextRef = useRef<HTMLHeadingElement>(null);
  const unstackAreaRef = useRef<HTMLDivElement>(null);

  /* ── GSAP ScrollTrigger Text Animations ────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Partner Marquee Header Reveal
      const marqueeHeaderEl = marqueeHeaderRef.current;
      if (marqueeHeaderEl) {
        gsap.fromTo(
          marqueeHeaderEl.children,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            stagger: 0.1,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: marqueeHeaderEl,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 2. Narrative Text Reveal
      const narrativeTextEl = narrativeTextRef.current;
      if (narrativeTextEl) {
        gsap.fromTo(
          narrativeTextEl,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: narrativeTextEl,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  /* ── Interactive Physics: Draggable unstacked cards and speech tags ── */
  useEffect(() => {
    if (typeof window === "undefined" || !unstackAreaRef.current) return;

    const cards = unstackAreaRef.current.querySelectorAll(".draggable-unstack-card");
    const draggables: any[] = [];

    cards.forEach((card) => {
      const d = Draggable.create(card, {
        type: "x,y",
        edgeResistance: 0.65,
        cursor: "grab",
        activeCursor: "grabbing",
        onDrag: function () {
          gsap.to(this.target, {
            scale: 1.05,
            duration: 0.1,
            overwrite: "auto",
          });
        },
        onDragEnd: function () {
          gsap.to(this.target, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.75,
            ease: "elastic.out(1, 0.4)",
          });
        },
      });
      if (d && d[0]) draggables.push(d[0]);
    });

    const tags = unstackAreaRef.current.querySelectorAll(".draggable-speech-tag");
    tags.forEach((tag) => {
      const d = Draggable.create(tag, {
        type: "x,y",
        edgeResistance: 0.7,
        cursor: "grab",
        activeCursor: "grabbing",
        onDragEnd: function () {
          gsap.to(this.target, {
            x: 0,
            y: 0,
            duration: 0.75,
            ease: "elastic.out(1, 0.4)",
          });
        },
      });
      if (d && d[0]) draggables.push(d[0]);
    });

    return () => {
      draggables.forEach((d) => d?.kill());
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.6,
  });

  // 3D Deck Drop down into text: (progress 0.15 -> 0.4)
  const deckDropY = useTransform(smoothProgress, [0.15, 0.45], [-60, 0]);
  const deckOpacity = useTransform(smoothProgress, [0.15, 0.35], [0, 1]);

  // 3D Flip & Unstack tied to scroll progress (rotateX -45deg -> 0deg, vertical unstack offsets)
  const cardRotateX = useTransform(smoothProgress, [0.35, 0.75], [-45, 0]);
  const unstackOffset = useTransform(smoothProgress, [0.35, 0.75], [0, 36]);

  const cards = [
    {
      id: "deck-blue",
      title: "Distributed Vector DB",
      accent: "#2055DE",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=85",
      yBase: 0,
      rotBase: 0,
      z: 30,
    },
    {
      id: "deck-green",
      title: "Generative UI Canvas",
      accent: "#2A9D8F",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=700&q=85",
      yBase: 12,
      rotBase: -5,
      z: 25,
    },
    {
      id: "deck-orange",
      title: "Smart Agent Orchestrator",
      accent: "#E76F51",
      image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=700&q=85",
      yBase: 24,
      rotBase: -10,
      z: 20,
    },
    {
      id: "deck-yellow",
      title: "Micro-SaaS Starter Hub",
      accent: "#E9C46A",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=700&q=85",
      yBase: 36,
      rotBase: -15,
      z: 15,
    },
    {
      id: "deck-bw",
      title: "Enterprise Design System",
      accent: "#264653",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=85",
      yBase: 48,
      rotBase: -20,
      z: 10,
    },
  ];

  const d0y = useTransform(unstackOffset, (v) => 0 + (0 - 2) * v);
  const d0x = useTransform(unstackOffset, (v) => (0 - 2) * v * 1.8);
  const d1y = useTransform(unstackOffset, (v) => 12 + (1 - 2) * v);
  const d1x = useTransform(unstackOffset, (v) => (1 - 2) * v * 1.8);
  const d2y = useTransform(unstackOffset, (v) => 24 + (2 - 2) * v);
  const d2x = useTransform(unstackOffset, (v) => (2 - 2) * v * 1.8);
  const d3y = useTransform(unstackOffset, (v) => 36 + (3 - 2) * v);
  const d3x = useTransform(unstackOffset, (v) => (3 - 2) * v * 1.8);
  const d4y = useTransform(unstackOffset, (v) => 48 + (4 - 2) * v);
  const d4x = useTransform(unstackOffset, (v) => (4 - 2) * v * 1.8);

  const deckTransforms = [
    { y: d0y, x: d0x },
    { y: d1y, x: d1x },
    { y: d2y, x: d2x },
    { y: d3y, x: d3x },
    { y: d4y, x: d4x },
  ];

  return (
    <section
      ref={containerRef}
      className="py-10 md:py-16 px-6 sm:px-12 max-w-[1440px] mx-auto w-full text-center overflow-hidden"
    >
      {/* 1. "Trusted by leading teams." Partner Logo Infinite Marquee */}
      <div className="mb-12 text-left">
        <div
          ref={marqueeHeaderRef}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4"
        >
          <div>
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] text-[#111215] will-change-transform">
              Trusted by campus labs &amp; engineering teams.
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-[#8E929E] max-w-md will-change-transform">
              Over 2,400+ student founders, university research labs, and hiring teams use ProjectHub to orchestrate capstones and recruit top talent.
            </p>
          </div>

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

        {/* Infinite Loop Marquee */}
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

      {/* 2. Text Block & 3D Deck Dropping & Unstacking vertically on scroll + Draggable Physics */}
      <div ref={unstackAreaRef} className="relative max-w-4xl mx-auto py-12 select-none perspective-[1200px]">
        {/* Speech Bubbles (Draggable with elastic recoil) */}
        <div className="absolute top-2 left-[12%] sm:left-[18%] z-40 draggable-speech-tag cursor-grab active:cursor-grabbing">
          <SpeechTag text="@priya" color="#111215" />
        </div>
        <div className="absolute top-6 right-[8%] sm:right-[15%] z-40 draggable-speech-tag cursor-grab active:cursor-grabbing">
          <SpeechTag text="@aarav" color="#2055DE" />
        </div>

        {/* 3D Deck Dropping into Center and Unstacking Vertically */}
        <motion.div
          style={{
            y: deckDropY,
            opacity: deckOpacity,
          }}
          className="relative my-6 h-[340px] sm:h-[390px] flex items-center justify-center"
        >
          {cards.map((c, i) => {
            const dt = deckTransforms[i];
            return (
              <motion.div
                key={c.id}
                style={{
                  y: dt.y,
                  x: dt.x,
                  rotateX: cardRotateX,
                  rotate: c.rotBase,
                  zIndex: c.z,
                }}
                className="absolute w-[200px] sm:w-[240px] h-[270px] sm:h-[320px] rounded-3xl overflow-hidden art-card-shadow bg-white border border-black/10 select-none group"
              >
                <div className="draggable-unstack-card w-full h-full relative bg-slate-900 cursor-grab active:cursor-grabbing">
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 text-left z-20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/90 block">
                      {c.title}
                    </span>
                    <span className="text-[9px] text-white/70">VERIFIED CAPSTONE</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Narrative Text with GSAP Reveal */}
        <h2
          ref={narrativeTextRef}
          className="text-3xl sm:text-5xl md:text-[54px] font-extrabold tracking-[-0.04em] text-[#111215] leading-[1.14] mt-6 will-change-transform"
        >
          Whether you&apos;re an engineering student showcasing your capstone build <br />
          / or an industry team seeking{" "}
          <span className="text-[#12B886] inline-flex items-center gap-1 font-extrabold">
            verified talent
            <span className="inline-block text-base">⚡</span>
          </span>{" "}
          ProjectHub connects <br />
          you to world-class campus builders &amp;{" "}
          <span className="text-[#E76F51] inline-flex items-center gap-1 font-extrabold">
            production code.
            <Tag className="w-5 h-5 inline text-[#E76F51] fill-[#E76F51]/20 -rotate-45" />
          </span>
        </h2>

        {/* Bottom Pill Dock with 3 circular icons */}
        <div className="mt-8 inline-flex items-center gap-4 p-2 px-4 rounded-full bg-white border border-black/10 shadow-sm">
          <button
            aria-label="Feature 1"
            className="p-2 rounded-full hover:bg-neutral-100 text-[#111215] transition-colors"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            aria-label="Feature 2"
            className="p-2 rounded-full hover:bg-neutral-100 text-[#111215] transition-colors"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            aria-label="Feature 3"
            className="p-2 rounded-full hover:bg-neutral-100 text-[#111215] transition-colors"
          >
            <Waves className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
