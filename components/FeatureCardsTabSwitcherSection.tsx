"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Layers, Box, Cpu } from "lucide-react";
import { gsap, ScrollTrigger, Flip } from "@/lib/gsapUtils";
import CinematicSplitText from "@/components/CinematicSplitText";

export default function FeatureCardsTabSwitcherSection() {
  const [activeTab, setActiveTab] = useState<"personal" | "business">("personal");
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);

  /* ── GSAP ScrollTrigger Animations ───────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Left column headline and text reveal
      const leftColEl = leftColRef.current;
      if (leftColEl) {
        gsap.fromTo(
          leftColEl.children,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            stagger: 0.1,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: leftColEl,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 2. Right column cards reveal
      const cardsGridEl = cardsGridRef.current;
      if (cardsGridEl) {
        gsap.fromTo(
          cardsGridEl.children,
          { scale: 0.95, y: 30, opacity: 0 },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 0.95,
            stagger: 0.08,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: cardsGridEl,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const personalCards = [
    {
      id: 1,
      title: "Neural Canvas AI",
      tag: "Generative Code",
      image: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      title: "HyperScale Vector Store",
      tag: "Infra & DB",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      title: "Fluid Motion Engine",
      tag: "WebGL & 3D",
      image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      title: "Micro-SaaS Boilerplate",
      tag: "Fullstack App",
      image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const businessCards = [
    {
      id: 5,
      title: "Enterprise API Hub",
      tag: "Distributed Sys",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 6,
      title: "Curated Asset Registry",
      tag: "Marketplace",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 7,
      title: "Automated Code Auditing",
      tag: "Security & CI",
      image: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 8,
      title: "Team Workspace Mesh",
      tag: "Collaboration",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const currentCards = activeTab === "personal" ? personalCards : businessCards;

  /* ── UI & Layout Morphing: GSAP Flip State Transition ────────────── */
  const handleTabSwitch = (newTab: "personal" | "business") => {
    if (newTab === activeTab) return;

    if (cardsGridRef.current) {
      const cardElements = cardsGridRef.current.querySelectorAll(".feature-card-item");
      const state = Flip.getState(cardElements);

      setActiveTab(newTab);

      requestAnimationFrame(() => {
        if (!cardsGridRef.current) return;
        Flip.from(state, {
          duration: 0.65,
          ease: "power3.inOut",
          scale: true,
          stagger: 0.05,
          onEnter: (elements) => {
            gsap.fromTo(
              elements,
              { opacity: 0, scale: 0.9, y: 25 },
              { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power2.out" }
            );
          },
          onLeave: (elements) => {
            gsap.to(elements, {
              opacity: 0,
              scale: 0.9,
              duration: 0.25,
              ease: "power2.in",
            });
          },
        });
      });
    } else {
      setActiveTab(newTab);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="vision"
      className="py-10 md:py-16 px-6 sm:px-12 max-w-[1440px] mx-auto w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Anchored Headline & Feature Icons with GSAP */}
        <div ref={leftColRef} className="lg:col-span-5 flex flex-col items-start lg:sticky lg:top-28">
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#71747E] mb-3 will-change-transform">
            PROJECTHUB ECOSYSTEM
          </span>

          <CinematicSplitText
            tag="h2"
            type="words"
            duration={1.05}
            stagger={0.04}
            className="text-4xl sm:text-6xl md:text-[64px] font-extrabold tracking-[-0.04em] text-[#111215] leading-[1.05]"
          >
            Engineered for student builders &amp; team squads.
          </CinematicSplitText>

          <p className="mt-5 text-sm text-[#71747E] leading-relaxed max-w-sm will-change-transform">
            Designed to bridge the gap between classroom prototypes, verified code repositories, and industry hiring. Flexible for solo student hackers and scalable for campus innovation squads.
          </p>

          {/* Linear feature icons with hover dynamics */}
          <div className="mt-8 flex items-center gap-5 text-[#71747E] will-change-transform">
            <span className="p-3 rounded-2xl bg-neutral-100 border border-black/5 flex items-center justify-center hover:scale-110 hover:bg-neutral-200 transition-all cursor-pointer">
              <Box className="w-5 h-5 text-[#111215]" />
            </span>
            <span className="p-3 rounded-2xl bg-neutral-100 border border-black/5 flex items-center justify-center hover:scale-110 hover:bg-neutral-200 transition-all cursor-pointer">
              <Layers className="w-5 h-5 text-[#111215]" />
            </span>
            <span className="p-3 rounded-2xl bg-neutral-100 border border-black/5 flex items-center justify-center hover:scale-110 hover:bg-neutral-200 transition-all cursor-pointer">
              <Sparkles className="w-5 h-5 text-[#111215]" />
            </span>
            <span className="p-3 rounded-2xl bg-neutral-100 border border-black/5 flex items-center justify-center hover:scale-110 hover:bg-neutral-200 transition-all cursor-pointer">
              <Cpu className="w-5 h-5 text-[#111215]" />
            </span>
          </div>
        </div>

        {/* Right Column: Toggle Switch + 4 Cards Morphing with GSAP Flip in 2x2 Grid */}
        <div className="lg:col-span-7 flex flex-col items-end">
          {/* Segmented Toggle: Solo Student Builders vs Campus Squads with GSAP Flip trigger */}
          <div className="p-1.5 rounded-full bg-white border border-black/10 shadow-sm inline-flex mb-8">
            <button
              onClick={() => handleTabSwitch("personal")}
              className={`px-7 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === "personal" ? "text-white" : "text-[#71747E] hover:text-[#111215]"
              }`}
            >
              {activeTab === "personal" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#121316] rounded-full -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              Solo Student Builders
            </button>

            <button
              onClick={() => handleTabSwitch("business")}
              className={`px-7 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === "business" ? "text-white" : "text-[#71747E] hover:text-[#111215]"
              }`}
            >
              {activeTab === "business" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#121316] rounded-full -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              Campus Labs &amp; Squads
            </button>
          </div>

          {/* Staggered 2x2 Grid with Flip elements */}
          <div
            ref={cardsGridRef}
            className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
          >
            {currentCards.map((card, idx) => (
              <div
                key={card.id}
                data-flip-id={`card-${card.id}`}
                className={`feature-card-item rounded-3xl overflow-hidden art-card-shadow bg-white border border-black/10 p-4 transition-all duration-300 hover:-translate-y-2 group cursor-pointer ${
                  idx % 2 === 1 ? "sm:translate-y-12" : ""
                }`}
              >
                <div className="relative w-full h-[260px] rounded-2xl overflow-hidden bg-slate-900 mb-4">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                    {card.tag}
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 pt-1 pb-2">
                  <h4 className="font-extrabold text-[#111215] text-base group-hover:text-brand-red transition-colors">
                    {card.title}
                  </h4>
                  <span className="text-xs font-bold text-[#71747E] group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
