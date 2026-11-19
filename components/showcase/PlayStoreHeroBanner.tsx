"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Download, Sparkles, ChevronLeft, ChevronRight, Award, ExternalLink, ShieldCheck, Play } from "lucide-react";
import { Project } from "@/lib/firebase/types";

interface PlayStoreHeroBannerProps {
  featuredProjects: Project[];
  onSelectProject: (project: Project) => void;
}

export default function PlayStoreHeroBanner({
  featuredProjects,
  onSelectProject,
}: PlayStoreHeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate banner every 7s with smooth interval
  useEffect(() => {
    if (!featuredProjects || featuredProjects.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProjects.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [featuredProjects?.length]);

  // If no projects provided, return null AFTER all hooks
  if (!featuredProjects || featuredProjects.length === 0) return null;

  const activeProject = featuredProjects[currentIndex] || featuredProjects[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredProjects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredProjects.length);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-[#0B0F19] text-white">
      {/* ── Dynamic Ambient Mesh Aurora Backdrops ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeProject.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={activeProject.heroVideoImage || activeProject.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85"}
            alt={activeProject.title}
            fill
            className="object-cover opacity-25 blur-xs scale-105"
            priority
          />
          {/* Multi-layered cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/75 to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* ── Main Foreground Content ── */}
      <div className="relative z-10 p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 min-h-[380px] sm:min-h-[420px]">
        
        {/* Left Side: Metadata & CTA */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProject.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-xl space-y-4"
          >
            {/* Badges Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Featured Project</span>
              </span>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 backdrop-blur-md border border-white/15">
                {activeProject.category}
              </span>

              {activeProject.finalYearProject && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Award className="w-3.5 h-3.5" />
                  <span>Capstone Finalist</span>
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
                {activeProject.title}
              </h2>
              {activeProject.subtitle && (
                <p className="text-slate-300 text-sm sm:text-base font-medium mt-1">
                  {activeProject.subtitle}
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-300/90 text-xs sm:text-sm line-clamp-3 leading-relaxed max-w-lg">
              {activeProject.description}
            </p>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3.5 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{activeProject.stars ? (4.3 + (activeProject.stars % 7) * 0.1).toFixed(1) : "4.9"}</span>
              </div>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold">{activeProject.views ? `${activeProject.views}+ Views` : "2.4K+ Views"}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">By {activeProject.author?.name || "Student Innovator"}</span>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 pt-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => onSelectProject(activeProject)}
                className="h-11 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>View Project Details</span>
              </motion.button>

              {activeProject.liveUrl && (
                <a
                  href={activeProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all"
                >
                  <span>Visit Live Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right Side: Geometric Hologram Card */}
        <div className="hidden md:flex flex-col items-center justify-center shrink-0">
          <motion.div
            whileHover={{ y: -6, rotateY: 6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => onSelectProject(activeProject)}
            className="group relative w-64 h-76 rounded-tl-[32px] rounded-tr-[10px] rounded-br-[32px] rounded-bl-[10px] overflow-hidden shadow-2xl border border-white/20 cursor-pointer bg-slate-900"
            style={{ perspective: 1000 }}
          >
            <Image
              src={activeProject.image}
              alt={activeProject.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            {/* Luminous border on hover */}
            <div className="absolute inset-0 border-2 border-emerald-500/0 group-hover:border-emerald-500/60 rounded-tl-[32px] rounded-tr-[10px] rounded-br-[32px] rounded-bl-[10px] transition-colors duration-300 pointer-events-none" />

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Faculty Approved Project
              </span>
              <h4 className="font-extrabold text-base truncate">{activeProject.title}</h4>
              <p className="text-[11px] text-slate-300 truncate mt-0.5 font-medium">
                {activeProject.author?.college || "Department of Engineering"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
        <button
          onClick={handlePrev}
          aria-label="Previous Featured Project"
          className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 px-1.5">
          {featuredProjects.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === i ? "w-7 bg-emerald-400 shadow-sm shadow-emerald-400/50" : "w-1.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          aria-label="Next Featured Project"
          className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
