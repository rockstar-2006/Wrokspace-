"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Terminal, Star, Sparkles, ExternalLink, ShieldCheck, Check } from "lucide-react";
import { gsap, ScrollTrigger, Flip, Draggable } from "@/lib/gsapUtils";
import CinematicSplitText from "@/components/CinematicSplitText";

interface ProjectItem {
  id: string;
  category: "all" | "ai" | "systems" | "graphics";
  title: string;
  subtitle: string;
  author: string;
  tag: string;
  badge: string;
  image: string;
  cliCommand: string;
  stars: string;
  baseRotate: number;
}

export default function MarketplaceCarouselProfileSection() {
  const [activeFilter, setActiveFilter] = useState<"all" | "ai" | "systems" | "graphics">("all");
  const [expandedTerminalId, setExpandedTerminalId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const categoryGridRef = useRef<HTMLDivElement>(null);

  const allProjects: ProjectItem[] = [
    {
      id: "proj-1",
      category: "ai",
      title: "Neural Canvas AI",
      subtitle: "Generative WebGL & Diffusers",
      author: "Priya Narang • Stanford '26",
      tag: "Next.js 14 • PyTorch • WebGL",
      badge: "AI VISION",
      stars: "18.4K ★",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      cliCommand: "npx projecthub pull neural-canvas-ai",
      baseRotate: -2.5,
    },
    {
      id: "proj-2",
      category: "systems",
      title: "HyperScale Vector DB",
      subtitle: "SIMD In-Memory Search Engine",
      author: "Aarav Sharma • IIT Madras '25",
      tag: "Go • Rust • SIMD • Raft",
      badge: "DISTRIBUTED SYS",
      stars: "12.1K ★",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
      cliCommand: "npx projecthub pull hyperscale-vector-db",
      baseRotate: 1.8,
    },
    {
      id: "proj-3",
      category: "ai",
      title: "Autonomous Agent Swarm",
      subtitle: "Multi-Agent Workflow Mesh",
      author: "Samira Khan • MIT '26",
      tag: "Python • LangChain • FastAPI",
      badge: "LLM SWARMS",
      stars: "9.8K ★",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
      cliCommand: "npx projecthub pull autonomous-agent-swarm",
      baseRotate: -1.6,
    },
    {
      id: "proj-4",
      category: "graphics",
      title: "Spatial 3D Canvas Engine",
      subtitle: "Realtime Shaders & WebGPU",
      author: "Rhea Sen • UC Berkeley '26",
      tag: "Three.js • WebGPU • GLSL",
      badge: "WEBGL & 3D",
      stars: "14.5K ★",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
      cliCommand: "npx projecthub pull spatial-3d-canvas",
      baseRotate: 2.8,
    },
  ];

  const visibleProjects = activeFilter === "all"
    ? allProjects
    : allProjects.filter((p) => p.category === activeFilter);

  /* ── 1. GSAP ScrollTrigger Animations for Every Text Element ─────── */
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Header tag & paragraph reveals
      const headerEl = headerRef.current;
      if (headerEl) {
        gsap.fromTo(
          headerEl.querySelectorAll(".gsap-reveal-text"),
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: headerEl,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 3D Staggered Cards Entry
      const gridEl = categoryGridRef.current;
      if (gridEl) {
        gsap.fromTo(
          gridEl.querySelectorAll(".gsap-deck-card"),
          { y: 40, opacity: 0, scale: 0.94 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.0,
            stagger: 0.1,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: gridEl,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  /* ── 2. Interactive Physics: Draggable throw-and-glide on cards ─────── */
  useEffect(() => {
    if (typeof window === "undefined" || !categoryGridRef.current) return;

    const cards = categoryGridRef.current.querySelectorAll(".gsap-draggable-card");
    const draggables: any[] = [];

    cards.forEach((card) => {
      const d = Draggable.create(card, {
        type: "x,y",
        edgeResistance: 0.7,
        cursor: "grab",
        activeCursor: "grabbing",
        onDrag: function () {
          gsap.to(this.target, {
            scale: 1.04,
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

    return () => {
      draggables.forEach((d) => d?.kill());
    };
  }, [activeFilter]);

  /* ── 3. GSAP Flip Filter Switcher ──────────────────────────────────── */
  const handleFilterChange = (filter: "all" | "ai" | "systems" | "graphics") => {
    if (filter === activeFilter) return;

    if (categoryGridRef.current) {
      const cardElements = categoryGridRef.current.querySelectorAll(".gsap-deck-card");
      const state = Flip.getState(cardElements);

      setActiveFilter(filter);

      requestAnimationFrame(() => {
        if (!categoryGridRef.current) return;
        Flip.from(state, {
          duration: 0.65,
          ease: "power3.inOut",
          scale: true,
          stagger: 0.05,
          onEnter: (elements) => {
            gsap.fromTo(
              elements,
              { opacity: 0, scale: 0.9, y: 20 },
              { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power2.out" }
            );
          },
        });
      });
    } else {
      setActiveFilter(filter);
    }
  };

  /* ── 4. Interactive 3D Cursor Tilt with GSAP ───────────────────────── */
  const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(card, {
      rotateX: -y * 14,
      rotateY: x * 14,
      scale: 1.025,
      duration: 0.25,
      ease: "power2.out",
      transformPerspective: 1000,
      overwrite: "auto",
    });
  };

  const handleMouseLeaveCard = (e: React.MouseEvent<HTMLDivElement>, baseRotate: number) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      rotate: baseRotate,
      scale: 1,
      duration: 0.65,
      ease: "elastic.out(1, 0.4)",
      overwrite: "auto",
    });
  };

  const handleCopyCommand = (id: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const profileScale = useTransform(scrollYProgress, [0.35, 0.65], [0.8, 1.0]);
  const profileY = useTransform(scrollYProgress, [0.35, 0.65], [40, 0]);
  const gridBrightness = useTransform(scrollYProgress, [0.35, 0.65], [1, 0.65]);

  const techThumbs = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=70",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=70",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=70",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=70",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=70",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=70",
  ];

  return (
    <section
      ref={containerRef}
      id="directory"
      className="py-10 md:py-16 px-6 sm:px-12 max-w-[1440px] mx-auto w-full"
    >
      {/* ── 1. Top Header with GSAP Cinematic Typography ─────────────── */}
      <div
        ref={headerRef}
        className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6"
      >
        <div>
          <span className="gsap-reveal-text text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#71747E] block mb-2 will-change-transform">
            PROJECT DIRECTORY &amp; DOMAINS
          </span>
          <CinematicSplitText
            tag="h2"
            type="words"
            duration={1.05}
            stagger={0.04}
            className="text-4xl sm:text-6xl md:text-[68px] font-extrabold tracking-[-0.04em] text-[#111215]"
          >
            Explore Projects Across Tech Stacks.
          </CinematicSplitText>
          <p className="gsap-reveal-text mt-3 text-sm text-[#71747E] max-w-lg will-change-transform">
            Interactive student capstones &amp; production repositories. Drag cards to explore, inspect live test telemetry, or pull directly via CLI.
          </p>
        </div>

        {/* Filter Pills with GSAP Flip Transitions */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-white border border-black/10 shadow-sm">
          {[
            { id: "all", label: "All Tracks" },
            { id: "ai", label: "AI & Agents" },
            { id: "systems", label: "Systems & DB" },
            { id: "graphics", label: "3D & WebGL" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all relative ${
                activeFilter === tab.id
                  ? "bg-[#121316] text-white shadow-sm"
                  : "text-[#71747E] hover:text-[#111215] hover:bg-neutral-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. NON-TRADITIONAL 3D PERSPECTIVE PROJECT DECK (GSAP POWERED) ─ */}
      <div
        ref={categoryGridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14 perspective-[1200px]"
      >
        {visibleProjects.map((proj) => {
          const isTerminalOpen = expandedTerminalId === proj.id;
          const isCopied = copiedId === proj.id;

          return (
            <div
              key={proj.id}
              onMouseMove={handleMouseMoveCard}
              onMouseLeave={(e) => handleMouseLeaveCard(e, proj.baseRotate)}
              style={{
                transform: `rotate(${proj.baseRotate}deg)`,
                transformStyle: "preserve-3d",
              }}
              className="gsap-deck-card rounded-3xl bg-white border border-black/10 overflow-hidden art-card-shadow group transition-shadow duration-300 hover:shadow-2xl hover:border-black/30 flex flex-col justify-between relative select-none will-change-transform"
            >
              {/* Draggable handle & content */}
              <div className="gsap-draggable-card w-full h-full flex flex-col justify-between">
                {/* macOS Terminal Bar Header */}
                <div className="h-9 px-3.5 bg-neutral-900 border-b border-white/10 flex items-center justify-between z-20">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                    <span className="ml-2 text-[10px] font-mono text-white/60 font-semibold truncate max-w-[110px]">
                      {proj.id}.sh
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ● COMPILED
                  </span>
                </div>

                {/* Project Image & Live Badges */}
                <div className="relative w-full h-[190px] overflow-hidden bg-slate-950">
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                  {/* Badges */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/15">
                    {proj.badge}
                  </span>
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {proj.stars}
                    </span>
                    <span className="text-[10px] font-mono text-white/80 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      99.8% Tests
                    </span>
                  </div>
                </div>

                {/* Card Body with GSAP typography */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-lg text-[#111215] group-hover:text-[#FF4A38] transition-colors leading-tight">
                      {proj.title}
                    </h4>
                    <p className="text-xs text-[#8E929E] mt-1 font-medium">{proj.subtitle}</p>
                    <p className="text-[11px] text-[#71747E] mt-2 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{proj.author}</span>
                    </p>
                    <div className="mt-3 inline-block px-2.5 py-1 rounded-md bg-neutral-100 text-[10px] font-mono font-bold text-[#111215]">
                      {proj.tag}
                    </div>
                  </div>

                  {/* Interactive Terminal / CLI Drawer */}
                  <div className="mt-4 pt-4 border-t border-black/5">
                    {isTerminalOpen ? (
                      <div className="rounded-xl bg-neutral-900 p-2.5 text-white font-mono text-[10px] space-y-1.5 mb-2">
                        <div className="flex items-center justify-between text-neutral-400 border-b border-white/10 pb-1">
                          <span>Terminal CLI</span>
                          <button
                            onClick={() => handleCopyCommand(proj.id, proj.cliCommand)}
                            className="flex items-center gap-1 text-emerald-400 hover:text-white"
                          >
                            {isCopied ? <Check className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                            <span>{isCopied ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <div className="text-emerald-400 truncate">$ {proj.cliCommand}</div>
                        <div className="text-neutral-500">✔ Ready on localhost:3000</div>
                      </div>
                    ) : null}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedTerminalId(isTerminalOpen ? null : proj.id)}
                        className="flex-1 py-2 rounded-xl bg-neutral-100 hover:bg-[#121316] hover:text-white text-[#111215] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>{isTerminalOpen ? "Close CLI" : "Pull CLI"}</span>
                      </button>
                      <button
                        aria-label="Star Project"
                        className="p-2 rounded-xl border border-black/10 hover:border-[#FF4A38] hover:text-[#FF4A38] text-[#71747E] transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Flagship Project Spotlight with Diverse Tech Grid ──────── */}
      <div className="relative rounded-3xl bg-[#FBFBFC] border border-black/10 p-6 sm:p-10 overflow-hidden">
        {/* Diverse Tech Thumbnails Dimming Grid */}
        <motion.div
          style={{
            filter: useTransform(gridBrightness, (v) => `brightness(${v})`),
          }}
          className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 opacity-40 blur-[1px] transition-all"
        >
          {[0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5].map((imgIdx, i) => (
            <div key={i} className="h-24 sm:h-28 rounded-2xl bg-slate-900 overflow-hidden relative">
              <Image
                src={techThumbs[imgIdx]}
                alt="tech project preview thumbnail"
                fill
                className="object-cover"
              />
            </div>
          ))}
        </motion.div>

        {/* Focused Flagship Capstone Project Card */}
        <motion.div
          style={{
            scale: profileScale,
            y: profileY,
          }}
          className="absolute inset-0 m-auto w-full max-w-[360px] sm:max-w-[420px] h-[390px] rounded-3xl bg-white border border-black/10 p-6 art-card-shadow-active flex flex-col justify-between z-30 shadow-2xl"
        >
          <div className="relative w-full h-[190px] rounded-2xl overflow-hidden bg-slate-950 border border-black/10">
            <Image
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
              alt="HyperScale Core Project Code"
              fill
              className="object-cover"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-mono text-emerald-400 font-bold border border-emerald-500/30">
              ● VERIFIED COMPILED
            </div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-white/85 backdrop-blur-md">
              <Heart className="w-4 h-4 text-[#FF4A38] fill-[#FF4A38]" />
            </div>
            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5">
              <span>Go • Rust • CUDA</span>
              <span className="text-white/40">•</span>
              <span className="text-amber-300">18.4K ★</span>
            </div>
          </div>

          <div className="pt-2 text-left">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-lg text-[#111215]">
                HyperScale Vector Engine
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-[#111215]">
                SIMD In-Memory
              </span>
            </div>
            <p className="text-xs text-[#8E929E] mt-0.5 font-medium">
              Aarav Sharma • Stanford / IIT Madras &apos;26 Fellow
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-black/5">
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              ProjectHub Fellow &apos;26
            </span>
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-[#121316] text-white text-xs font-bold hover:bg-black transition-colors shadow-sm"
            >
              View Repository
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
