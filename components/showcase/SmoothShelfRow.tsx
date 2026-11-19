"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Project } from "@/lib/firebase/types";
import PlayStoreCard from "./PlayStoreCard";

interface SmoothShelfRowProps {
  title: string;
  subtitle?: string;
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onSeeAll?: () => void;
  seeAllText?: string;
}

export default function SmoothShelfRow({
  title,
  subtitle,
  projects,
  onSelectProject,
  onSeeAll,
  seeAllText = "See all",
}: SmoothShelfRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = rowRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [projects]);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!projects || projects.length === 0) return null;

  return (
    <section className="relative space-y-3 pt-2 group/shelf">
      {/* Header with Title, Subtitle, and See All */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>{title}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll Navigation Arrows on Desktop */}
          <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-1.5 rounded-full border border-slate-200 bg-white shadow-xs transition-all ${
                canScrollLeft
                  ? "hover:bg-slate-100 hover:scale-105 text-slate-700 cursor-pointer"
                  : "text-slate-300 border-slate-100 cursor-not-allowed opacity-40"
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-1.5 rounded-full border border-slate-200 bg-white shadow-xs transition-all ${
                canScrollRight
                  ? "hover:bg-slate-100 hover:scale-105 text-slate-700 cursor-pointer"
                  : "text-slate-300 border-slate-100 cursor-not-allowed opacity-40"
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {onSeeAll && (
            <button
              onClick={onSeeAll}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors pl-2"
            >
              {seeAllText}
            </button>
          )}
        </div>
      </div>

      {/* Smooth Horizontal Scrolling Shelf */}
      <div
        ref={rowRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth overscroll-x-contain scrollbar-none select-none"
        style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
      >
        {projects.map((project) => (
          <PlayStoreCard
            key={project.id}
            project={project}
            onSelect={onSelectProject}
          />
        ))}
      </div>
    </section>
  );
}
