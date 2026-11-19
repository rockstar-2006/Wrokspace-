"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Star, Award, Zap, Sparkles } from "lucide-react";
import { Project } from "@/lib/firebase/types";
import PlayStoreCard from "./PlayStoreCard";

interface PlayStoreTopChartsProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export default function PlayStoreTopCharts({
  projects,
  onSelectProject,
}: PlayStoreTopChartsProps) {
  const [activeTab, setActiveTab] = useState<"top-free" | "top-rated" | "trending">("top-free");

  // Sort projects depending on active tab
  const sortedProjects = [...projects].sort((a, b) => {
    if (activeTab === "top-rated") {
      return (b.stars || 0) - (a.stars || 0);
    }
    if (activeTab === "trending") {
      return (b.views || 0) - (a.views || 0);
    }
    // top-free: balanced ranking by stars + views
    const scoreA = (a.stars || 10) * 2 + (a.views || 50);
    const scoreB = (b.stars || 10) * 2 + (b.views || 50);
    return scoreB - scoreA;
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Charts Filter Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("top-free")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "top-free"
              ? "bg-[#0F172A] text-white shadow-md shadow-slate-900/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Top Open Source</span>
        </button>

        <button
          onClick={() => setActiveTab("top-rated")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "top-rated"
              ? "bg-[#0F172A] text-white shadow-md shadow-slate-900/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Top Rated by Faculty</span>
        </button>

        <button
          onClick={() => setActiveTab("trending")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "trending"
              ? "bg-[#0F172A] text-white shadow-md shadow-slate-900/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
          <span>Trending Deployments</span>
        </button>
      </div>

      {/* 2-Column Grid of Horizontal Ranked App Rows with Animated Stagger */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
        >
          {sortedProjects.slice(0, 10).map((project, idx) => (
            <PlayStoreCard
              key={project.id}
              project={project}
              onSelect={onSelectProject}
              layout="horizontal"
              rank={idx + 1}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
