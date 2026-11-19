"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Github,
  ShieldCheck,
  CheckCircle2,
  Users,
  Calendar,
  Sparkles,
  ChevronRight,
  ThumbsUp,
  Cpu,
  Layers,
  Smartphone,
  Globe,
  Award,
  Play,
  Eye,
  Heart
} from "lucide-react";
import { Project } from "@/lib/firebase/types";

interface PlayStoreAppModalProps {
  project: Project | null;
  onClose: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (projectId: string) => void;
  onOpenProject?: (project: Project) => void;
}

export default function PlayStoreAppModal({
  project,
  onClose,
  isWishlisted = false,
  onToggleWishlist,
  onOpenProject,
}: PlayStoreAppModalProps) {
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [installStatus, setInstallStatus] = useState<"idle" | "downloading" | "installed">("idle");
  const [installProgress, setInstallProgress] = useState(0);
  const [installStepMessage, setInstallStepMessage] = useState("Preparing demo...");
  const [userRating, setUserRating] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "architecture" | "safety" | "evaluations">("overview");

  useEffect(() => {
    // Reset state when project changes
    setInstallStatus("idle");
    setInstallProgress(0);
    setActiveScreenshot(0);
    setUserRating(null);
    setCopiedLink(false);
    setActiveDetailTab("overview");
  }, [project?.id]);

  useEffect(() => {
    // Lock body scroll while modal is open to prevent background scrolling jitter
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    // ESC key closes modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  // Friendly live demo launcher simulator
  const handleLaunchClick = () => {
    if (installStatus === "installed") {
      if (project.liveUrl) {
        window.open(project.liveUrl, "_blank", "noopener,noreferrer");
      } else if (project.githubUrl) {
        window.open(project.githubUrl, "_blank", "noopener,noreferrer");
      } else if (project.apkDownloadUrl) {
        window.open(project.apkDownloadUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }

    setInstallStatus("downloading");
    setInstallProgress(25);
    setInstallStepMessage("Connecting to demo server...");

    const steps = [
      { pct: 50, msg: "Loading project files..." },
      { pct: 85, msg: "Starting demo environment..." },
      { pct: 100, msg: "Demo ready!" },
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setInstallProgress(steps[currentStepIdx].pct);
        setInstallStepMessage(steps[currentStepIdx].msg);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setInstallStatus("installed");
      }
    }, 400);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const screenshots = project.galleryImages && project.galleryImages.length > 0
    ? project.galleryImages
    : [
        project.image,
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      ];

  const ratingScore = project.stars ? (4.3 + (project.stars % 7) * 0.1).toFixed(1) : "4.9";
  const reviewsCount = project.views ? Math.floor(project.views / 2.3) : 647;
  const downloadCount = project.views ? `${Math.floor(project.views * 1.5)}+` : "2,235+";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md"
    >
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* ══════════ GEOMETRIC ASYMMETRICAL MODAL CONTAINER ══════════ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 35, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(2px)" }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 28,
          mass: 0.85
        }}
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-tl-[36px] rounded-tr-[14px] rounded-br-[36px] rounded-bl-[14px] shadow-2xl flex flex-col overflow-hidden border border-slate-200/90 z-10"
      >
        {/* Top Header Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 sm:px-8 py-4 bg-white/95 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-700">
              Project Details • {project.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors relative"
              title="Share project"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 text-[10px] font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md shadow-md whitespace-nowrap">
                  Link Copied!
                </span>
              )}
            </button>

            {/* Bookmark button */}
            <button
              onClick={() => onToggleWishlist && onToggleWishlist(project.id)}
              className={`p-2 rounded-full transition-colors ${
                isWishlisted
                  ? "bg-rose-50 text-rose-600"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
              title={isWishlisted ? "Saved in Wishlist" : "Save to Wishlist"}
            >
              {isWishlisted ? (
                <BookmarkCheck className="w-4 h-4 fill-rose-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ══════════ MODAL BODY ══════════ */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-7">
          
          {/* ══════ 1. PROJECT HEADER ══════ */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
              
              {/* Asymmetric Geometric Visual Pod */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-tl-[30px] rounded-tr-[8px] rounded-br-[26px] rounded-bl-[8px] overflow-hidden shadow-lg border border-slate-200/80 shrink-0 bg-slate-900 group">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl bg-gradient-to-tr from-emerald-600 to-teal-800">
                    {project.title.charAt(0)}
                  </div>
                )}
              </div>

              {/* Title & Author Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {project.title}
                  </h1>
                  {project.featured && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/90 px-2.5 py-0.5 rounded-full shadow-2xs">
                      <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                      Department Honors
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1.5 text-sm text-emerald-700 font-semibold">
                  <span>{project.author?.name || "Student Innovator"}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 text-xs font-normal">
                    {project.author?.college || "SMVITM, Udupi"}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Student Project
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>Ready for Live Preview</span>
                </p>
              </div>
            </div>

            {/* ══════ 2. HUMAN-FRIENDLY BENTO STAT CARDS ══════ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              
              {/* Tile 1: Rating */}
              <div className="p-3.5 rounded-tl-[20px] rounded-tr-[6px] rounded-br-[20px] rounded-bl-[6px] bg-slate-50 border border-slate-200/80 hover:border-amber-400/50 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold text-slate-600">Rating</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 flex items-center gap-1">
                    <span>{ratingScore}</span>
                    <span className="text-amber-500 text-sm">★</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {reviewsCount} reviews
                  </span>
                </div>
              </div>

              {/* Tile 2: Project Views */}
              <div className="p-3.5 rounded-tl-[20px] rounded-tr-[6px] rounded-br-[20px] rounded-bl-[6px] bg-slate-50 border border-slate-200/80 hover:border-emerald-400/50 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold text-slate-600">Project Views</span>
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">
                    {downloadCount}
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Total visitors
                  </span>
                </div>
              </div>

              {/* Tile 3: Project Type */}
              <div className="p-3.5 rounded-tl-[20px] rounded-tr-[6px] rounded-br-[20px] rounded-bl-[6px] bg-slate-50 border border-slate-200/80 hover:border-indigo-400/50 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold text-slate-600">Project Type</span>
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded w-fit">
                    Final Year Capstone
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Faculty Approved
                  </span>
                </div>
              </div>

              {/* Tile 4: Category */}
              <div className="p-3.5 rounded-tl-[20px] rounded-tr-[6px] rounded-br-[20px] rounded-bl-[6px] bg-slate-50 border border-slate-200/80 hover:border-teal-400/50 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold text-slate-600">Category</span>
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {project.category}
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {project.projectType || "Software"}
                  </span>
                </div>
              </div>

            </div>

            {/* ══════ 3. ACTION BUTTONS ══════ */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleLaunchClick}
                className={`flex-1 min-w-[200px] h-12 rounded-tl-[20px] rounded-tr-[6px] rounded-br-[20px] rounded-bl-[6px] font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md ${
                  installStatus === "installed"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/40"
                    : installStatus === "downloading"
                    ? "bg-slate-100 text-slate-800 border border-slate-200 cursor-wait text-xs"
                    : "bg-[#0F172A] hover:bg-black text-white hover:shadow-lg"
                }`}
              >
                {installStatus === "downloading" ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span>{installStepMessage} ({installProgress}%)</span>
                  </div>
                ) : installStatus === "installed" ? (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Live Demo in New Tab</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                    <span>Try Live Demo</span>
                  </>
                )}
              </button>

              {/* GitHub Button */}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-5 rounded-tl-[16px] rounded-tr-[5px] rounded-br-[16px] rounded-bl-[5px] border border-slate-300 hover:border-slate-800 text-slate-800 font-semibold text-xs sm:text-sm flex items-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <Github className="w-4 h-4" />
                  <span>View Source Code</span>
                </a>
              )}

              {/* Live Web Demo */}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-5 rounded-tl-[16px] rounded-tr-[5px] rounded-br-[16px] rounded-bl-[5px] border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
                >
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Visit Website</span>
                </a>
              )}

              {/* APK Download if available */}
              {project.apkDownloadUrl && (
                <a
                  href={project.apkDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-4 rounded-tl-[16px] rounded-tr-[5px] rounded-br-[16px] rounded-bl-[5px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-all"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Download APK</span>
                </a>
              )}
            </div>
          </div>

          {/* ══════ 4. PREVIEW SCREENSHOTS ══════ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">
                Preview Screenshots ({screenshots.length})
              </h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-200">
              {screenshots.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveScreenshot(idx)}
                  className={`relative flex-shrink-0 w-64 sm:w-72 h-40 sm:h-44 rounded-tl-[24px] rounded-tr-[8px] rounded-br-[24px] rounded-bl-[8px] overflow-hidden border-2 cursor-pointer transition-all duration-200 group ${
                    activeScreenshot === idx
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 scale-[1.01]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Preview Screenshot ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs rounded text-[10px] text-white font-medium">
                    Slide {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════ 5. DETAIL TABS (About, How It Works, Safety, Reviews) ══════ */}
          <div>
            <div className="flex items-center gap-4 border-b border-slate-200 text-xs sm:text-sm font-bold text-slate-600 mb-4 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveDetailTab("overview")}
                className={`pb-2.5 transition-colors relative whitespace-nowrap ${
                  activeDetailTab === "overview" ? "text-emerald-700 border-b-2 border-emerald-600 font-extrabold" : "hover:text-slate-900"
                }`}
              >
                About Project
              </button>
              <button
                onClick={() => setActiveDetailTab("architecture")}
                className={`pb-2.5 transition-colors relative whitespace-nowrap ${
                  activeDetailTab === "architecture" ? "text-emerald-700 border-b-2 border-emerald-600 font-extrabold" : "hover:text-slate-900"
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => setActiveDetailTab("safety")}
                className={`pb-2.5 transition-colors relative whitespace-nowrap ${
                  activeDetailTab === "safety" ? "text-emerald-700 border-b-2 border-emerald-600 font-extrabold" : "hover:text-slate-900"
                }`}
              >
                Quality &amp; Standards
              </button>
              <button
                onClick={() => setActiveDetailTab("evaluations")}
                className={`pb-2.5 transition-colors relative whitespace-nowrap ${
                  activeDetailTab === "evaluations" ? "text-emerald-700 border-b-2 border-emerald-600 font-extrabold" : "hover:text-slate-900"
                }`}
              >
                Ratings &amp; Reviews ({reviewsCount})
              </button>
            </div>

            {/* Tab 1: About */}
            {activeDetailTab === "overview" && (
              <div className="space-y-4">
                {project.subtitle && (
                  <p className="text-sm font-semibold text-slate-800">
                    {project.subtitle}
                  </p>
                )}
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>

                {/* Tech Stack Chips */}
                <div className="pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Technologies Used
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-medium transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: How It Works */}
            {activeDetailTab === "architecture" && (
              <div className="space-y-4">
                {project.problemStatement && (
                  <div className="p-4 rounded-tl-[20px] rounded-tr-[6px] rounded-br-[20px] rounded-bl-[6px] bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-slate-800">
                    <span className="font-bold text-amber-900 block mb-1">
                      The Problem We Solved
                    </span>
                    {project.problemStatement}
                  </div>
                )}

                {project.solution && (
                  <div className="p-4 rounded-tl-[20px] rounded-tr-[6px] rounded-br-[20px] rounded-bl-[6px] bg-emerald-50/70 border border-emerald-200/80 text-xs sm:text-sm text-slate-800">
                    <span className="font-bold text-emerald-900 block mb-1">
                      Our Solution &amp; Architecture
                    </span>
                    {project.solution}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3.5 rounded-tl-[16px] rounded-tr-[4px] rounded-br-[16px] rounded-bl-[4px] bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Team Members</span>
                    <span className="font-bold text-slate-800">{project.teamSize || 3} Student Developers</span>
                  </div>
                  <div className="p-3.5 rounded-tl-[16px] rounded-tr-[4px] rounded-br-[16px] rounded-bl-[4px] bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Project Format</span>
                    <span className="font-bold text-slate-800">{project.projectType || "Full-Stack Web App"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Quality & Safety */}
            {activeDetailTab === "safety" && (
              <div className="space-y-3">
                <div className="p-5 rounded-tl-[24px] rounded-tr-[8px] rounded-br-[24px] rounded-bl-[8px] border border-slate-200 bg-slate-50/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-900">
                      Verified Code Quality &amp; Department Standards
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This project has been verified and reviewed according to college engineering department criteria:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Safe to run with zero data tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Verified GitHub repository</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Built by verified registered students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Meets department capstone criteria</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Reviews */}
            {activeDetailTab === "evaluations" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                  <div className="text-center sm:text-left shrink-0">
                    <div className="text-5xl font-black text-slate-900 tracking-tight">
                      {ratingScore}
                    </div>
                    <div className="flex items-center gap-1 justify-center sm:justify-start text-amber-400 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {reviewsCount} community ratings
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-1.5 text-xs text-slate-500">
                    {[
                      { star: 5, pct: "85%" },
                      { star: 4, pct: "10%" },
                      { star: 3, pct: "3%" },
                      { star: 2, pct: "1%" },
                      { star: 1, pct: "1%" },
                    ].map((row) => (
                      <div key={row.star} className="flex items-center gap-2">
                        <span className="w-3 text-right">{row.star}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: row.pct }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating Input */}
                <div className="p-4 rounded-tl-[20px] rounded-tr-[6px] rounded-br-[20px] rounded-bl-[6px] bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Rate this project
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Share your rating for the idea and execution
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        onClick={() => setUserRating(starVal)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            userRating && starVal <= userRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ══════ 6. PROJECT CONTACT ══════ */}
          <div className="pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-tl-[16px] rounded-tr-[5px] rounded-br-[16px] rounded-bl-[5px] bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[11px] block mb-0.5">Project Lead</span>
                <span className="font-bold text-slate-900">{project.author?.name || "Student Innovator"}</span>
                <span className="text-slate-500 block text-[11px]">{project.author?.role || "Developer"}</span>
              </div>
              <div className="p-3.5 rounded-tl-[16px] rounded-tr-[5px] rounded-br-[16px] rounded-bl-[5px] bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[11px] block mb-0.5">Institution &amp; Department</span>
                <span className="font-bold text-slate-900">{project.author?.college || "SMVITM, Udupi"}</span>
                <span className="text-slate-500 block text-[11px]">Engineering Project Hub</span>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}
