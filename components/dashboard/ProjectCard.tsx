"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";
import { Project } from "@/lib/firebase/types";
import { gsap } from "@/lib/gsapUtils";
import ScrambleText from "@/components/animations/ScrambleText";

interface ProjectCardProps {
  project: Project;
  onSelect?: (project: Project) => void;
  className?: string;
  isInteractive?: boolean;
  compact?: boolean;
}

export default function ProjectCard({
  project,
  onSelect,
  className = "",
  isInteractive = true,
  compact = false,
}: ProjectCardProps) {
  const isPublished = project.status === "Published";
  const isPending = project.status === "Pending review" || project.status === "Under Review";
  const cardShellRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    return () => {
      if (cardShellRef.current) {
        gsap.killTweensOf(cardShellRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (compact && cardShellRef.current) {
      gsap.killTweensOf(cardShellRef.current);
      gsap.set(cardShellRef.current, { rotateX: 0, rotateY: 0, clearProps: "transform" });
    }
  }, [compact]);

  // 3D Perspective Tilt on Hover with GSAP
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardShellRef.current || compact) return;
    const rect = cardShellRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    gsap.to(cardShellRef.current, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      ease: "power1.out",
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    if (!cardShellRef.current || compact) return;
    gsap.to(cardShellRef.current, {
      rotateX: 0,
      rotateY: 0,
      ease: "power2.out",
      duration: 0.5,
    });
  };

  // Compact / List View Render
  if (compact) {
    const compactContent = (
      <div
        onClick={() => onSelect && onSelect(project)}
        className={`group relative bg-white border border-slate-200/90 hover:border-indigo-400/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer select-none ${className}`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-100">
            {project.image ? (
              <Image
                src={project.image}
                alt={project.title || "Project Preview"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-indigo-400">
                <Code2 className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {project.category || "General"}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isPublished
                    ? "bg-emerald-50 text-emerald-600"
                    : isPending
                    ? "bg-amber-50 text-amber-600"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {project.status || "Draft"}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 truncate transition-colors">
              {project.title}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              {project.subtitle || project.description}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 flex items-center gap-1 transition-colors">
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );

    if (!isInteractive || !project.id || project.id === "preview") {
      return compactContent;
    }

    return (
      <Link href={`/projects/${project.id}`} className="block">
        {compactContent}
      </Link>
    );
  }

  const cardContent = (
    <div
      onClick={() => onSelect && onSelect(project)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative transition-all duration-300 ease-out cursor-pointer transform hover:-translate-y-1.5 select-none ${className}`}
    >
      {/* ── Ambient Soft Glow on Hover ── */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-blue-500/0 group-hover:from-indigo-500/20 group-hover:via-indigo-500/25 group-hover:to-blue-500/20 rounded-[28px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* ════════ Outer Polygonal Shell with Sleek Geometric Chamfered Corners ════════ */}
      <div
        ref={cardShellRef}
        className="relative bg-white border border-slate-200/90 group-hover:border-indigo-400/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] group-hover:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.22)] transition-all duration-300 overflow-hidden will-change-transform"
        style={{
          // Geometric Asymmetric Cut: Top-right & bottom-left 45-degree chamfered cuts
          clipPath:
            "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
        }}
      >
        {/* Subtle Geometric Dot Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#4338ca 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        />

        {/* ── Top-Right Chamfer Corner Accent ── */}
        <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none z-30">
          <div className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-bl from-indigo-600 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* ── Bottom-Left Chamfer Corner Accent ── */}
        <div className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none z-30">
          <div className="absolute bottom-0 left-0 w-5 h-5 bg-gradient-to-tr from-cyan-600 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* ════════ Zone 1: Diagonal Angled Media Vault ════════ */}
        <div className="relative">
          <div
            className="relative h-48 bg-slate-900 overflow-hidden"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 100%)",
            }}
          >
            {project.image ? (
              <Image
                src={project.image}
                alt={project.title || "Project Preview"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 relative z-10 bg-slate-900">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
                  <Code2 className="w-6 h-6 stroke-[1.5]" />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Project Preview
                </span>
              </div>
            )}

            {/* Dark Vignette Overlay for High Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

            {/* ── Top-Left: Clean Category Badge with Scramble on Hover ── */}
            <div className="absolute top-3 left-3 z-20">
              <div className="px-3 py-1 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-md text-white text-[11px] font-bold tracking-tight shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <ScrambleText triggerOn="hover">
                  {project.category || "Project"}
                </ScrambleText>
              </div>
            </div>

            {/* ── Top-Right: Clean Status Pill ── */}
            <div className="absolute top-3 right-5 z-20">
              <div
                className={`px-3 py-1 text-[11px] font-bold rounded-full backdrop-blur-md border shadow-md flex items-center gap-1.5 ${
                  isPublished
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                    : isPending
                    ? "bg-amber-950/80 text-amber-300 border-amber-500/30"
                    : "bg-slate-900/80 text-slate-300 border-slate-700/40"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPublished
                      ? "bg-emerald-400 animate-pulse"
                      : isPending
                      ? "bg-amber-400"
                      : "bg-slate-400"
                  }`}
                />
                <span>{project.status || "Draft"}</span>
              </div>
            </div>

            {/* ── Bottom-Left: Academic Batch / Year Badge ── */}
            {project.academicYear && (
              <div className="absolute bottom-6 left-3 z-20">
                <span className="text-[11px] font-semibold text-white bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/15">
                  {project.academicYear}
                </span>
              </div>
            )}
          </div>

          {/* ── Sleek Diagonal Accent Line ── */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 z-20"
            style={{
              transform: "translateY(-6px) rotate(-2.4deg)",
              transformOrigin: "left center",
            }}
          />

          {/* ── Floating Diamond Kinetic Launcher (Rotates on Hover) ── */}
          <div className="absolute -bottom-3 right-5 z-30">
            <div className="w-8 h-8 bg-[#0F172A] group-hover:bg-[#4338CA] text-white border-2 border-white shadow-lg flex items-center justify-center transform rotate-45 group-hover:rotate-90 group-hover:scale-105 transition-all duration-300 cursor-pointer">
              <ArrowUpRight className="w-4 h-4 transform -rotate-45 group-hover:-rotate-90 transition-transform text-white stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* ════════ Zone 2: Clean Metadata Info Strip ════════ */}
        <div className="px-5 pt-3 pb-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#4338CA]">
              {project.projectType || "Project"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-500">
              Team of {project.teamSize || 1}
            </span>
          </div>

          <span className="text-[11px] font-medium text-slate-400">
            {project.subtitle || project.category || ""}
          </span>
        </div>

        {/* ════════ Zone 3: Project Content & Details ════════ */}
        <div className="p-5 pt-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Project Title */}
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-[#4338CA] transition-colors line-clamp-1 mb-1.5">
              {project.title || "Untitled Project"}
            </h3>

            {/* Description */}
            <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed mb-4">
              {project.description || "No project overview provided yet."}
            </p>
          </div>

          <div>
            {/* ── Clean Tech Stack Chips ── */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {project.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-[11px] font-medium rounded-md transition-all"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded-md">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* ── Footer: Author & View Project Link ── */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {/* Author */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-[#4338CA] to-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm border border-slate-200/60">
                  {project.author?.avatar ? (
                    <img
                      src={project.author.avatar}
                      alt={project.author.name || "Author"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : project.author?.name ? (
                    project.author.name.charAt(0).toUpperCase()
                  ) : (
                    "S"
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {project.author?.name || "Student Creator"}
                  </p>
                  {project.author?.studentCode && (
                    <p className="text-[10px] font-medium text-slate-400 truncate">
                      {project.author.studentCode}
                    </p>
                  )}
                </div>
              </div>

              {/* View Project Action */}
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4338CA] group-hover:translate-x-0.5 transition-transform">
                <span>View Project</span>
                <span className="text-xs">↗</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom Laser Accent Line ── */}
        <div className="h-[2px] w-full bg-gradient-to-r from-cyan-400 via-[#4338CA] to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );

  if (!isInteractive || !project.id || project.id === "preview") {
    return cardContent;
  }

  return (
    <Link href={`/projects/${project.id}`} className="block">
      {cardContent}
    </Link>
  );
}
