"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Code2 } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsapUtils";
import { Project } from "@/lib/firebase/types";
import ScrambleText from "./ScrambleText";

interface PinnedHorizontalShowcaseProps {
  projects: Project[];
  title?: string;
  subtitle?: string;
}

export default function PinnedHorizontalShowcase({
  projects,
  title = "Spotlight Innovations",
  subtitle = "Scroll through high-impact student projects engineered this semester",
}: PinnedHorizontalShowcaseProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (typeof window === "undefined" || !section || !track) return;

    // Filter up to 6 projects for the horizontal rail
    const showcaseItems = projects.slice(0, 6);
    if (showcaseItems.length === 0) return;

    const ctx = gsap.context(() => {
      // Calculate total horizontal scroll distance with container bounds
      const getScrollAmount = () => {
        const trackWidth = track.scrollWidth;
        const containerWidth = section.clientWidth || window.innerWidth;
        const overflow = trackWidth - containerWidth + 64;
        return overflow > 0 ? -overflow : 0;
      };

      const getScrollDistance = () => {
        const trackWidth = track.scrollWidth;
        const containerWidth = section.clientWidth || window.innerWidth;
        const overflow = trackWidth - containerWidth + 64;
        return overflow > 0 ? Math.max(overflow + 160, 600) : 400;
      };

      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 80px",
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${self.progress * 100}%`;
            }
          },
        },
      });

      // Subtle parallax on cards inside the horizontal track
      const cards = track.querySelectorAll(".horizontal-project-card");
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { scale: 0.96, opacity: 0.9 },
          {
            scale: 1,
            opacity: 1,
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 85%",
              end: "center center",
              scrub: true,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, [projects]);

  const items = projects.slice(0, 6);
  if (items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-gradient-to-b from-slate-900 via-[#0B0F19] to-slate-950 text-white rounded-[32px] my-12 border border-slate-800 shadow-2xl py-12 px-6 sm:px-10"
    >
      {/* Dynamic Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#6366f1 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header bar with scrub progress indicator */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>PINNED HORIZONTAL REEL</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* Scrub Progress Bar */}
        <div className="w-48 sm:w-64 bg-slate-800/80 h-2 rounded-full overflow-hidden border border-slate-700/60 p-[1px]">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full w-0 transition-all duration-75"
          />
        </div>
      </div>

      {/* Sideways scrolling track */}
      <div
        ref={trackRef}
        className="flex items-stretch gap-6 will-change-transform py-4"
        style={{ width: "max-content" }}
      >
        {items.map((project, index) => (
          <div
            key={project.id || index}
            className="horizontal-project-card group relative w-[320px] sm:w-[380px] shrink-0 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/60 p-5 shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Media Preview */}
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-950 mb-4 border border-slate-800">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950">
                    <Code2 className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-indigo-300 border border-white/10">
                    <ScrambleText triggerOn="hover">{project.category || "Featured"}</ScrambleText>
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    {project.status || "Published"}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1.5">
                {project.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {project.description || "Student capstone project showcase."}
              </p>
            </div>

            {/* Tags & Action */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                {project.tags?.slice(0, 2).map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700/50"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <Link
                href={`/projects/${project.id}`}
                className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-105"
                title="Inspect Project"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
