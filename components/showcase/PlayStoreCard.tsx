"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Code2, Sparkles, ExternalLink } from "lucide-react";
import { Project } from "@/lib/firebase/types";

interface PlayStoreCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  layout?: "vertical" | "horizontal" | "compact";
  rank?: number;
}

export default function PlayStoreCard({
  project,
  onSelect,
  layout = "vertical",
  rank,
}: PlayStoreCardProps) {
  const ratingScore = project.stars ? (4.3 + (project.stars % 7) * 0.1).toFixed(1) : "4.9";
  const viewsDisplay = project.views ? (project.views > 999 ? `${(project.views / 1000).toFixed(1)}k` : `${project.views}`) : "1.2k";

  // ═══════════════ HORIZONTAL LEADERBOARD CARD ═══════════════
  if (layout === "horizontal") {
    return (
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => onSelect(project)}
        className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-tl-[24px] rounded-tr-[10px] rounded-br-[24px] rounded-bl-[10px] bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-emerald-500/50 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden select-none"
      >
        {/* Subtle luminous accent bar on left */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 via-teal-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-center gap-3.5 min-w-0">
          {/* Rank Number with trophy highlight for top 3 */}
          {rank !== undefined && (
            <div className="w-6 text-center font-bold text-sm shrink-0">
              {rank === 1 ? (
                <span className="text-amber-500 font-extrabold flex items-center justify-center">1🥇</span>
              ) : rank === 2 ? (
                <span className="text-slate-400 font-extrabold flex items-center justify-center">2🥈</span>
              ) : rank === 3 ? (
                <span className="text-amber-700 font-extrabold flex items-center justify-center">3🥉</span>
              ) : (
                <span className="text-slate-400 group-hover:text-slate-800">{rank}</span>
              )}
            </div>
          )}

          {/* Geometric Asymmetric Image Viewport */}
          <div className="relative w-16 h-16 rounded-tl-[18px] rounded-tr-[6px] rounded-br-[18px] rounded-bl-[6px] overflow-hidden bg-slate-900 shrink-0 border border-black/5 shadow-inner">
            {project.image ? (
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-black text-lg bg-gradient-to-tr from-indigo-900 to-purple-900">
                {project.title.charAt(0)}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                {project.title}
              </h4>
              {project.featured && (
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                  ★ Pick
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
              {project.author?.name || "Student Innovator"} <span className="text-slate-300">•</span> {project.category}
            </p>

            <div className="flex items-center gap-2.5 mt-1 text-[11px] text-slate-600">
              <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50/80 px-1.5 py-0.2 rounded">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {ratingScore}
              </span>
              <span>{viewsDisplay} views</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="hidden sm:inline px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                {project.tags[0] || "Software"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(project);
            }}
            className="px-3.5 py-1.5 rounded-full bg-slate-100 group-hover:bg-[#0F172A] group-hover:text-white text-slate-800 font-bold text-xs transition-all shadow-2xs group-hover:shadow"
          >
            View Project ↗
          </button>
        </div>
      </motion.div>
    );
  }

  // ═══════════════ VERTICAL GEOMETRIC CARD ═══════════════
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      onClick={() => onSelect(project)}
      className="group relative flex flex-col w-56 sm:w-60 shrink-0 rounded-tl-[32px] rounded-tr-[12px] rounded-br-[32px] rounded-bl-[12px] bg-white hover:bg-slate-50/60 p-3 border border-slate-200/90 hover:border-emerald-500/50 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer select-none overflow-hidden"
    >
      {/* ── Inner Widescreen Viewport ── */}
      <div className="relative w-full h-36 rounded-tl-[24px] rounded-tr-[6px] rounded-br-[20px] rounded-bl-[8px] overflow-hidden bg-slate-950 border border-black/5 mb-3 group-hover:shadow-md transition-all duration-300">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-indigo-400 bg-slate-950">
            <Code2 className="w-8 h-8" />
          </div>
        )}

        {/* Gradient Shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{project.category}</span>
          </span>

          {project.featured && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-bold flex items-center gap-0.5 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
              <span>HONOR</span>
            </span>
          )}
        </div>

        {/* Rating and Views */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] z-10">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{ratingScore}</span>
          </div>

          <span className="text-[10px] text-slate-200 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
            {viewsDisplay} views
          </span>
        </div>
      </div>

      {/* ── Lower Info Deck ── */}
      <div className="flex-1 flex flex-col justify-between px-1 space-y-2">
        <div>
          {/* Title */}
          <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors tracking-tight">
            {project.title}
          </h4>

          {/* Author */}
          <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
            {project.author?.name || "Student Innovator"}
          </p>
        </div>

        {/* Tags and Action Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Tag Pill */}
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-800 text-slate-600 transition-colors truncate max-w-[110px]">
            {project.tags[0] || "Software"}
          </span>

          {/* Action Link */}
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">
            <span>Explore</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Subtle bottom edge glow on hover */}
      <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
