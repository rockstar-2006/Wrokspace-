"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { gsap, ScrollTrigger, Draggable, MotionPathPlugin } from "@/lib/gsapUtils";
import SpeechTag from "@/components/SpeechTag";
import CinematicSplitText from "@/components/CinematicSplitText";
import { ORIGINAL_HERO_CARDS } from "@/lib/data";

/* ─────────────────────────────────────────────────────────────────────────────
   5 ARTWORK CARD SUBCOMPONENTS (PIXEL-PERFECT MATCH TO IMAGE 2 REFERENCE)
───────────────────────────────────────────────────────────────────────────── */

/** Card 1: Exhibition Poster "Van Bosch tot Bruegel" - Inverted red graphic art with DrawSVG effect */
function CardBoschBruegelArt() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const ellipses = svgRef.current.querySelectorAll("ellipse");
    ellipses.forEach((el, idx) => {
      const rx = parseFloat(el.getAttribute("rx") || "40");
      const ry = parseFloat(el.getAttribute("ry") || "25");
      const perimeter = Math.PI * 2 * Math.sqrt((rx * rx + ry * ry) / 2);
      el.style.strokeDasharray = `${perimeter}`;
      el.style.strokeDashoffset = `${perimeter}`;

      gsap.to(el, {
        strokeDashoffset: 0,
        duration: 2.2,
        delay: idx * 0.18,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
        repeatDelay: 1.2,
      });
    });
  }, []);

  return (
    <div className="relative w-full h-full bg-[#B32018] overflow-hidden flex flex-col items-center justify-between p-3.5 select-none">
      {/* Concentric contour rings with DrawSVG vector effect */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
        viewBox="0 0 200 280"
        fill="none"
      >
        <ellipse cx="100" cy="180" rx="38" ry="24" stroke="#000" strokeWidth="2.5" />
        <ellipse cx="100" cy="180" rx="62" ry="40" stroke="#000" strokeWidth="3" />
        <ellipse cx="100" cy="180" rx="86" ry="58" stroke="#000" strokeWidth="3.5" />
        <ellipse cx="100" cy="180" rx="112" ry="78" stroke="#000" strokeWidth="4" />
        <ellipse cx="100" cy="180" rx="138" ry="98" stroke="#000" strokeWidth="4.5" />
      </svg>

      {/* Inverted typography at top matching Image 2 */}
      <div className="w-full flex flex-col items-center rotate-180 z-10 pt-1">
        <div className="flex items-center gap-1.5 text-white/90 text-[10px] font-bold tracking-wider">
          <span>nov</span>
          <span>tot</span>
        </div>
        <h3 className="text-white text-[23px] font-black leading-none tracking-tight">
          Bosch
        </h3>
        <h3 className="text-white text-[21px] font-black leading-none tracking-tight">
          Bruegel
        </h3>
      </div>

      {/* Surrealist face artwork with hands pulling eyelids and lips */}
      <div className="relative z-10 w-full flex items-center justify-center -mb-2">
        <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-black/35 shadow-inner">
          <Image
            src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=85"
            alt="Bosch Bruegel"
            fill
            className="object-cover scale-125 rotate-180 filter contrast-125 saturate-150"
          />
          <div className="absolute inset-0 bg-[#B32018]/30 mix-blend-color" />
        </div>
      </div>
    </div>
  );
}

/** Card 2: Spatial 3D Canvas with WebGL typography */
function CardNeoNoirArt() {
  return (
    <div className="relative w-full h-full bg-[#EDEDF0] overflow-hidden flex items-center justify-center select-none">
      <Image
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=85"
        alt="Spatial 3D Canvas"
        fill
        className="object-cover object-center"
        priority
      />
      {/* 3D Inflated Bubble Typography Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <span
          className="text-[40px] font-black tracking-tight leading-none text-[#2563EB]"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            textShadow: "2px 2px 0px #F97316, 4px 4px 0px #EA580C",
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.3))",
          }}
        >
          Spatial
        </span>
        <span
          className="text-[36px] font-black tracking-tight leading-none text-[#22C55E] -mt-1"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            textShadow: "2px 2px 0px #15803D, 4px 4px 0px #166534",
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.3))",
          }}
        >
          Canvas 3D
        </span>
      </div>
    </div>
  );
}

/** Card 3: Tesla Punk Collage with halftone portrait, torn note, vertical cutout TESLA */
function CardTeslaCollageArt() {
  return (
    <div className="relative w-full h-full bg-[#18181B] overflow-hidden select-none">
      <Image
        src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=700&q=85"
        alt="Tesla Punk Collage"
        fill
        className="object-cover"
        priority
      />
      {/* Collage Elements Overlay */}
      <div className="absolute inset-0 p-3.5 flex flex-col justify-between pointer-events-none z-20">
        {/* Handwritten quote snippet */}
        <div className="bg-[#FAF8F5] border border-black/15 rounded px-2.5 py-1.5 shadow-md max-w-[155px] -rotate-2">
          <p className="text-[9px] font-mono font-bold leading-tight text-[#111215]">
            &quot;I don&apos;t care that they stole my idea...&quot;
          </p>
        </div>

        {/* Vertical cutout letters TESLA */}
        <div className="flex items-end justify-between">
          <div className="bg-[#DC2626] text-white font-black px-1.5 py-0.5 rounded text-[11px] tracking-widest uppercase shadow-md rotate-90 origin-bottom-left -mb-1">
            TESLA
          </div>
        </div>
      </div>
    </div>
  );
}

/** Card 4: Code Engine & IDE Architecture (Next.js & Rust) */
function CardVanGoghArt() {
  return (
    <div className="relative w-full h-full bg-[#0F172A] overflow-hidden select-none">
      <Image
        src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=700&q=85"
        alt="Code Engine Terminal"
        fill
        className="object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-blue-600/80 backdrop-blur-md text-[10px] font-mono font-bold text-white">
        kernel.rs // v1.2
      </div>
    </div>
  );
}

/** Card 5: Pop Art Red Box on Yellow background with illustrated comic characters */
function CardPopArtBoxArt() {
  return (
    <div className="relative w-full h-full bg-[#FFCE00] overflow-hidden flex items-end justify-center select-none">
      <Image
        src="https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=700&q=85"
        alt="Pop Art Box"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#FFCE00]/20 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-3 right-3 bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded shadow">
        EDITION 01
      </div>
    </div>
  );
}

/** Helper function to render card artwork by id */
function renderArtworkCard(id: string) {
  switch (id) {
    case "card-bosch":
      return <CardBoschBruegelArt />;
    case "card-noir":
      return <CardNeoNoirArt />;
    case "card-tesla":
      return <CardTeslaCollageArt />;
    case "card-vangogh":
      return <CardVanGoghArt />;
    case "card-popbox":
      return <CardPopArtBoxArt />;
    default:
      return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT: HERO + MARKETPLACE STAGE WITH SCROLL-DRIVEN ANIMATION
───────────────────────────────────────────────────────────────────────────── */
export default function HeroToMarketplaceStage() {
  const [mounted, setMounted] = useState(false);
  const [activeMarketCard, setActiveMarketCard] = useState(2); // Center card active

  const heroRef = useRef<HTMLElement>(null);
  const mktRef = useRef<HTMLElement>(null);

  // GSAP text reveal refs for Section 2
  const ecomTagRef = useRef<HTMLSpanElement>(null);
  const headlineLine1Ref = useRef<HTMLSpanElement>(null);
  const headlineLine2Ref = useRef<HTMLSpanElement>(null);
  const headlineLine3Ref = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaButtonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const mkt = mktRef.current;
    if (typeof window === "undefined" || !mkt) return;

    const headlineLines = [
      headlineLine1Ref.current,
      headlineLine2Ref.current,
      headlineLine3Ref.current,
    ].filter(Boolean);
    const ecomTag = ecomTagRef.current;
    const desc = descRef.current;
    const ctaButtons = ctaButtonsRef.current;

    const ctx = gsap.context(() => {
      // Set initial masked state with hardware acceleration
      if (headlineLines.length) {
        gsap.set(headlineLines, {
          yPercent: 115,
          opacity: 0,
          force3D: true,
        });
      }
      if (ecomTag) gsap.set(ecomTag, { y: 18, opacity: 0, force3D: true });
      if (desc) gsap.set(desc, { y: 24, opacity: 0, force3D: true });
      if (ctaButtons) gsap.set(ctaButtons, { y: 24, opacity: 0, force3D: true });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.out" },
      });

      if (ecomTag) {
        tl.to(ecomTag, {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: "power3.out",
        });
      }

      if (headlineLines.length) {
        tl.to(
          headlineLines,
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.15,
            stagger: 0.12,
            ease: "power4.out",
          },
          "-=0.35"
        );
      }

      if (desc) {
        tl.to(
          desc,
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
          },
          "-=0.65"
        );
      }

      if (ctaButtons) {
        tl.to(
          ctaButtons,
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
          },
          "-=0.65"
        );
      }

      ScrollTrigger.create({
        trigger: mkt,
        start: "top 78%",
        onEnter: () => tl.play(),
        onEnterBack: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
      });

      // If user starts or reloads inside Section 2
      if (ScrollTrigger.isInViewport(mkt, 0.2)) {
        tl.play();
      }
    }, mktRef);

    return () => ctx.revert();
  }, []);

  const heroCardsAreaRef = useRef<HTMLDivElement>(null);
  const motionBeaconRef = useRef<HTMLDivElement>(null);

  /* ── Vector & Path Animation: MotionPathPlugin ──────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined" || !motionBeaconRef.current) return;
    const path = document.querySelector("#hero-motion-path");
    if (!path) return;

    const tween = gsap.to(motionBeaconRef.current, {
      motionPath: {
        path: "#hero-motion-path",
        align: "#hero-motion-path",
        autoRotate: true,
        alignOrigin: [0.5, 0.5],
      },
      duration: 18,
      repeat: -1,
      ease: "none",
    });

    return () => {
      tween.kill();
    };
  }, [mounted]);

  /* ── Interactive & Physics Motion: Draggable with Recoil Elasticity ── */
  useEffect(() => {
    if (typeof window === "undefined" || !heroCardsAreaRef.current || !mounted) return;

    const timer = setTimeout(() => {
      if (!heroCardsAreaRef.current) return;
      const draggables: any[] = [];

      // Cards Draggable
      const cards = heroCardsAreaRef.current.querySelectorAll(".draggable-card-item");
      cards.forEach((card) => {
        const d = Draggable.create(card, {
          type: "x,y",
          edgeResistance: 0.65,
          cursor: "grab",
          activeCursor: "grabbing",
          onDrag: function () {
            gsap.to(this.target, {
              rotate: (this.deltaX || 0) * 0.35,
              scale: 1.05,
              duration: 0.1,
              overwrite: "auto",
            });
          },
          onDragEnd: function () {
            gsap.to(this.target, {
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
              duration: 0.85,
              ease: "elastic.out(1, 0.4)",
            });
          },
        });
        if (d && d[0]) draggables.push(d[0]);
      });

      // Speech tags Draggable
      const tags = heroCardsAreaRef.current.querySelectorAll(".draggable-speech-tag");
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
    }, 1300);

    return () => clearTimeout(timer);
  }, [mounted]);

  /* ── 1. Hero Scroll Fade-Out ─────────────────────────────────────────── */
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroFadeOpacity = useTransform(heroScroll, [0, 0.75], [1, 0.05]);
  const heroFadeY = useTransform(heroScroll, [0, 0.75], [0, -50]);

  /* ── 2. Section 2 Scroll-Driven Expansion (Works WHILE SCROLLING!) ───── */
  const { scrollYProgress: mktScrollProgress } = useScroll({
    target: mktRef,
    offset: ["start end", "center center"],
  });

  // Buttery-smooth spring directly responding to the user's scroll gestures
  const smoothProgress = useSpring(mktScrollProgress, {
    stiffness: 110,
    damping: 24,
    mass: 0.4,
  });

  // Exit fade out when scrolling past Section 2 toward Gateway stage
  const { scrollYProgress: exitScrollProgress } = useScroll({
    target: mktRef,
    offset: ["center center", "end start"],
  });
  const mktExitOpacity = useTransform(exitScrollProgress, [0.35, 0.85], [1, 0.05]);
  const mktExitY = useTransform(exitScrollProgress, [0.35, 0.85], [0, -50]);

  /* ── 3. Exact 5-Card Staircase Transforms Driven by Scroll ───────────── */
  // Card 1: Bosch Bruegel (targetX: -210, targetY: -45)
  const card1X = useTransform(smoothProgress, [0.08, 0.88], [0, -210]);
  const card1Y = useTransform(smoothProgress, [0.08, 0.88], [30, -45]);
  const card1Scale = useTransform(smoothProgress, [0.08, 0.88], [0.88, 1]);
  const card1Opacity = useTransform(smoothProgress, [0.05, 0.3], [0.25, 1]);

  // Card 2: Neo Noir Fashion Model (targetX: -105, targetY: -12)
  const card2X = useTransform(smoothProgress, [0.08, 0.88], [0, -105]);
  const card2Y = useTransform(smoothProgress, [0.08, 0.88], [30, -12]);
  const card2Scale = useTransform(smoothProgress, [0.08, 0.88], [0.88, 1]);
  const card2Opacity = useTransform(smoothProgress, [0.05, 0.3], [0.25, 1]);

  // Card 3: Tesla Punk Collage (targetX: 0, targetY: 22) - Centered front
  const card3X = useTransform(smoothProgress, [0.08, 0.88], [0, 0]);
  const card3Y = useTransform(smoothProgress, [0.08, 0.88], [30, 22]);
  const card3Scale = useTransform(smoothProgress, [0.08, 0.88], [0.88, 1.04]);
  const card3Opacity = useTransform(smoothProgress, [0.05, 0.3], [0.25, 1]);

  // Card 4: Van Gogh Self-Portrait (targetX: 105, targetY: 52)
  const card4X = useTransform(smoothProgress, [0.08, 0.88], [0, 105]);
  const card4Y = useTransform(smoothProgress, [0.08, 0.88], [30, 52]);
  const card4Scale = useTransform(smoothProgress, [0.08, 0.88], [0.88, 1]);
  const card4Opacity = useTransform(smoothProgress, [0.05, 0.3], [0.25, 1]);

  // Card 5: Pop Art Box on Yellow (targetX: 210, targetY: 82)
  const card5X = useTransform(smoothProgress, [0.08, 0.88], [0, 210]);
  const card5Y = useTransform(smoothProgress, [0.08, 0.88], [30, 82]);
  const card5Scale = useTransform(smoothProgress, [0.08, 0.88], [0.88, 1]);
  const card5Opacity = useTransform(smoothProgress, [0.05, 0.3], [0.25, 1]);

  // Speech tags & Chevrons reveal
  const howardScale = useTransform(smoothProgress, [0.55, 0.88], [0, 1]);
  const howardOpacity = useTransform(smoothProgress, [0.55, 0.75], [0, 1]);

  const robinScale = useTransform(smoothProgress, [0.65, 0.92], [0, 1]);
  const robinOpacity = useTransform(smoothProgress, [0.65, 0.8], [0, 1]);

  const chevX = useTransform(smoothProgress, [0.65, 0.9], [20, 0]);
  const chevOpacity = useTransform(smoothProgress, [0.65, 0.85], [0, 1]);

  const BG = "#F5F5F5";

  // Staggered fan delays for Hero
  const heroFanDelays = [0.1, 0.05, 0, 0.05, 0.1];
  const heroHeadlineLine1 = ["A", "place", "to", "display", "your"];
  const heroHeadlineLine2 = ["masterpiece."];

  const cardsList = [
    {
      id: "card-bosch",
      zIndex: 15,
      x: card1X,
      y: card1Y,
      scale: card1Scale,
      opacity: card1Opacity,
    },
    {
      id: "card-noir",
      zIndex: 25,
      x: card2X,
      y: card2Y,
      scale: card2Scale,
      opacity: card2Opacity,
    },
    {
      id: "card-tesla",
      zIndex: 35,
      x: card3X,
      y: card3Y,
      scale: card3Scale,
      opacity: card3Opacity,
    },
    {
      id: "card-vangogh",
      zIndex: 20,
      x: card4X,
      y: card4Y,
      scale: card4Scale,
      opacity: card4Opacity,
    },
    {
      id: "card-popbox",
      zIndex: 10,
      x: card5X,
      y: card5Y,
      scale: card5Scale,
      opacity: card5Opacity,
    },
  ];

  return (
    <div className="w-full flex flex-col" style={{ backgroundColor: BG }}>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: HERO SECTION
          - Text reveal with masked word-by-word slide-up
          - 5 cards rise from bottom in a cluster, then expand/fan out sideways
          - @coplin and @andrea speech tags pop in
          - Bottom subtitle & CTA buttons
         ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        id="explore"
        className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between items-center select-none overflow-hidden"
        style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 48px 40px" }}
      >
        <motion.div
          style={{ opacity: heroFadeOpacity, y: heroFadeY }}
          className="w-full flex-1 flex flex-col justify-between items-center"
        >
          {/* ── Headline with Cinematic SplitText Character Reveal ────────── */}
          <div className="w-full flex flex-col items-center justify-center text-center pt-4 sm:pt-6">
            <CinematicSplitText
              type="chars"
              duration={0.9}
              stagger={0.02}
              tag="h1"
              className="text-[#111215] font-extrabold leading-[1.03] text-center"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(46px, 6.2vw, 84px)",
                letterSpacing: "-0.045em",
              }}
            >
              A place to display your masterpiece.
            </CinematicSplitText>
          </div>

          {/* ── Vector & Path Animation: MotionPath Curved Trajectory ──────── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-40">
            <svg
              className="w-full h-full"
              viewBox="0 0 1400 600"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                id="hero-motion-path"
                d="M -60,280 C 280,120 540,340 760,200 C 980,60 1180,260 1460,180"
                stroke="rgba(255, 74, 56, 0.45)"
                strokeWidth="1.5"
                strokeDasharray="5 7"
              />
            </svg>
            <div
              ref={motionBeaconRef}
              className="absolute pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-black/10 shadow-md backdrop-blur-sm"
              style={{ willChange: "transform" }}
            >
              <span className="w-2 h-2 rounded-full bg-[#FF4A38] animate-ping" />
              <span className="text-[10px] font-bold text-[#111215] tracking-wide">
                PROJECTHUB
              </span>
            </div>
          </div>

          {/* ── Hero Center: 5 Cards Entrance (Rise from Bottom -> Expand / Fan Out + Draggable Physics) ── */}
          <div
            className="relative w-full flex-1 flex items-center justify-center my-6 sm:my-10"
            style={{ minHeight: 340 }}
          >
            {/* Ambient soft shadow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={mounted ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute bottom-2 rounded-full pointer-events-none"
              style={{
                width: 700,
                height: 40,
                background: "rgba(0,0,0,0.07)",
                filter: "blur(28px)",
              }}
            />

            {/* Speech tag @coplin (left, draggable with physics) */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 15 }}
              animate={mounted ? { scale: 1, opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.05, type: "spring", stiffness: 320, damping: 20 }}
              className="absolute top-2 left-[24%] sm:left-[27%] z-30"
            >
              <div className="draggable-speech-tag cursor-grab active:cursor-grabbing">
                <SpeechTag text="@coplin" color="#2F6FED" />
              </div>
            </motion.div>

            {/* Speech tag @andrea (right, draggable with physics) */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 15 }}
              animate={mounted ? { scale: 1, opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.15, type: "spring", stiffness: 320, damping: 20 }}
              className="absolute top-6 right-[22%] sm:right-[25%] z-30"
            >
              <div className="draggable-speech-tag cursor-grab active:cursor-grabbing">
                <SpeechTag text="@andrea" color="#57A37C" />
              </div>
            </motion.div>

            {/* 5 Artwork Cards: Clustered rise -> wide fan + GSAP Draggable Physics */}
            <div
              ref={heroCardsAreaRef}
              className="relative flex items-center justify-center"
            >
              {ORIGINAL_HERO_CARDS.map((card, idx) => {
                const isCenter = idx === 2;

                return (
                  <motion.div
                    key={card.id}
                    initial={{
                      y: 340,
                      x: 0,
                      rotate: 0,
                      opacity: 0,
                      scale: 0.86,
                    }}
                    animate={
                      mounted
                        ? {
                            y: [340, 0, 0],
                            x: [0, 0, card.baseX],
                            rotate: [0, 0, card.baseRotate],
                            opacity: [0, 1, 1],
                            scale: [0.86, 1, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 1.35,
                      times: [0, 0.48, 1],
                      delay: 0.18 + heroFanDelays[idx],
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`absolute rounded-3xl overflow-hidden art-card-shadow bg-white border border-black/10 transition-transform ${
                      isCenter ? "art-card-shadow-active shadow-2xl z-30" : ""
                    }`}
                    style={{ zIndex: card.zIndex }}
                  >
                    <div className="draggable-card-item w-full h-full cursor-grab active:cursor-grabbing">
                    <div
                      className="relative overflow-hidden bg-slate-900"
                      style={{
                        width: isCenter
                          ? "clamp(195px, 15vw, 225px)"
                          : "clamp(165px, 13vw, 195px)",
                        height: isCenter
                          ? "clamp(265px, 23vh, 305px)"
                          : "clamp(225px, 19vh, 260px)",
                      }}
                    >
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="object-cover"
                        priority={idx <= 2}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
                    </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Subtitle & CTA Buttons ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.85, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center pb-2"
          >
            <p
              className="text-[#71747E] font-medium"
              style={{
                fontSize: 13,
                letterSpacing: "-0.01em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Student innovators and developer squads can display their masterpieces, and recruiters can{" "}
              <span className="text-[#111215] font-semibold">discover and</span> recruit
            </p>
            <div className="mt-3.5 flex items-center gap-4">
              <button
                className="px-7 py-3 rounded-full bg-[#121316] text-white font-semibold hover:bg-black transition-all shadow-md hover:scale-105"
                style={{ fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Join ProjectHub Free
              </button>
              <a
                href="#marketplace"
                className="text-[#8E929E] hover:text-[#111215] font-medium cursor-pointer"
                style={{ fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Explore Showcase
              </a>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: MARKETPLACE SHOWCASE
          - Tightened padding & vertical spacing
          - Authentic ProjectHub student & capstone details
         ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={mktRef}
        id="marketplace"
        className="relative w-full min-h-[85vh] flex items-center select-none py-8 md:py-12"
        style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 48px 40px" }}
      >
        <motion.div
          style={{ opacity: mktExitOpacity, y: mktExitY }}
          className="w-full"
        >
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

            {/* ── LEFT COLUMN: TYPOGRAPHY, COPY & PILL BUTTONS ──────────────── */}
            <div className="lg:col-span-5 flex flex-col items-start text-left z-20">
              {/* Registry tag */}
              <span
                ref={ecomTagRef}
                className="block mb-3 font-bold uppercase text-[#71747E] will-change-transform"
                style={{ fontSize: 11, letterSpacing: "0.22em" }}
              >
                PROJECT REGISTRY &amp; SHOWCASE
              </span>

              {/* Headline with Masked Word Lines Reveal via GSAP */}
              <h2
                className="font-extrabold text-[#111215] leading-[1.03]"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "clamp(42px, 5.2vw, 68px)",
                  letterSpacing: "-0.04em",
                }}
              >
                {/* Line 1 */}
                <span className="block overflow-hidden py-0.5">
                  <span
                    ref={headlineLine1Ref}
                    className="block will-change-transform"
                  >
                    Showcase, Verify,
                  </span>
                </span>

                {/* Line 2 in Crimson Red #A82218 */}
                <span className="block overflow-hidden py-0.5" style={{ color: "#A82218" }}>
                  <span
                    ref={headlineLine2Ref}
                    className="block will-change-transform"
                  >
                    &amp; launch builds to
                  </span>
                </span>

                {/* Line 3 */}
                <span className="block overflow-hidden py-0.5">
                  <span
                    ref={headlineLine3Ref}
                    className="block will-change-transform"
                  >
                    our marketplace.
                  </span>
                </span>
              </h2>

              {/* Description */}
              <p
                ref={descRef}
                className="mt-5 text-[#71747E] leading-[1.65] font-normal will-change-transform"
                style={{
                  fontSize: 15,
                  maxWidth: 350,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Dynamic campus community where student developers and engineering squads seamlessly merge.
                ProjectHub brings together innovators to share capstone excellence and get discovered by top tech recruiters.
              </p>

              {/* CTA Buttons */}
              <div
                ref={ctaButtonsRef}
                className="mt-7 flex items-center gap-3.5 will-change-transform"
              >
                <a
                  href="/login"
                  className="px-6 py-3 rounded-full bg-[#121316] text-white font-semibold hover:bg-black transition-all shadow-sm hover:scale-105 inline-block text-center"
                  style={{
                    fontSize: 13,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Join ProjectHub Free
                </a>
                <a
                  href="#directory"
                  className="px-6 py-3 rounded-full bg-[#ECECEE] text-[#111215] font-semibold hover:bg-[#E2E2E5] transition-all hover:scale-105"
                  style={{
                    fontSize: 13,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Explore Registry
                </a>
              </div>
            </div>

            {/* ── RIGHT COLUMN: 5 CARDS SCROLL EXPANSION MATCHING IMAGE 2 ────── */}
            <div className="lg:col-span-7 relative flex items-center justify-center min-h-[460px] sm:min-h-[520px]">

              {/* Soft ground blur shadow */}
              <motion.div
                style={{
                  opacity: card3Opacity,
                  width: 580,
                  height: 38,
                  background: "rgba(0,0,0,0.07)",
                  filter: "blur(28px)",
                }}
                className="absolute bottom-4 rounded-full pointer-events-none"
              />

              {/* Pinned Tag: @howard (red speech bubble directly above Card 1 & Card 2) */}
              <motion.div
                style={{ scale: howardScale, opacity: howardOpacity }}
                className="absolute -top-3 left-[15%] sm:left-[19%] z-50 pointer-events-none"
              >
                <SpeechTag text="@howard" color="#961D15" />
              </motion.div>

              {/* Pinned Tag: @robin (black speech bubble directly above Card 4) */}
              <motion.div
                style={{ scale: robinScale, opacity: robinOpacity }}
                className="absolute top-7 right-[24%] sm:right-[28%] z-50 pointer-events-none"
              >
                <SpeechTag text="@robin" color="#16171A" />
              </motion.div>

              {/* ── THE 5 CARDS: SCROLL-DRIVEN STAIRCASE EXPANSION ─────────── */}
              <div className="relative flex items-center justify-center w-full h-[410px]">
                {cardsList.map((card, idx) => {
                  const isCenter = idx === activeMarketCard;

                  return (
                    <motion.div
                      key={card.id}
                      onClick={() => setActiveMarketCard(idx)}
                      style={{
                        x: card.x,
                        y: card.y,
                        scale: card.scale,
                        opacity: card.opacity,
                        zIndex: card.zIndex,
                      }}
                      className={`absolute rounded-[26px] overflow-hidden cursor-pointer bg-white border border-black/10 transition-shadow ${
                        isCenter
                          ? "art-card-shadow-active shadow-2xl ring-2 ring-black/10"
                          : "art-card-shadow hover:brightness-105"
                      }`}
                    >
                      <div
                        className="relative overflow-hidden"
                        style={{
                          width: "clamp(190px, 15vw, 220px)",
                          height: "clamp(265px, 23vh, 305px)",
                        }}
                      >
                        {renderArtworkCard(card.id)}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Vertical Navigation Chevrons pinned right of the cards */}
                <motion.div
                  style={{ x: chevX, opacity: chevOpacity }}
                  className="absolute -right-3 sm:-right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-40"
                >
                  <button
                    onClick={() => setActiveMarketCard((p) => (p > 0 ? p - 1 : 4))}
                    aria-label="Previous card"
                    className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#71747E] hover:text-[#111215] shadow-sm hover:scale-105 transition-all"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveMarketCard((p) => (p < 4 ? p + 1 : 0))}
                    aria-label="Next card"
                    className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#71747E] hover:text-[#111215] shadow-sm hover:scale-105 transition-all"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>

            </div>

          </div>
        </motion.div>
      </section>

    </div>
  );
}
