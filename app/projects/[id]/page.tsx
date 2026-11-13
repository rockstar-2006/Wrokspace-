"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Bell,
  Play,
  ExternalLink,
  Github,
  Download,
  Trash2,
  Share2,
  Bookmark,
  Users,
  GraduationCap,
  Calendar,
  Sparkles,
  CheckCircle2,
  Globe,
  Video,
  FileText,
  Check,
  Code2,
  Lightbulb,
  AlertCircle,
  Eye,
  Star,
  Maximize2,
  X,
  Copy,
  ChevronDown,
  ChevronUp,
  FileEdit,
} from "lucide-react";
import ModernBottomNav from "@/components/dashboard/ModernBottomNav";
import { Project } from "@/lib/firebase/types";
import { useAuth } from "@/lib/context/AuthContext";
import { FirestoreService } from "@/lib/firebase/firestoreService";
import SplitTextHeading from "@/components/animations/SplitTextHeading";
import ScrambleText from "@/components/animations/ScrambleText";
import TypewriterText from "@/components/animations/TypewriterText";
import PageTransitionWrapper from "@/components/animations/PageTransitionWrapper";
import ParallaxContainer from "@/components/animations/ParallaxContainer";
import { gsap, Flip, ScrollTrigger } from "@/lib/gsapUtils";

type TabKey = "overview" | "screenshots" | "demo" | "resources" | "team" | "discussion";

export default function SingleProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [activeHeroMedia, setActiveHeroMedia] = useState<string>("");
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Expandable text states for long Problem Statement & Solution
  const [isPsExpanded, setIsPsExpanded] = useState(false);
  const [isSolExpanded, setIsSolExpanded] = useState(false);
  const [readingModal, setReadingModal] = useState<{
    title: string;
    text: string;
    type: "problem" | "solution";
  } | null>(null);
  const [copiedModalText, setCopiedModalText] = useState(false);

  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // ScrollTrigger scrubbed reading progress bar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (scrollProgressRef.current) {
            scrollProgressRef.current.style.width = `${self.progress * 100}%`;
          }
        },
      });
    });
    return () => ctx.revert();
  }, []);

  const tabsFlipStateRef = useRef<any>(null);

  // Flip layout morphing for tabs
  const handleTabChange = (newTab: TabKey) => {
    if (newTab === activeTab) return;
    if (typeof window !== "undefined" && tabsContainerRef.current) {
      tabsFlipStateRef.current = Flip.getState(
        tabsContainerRef.current.querySelectorAll(".tab-button, .tab-indicator")
      );
    }
    setActiveTab(newTab);
  };

  useEffect(() => {
    if (tabsFlipStateRef.current && tabsContainerRef.current) {
      Flip.from(tabsFlipStateRef.current, {
        duration: 0.35,
        ease: "power2.out",
      });
      tabsFlipStateRef.current = null;
    }
  }, [activeTab]);

  // Discussion state
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<
    Array<{ id: string; author: string; role: string; text: string; date: string }>
  >([
    {
      id: "c1",
      author: "Prof. Raghavendra Rao",
      role: "Faculty Evaluator",
      text: "Outstanding architecture and well-documented API contracts. Excellent work on the offline caching strategy!",
      date: "2 days ago",
    },
    {
      id: "c2",
      author: "Aditi Vernekar",
      role: "Peer Reviewer",
      text: "The implementation methodology is very clear. Did you test latency with live concurrent users?",
      date: "Yesterday",
    },
  ]);

  // Load project dynamically from Firestore or local storage caches (No dummy fallback)
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const found = await FirestoreService.getProjectById(projectId, user?.uid);
        if (isMounted) {
          if (found) {
            setProject(found);
            setActiveHeroMedia(
              found.image || found.heroVideoImage || "/assets/add-project/hero-isometric.jpg"
            );
          } else {
            setProject(null);
          }
        }
      } catch (err) {
        console.warn("Failed to load project details:", err);
        if (isMounted) setProject(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (projectId) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [projectId, user?.uid]);

  // Handle Share link
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Handle Delete Project
  const handleDelete = async () => {
    if (!project) return;
    setIsDeleting(true);
    try {
      await FirestoreService.deleteProject(project.id, user?.uid || profile?.uid);
      setShowDeleteConfirm(false);
      router.push("/dashboard");
    } catch (err) {
      console.error("Delete project failed:", err);
      alert("Failed to delete project. Please try again.");
      setIsDeleting(false);
    }
  };

  // Handle Post Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newC = {
      id: `c-${Date.now()}`,
      author: profile?.fullName || "Student",
      role: profile?.department ? `${profile.department} Student` : "Peer Reviewer",
      text: commentText.trim(),
      date: "Just now",
    };
    setComments([newC, ...comments]);
    setCommentText("");
  };

  // Copy modal text
  const handleCopyModalText = () => {
    if (readingModal && typeof window !== "undefined") {
      navigator.clipboard.writeText(readingModal.text);
      setCopiedModalText(true);
      setTimeout(() => setCopiedModalText(false), 2000);
    }
  };

  const isOwner =
    Boolean(project) &&
    (user?.uid === project?.ownerId ||
      profile?.uid === project?.ownerId ||
      profile?.studentCode === project?.ownerCode ||
      !project?.ownerId);

  // Construct gallery list
  const gallery =
    project?.galleryImages && project.galleryImages.length > 0
      ? project.galleryImages
      : project?.image
      ? [project.image]
      : ["/assets/add-project/hero-isometric.jpg"];

  while (gallery.length < 4 && gallery.length > 0) {
    gallery.push(gallery[0]);
  }

  // Construct team list
  const teamList =
    project?.teamMembers && project.teamMembers.length > 0
      ? project.teamMembers
      : project?.author?.name
      ? [
          {
            name: project.author.name,
            role: project.author.role || "Lead Creator",
            avatar: project.author.avatar || "",
            usn: project.author.studentCode || "",
          },
        ]
      : [];

  return (
    <div className="min-h-screen bg-[#FBFBFE] pb-28 selection:bg-[#4338CA] selection:text-white flex flex-col">
      {/* ── ScrollTrigger Reading Progress Line ── */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-200/50 pointer-events-none">
        <div
          ref={scrollProgressRef}
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-400 w-0 transition-all duration-75"
        />
      </div>

      {/* ════════════ Modern Bottom Navigation (No Sidebar Anywhere!) ════════════ */}
      <ModernBottomNav activeTab="projects" />

      {/* ════════════ Top Header Navigation Bar ════════════ */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Back to Projects */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>

        {/* Center: Search projects input */}
        <div className="relative max-w-sm w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Share Project"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? "text-amber-500 bg-amber-50"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
            title="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
          </button>

          <button
            type="button"
            className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600 ring-2 ring-white" />
          </button>

          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-2xs overflow-hidden ml-1">
            {profile?.photoURL ? (
              <Image
                src={profile.photoURL}
                alt={profile.fullName || "User"}
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : "S"}</span>
            )}
          </div>
        </div>
      </header>

      {/* ════════════ Main Canvas ════════════ */}
      <main className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* SKELETON LOADER STATE */}
        {isLoading ? (
          <div className="space-y-5 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              <div className="md:col-span-5 space-y-2">
                <div className="h-[210px] bg-slate-200 rounded-xl" />
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-slate-200 rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="md:col-span-7 space-y-3">
                <div className="w-20 h-5 bg-slate-200 rounded-full" />
                <div className="w-3/4 h-7 bg-slate-200 rounded" />
                <div className="w-1/3 h-4 bg-slate-200 rounded" />
                <div className="w-full h-12 bg-slate-100 rounded" />
                <div className="flex gap-2">
                  <div className="w-16 h-5 bg-slate-200 rounded" />
                  <div className="w-16 h-5 bg-slate-200 rounded" />
                </div>
                <div className="w-full h-8 bg-slate-100 rounded" />
                <div className="flex gap-3 pt-2">
                  <div className="w-28 h-9 bg-slate-200 rounded-xl" />
                  <div className="w-24 h-9 bg-slate-200 rounded-xl" />
                </div>
              </div>
            </div>
            <div className="h-8 bg-slate-200 rounded-lg w-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-7 space-y-3">
                <div className="h-28 bg-slate-200 rounded-xl" />
                <div className="h-28 bg-slate-200 rounded-xl" />
              </div>
              <div className="md:col-span-5 space-y-3">
                <div className="h-20 bg-slate-200 rounded-xl" />
                <div className="h-28 bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        ) : !project ? (
          /* NOT FOUND STATE */
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-100 shadow-xs max-w-md mx-auto my-12">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Project Not Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              The project you are looking for does not exist or may have been deleted.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Browse All Projects</span>
              </Link>
            </div>
          </div>
        ) : (
          /* PROJECT DETAILS CONTENT */
          <div className="space-y-4">
            {/* ════════════ Top Hero Grid (Side-by-Side Media & Metadata) ════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Column: Media Player + 4 Thumbnails (5 cols) */}
              <div className="md:col-span-5 flex flex-col gap-2">
                <div className="relative h-[200px] sm:h-[220px] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200/90 shadow-sm group">
                  <Image
                    src={activeHeroMedia || project.image}
                    alt={project.title}
                    fill
                    priority
                    className="object-cover transition-transform duration-300 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 pointer-events-none" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (project.videoUrl) {
                          window.open(project.videoUrl, "_blank");
                        } else {
                          setIsPlayingDemo(!isPlayingDemo);
                        }
                      }}
                      className="w-12 h-12 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white shadow-xl flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-xs border border-white/20 cursor-pointer"
                      title="Play Video Demo"
                    >
                      <Play className="w-5 h-5 fill-white ml-0.5 text-white" />
                    </button>
                  </div>
                </div>

                {/* 4 Thumbnails */}
                <div className="grid grid-cols-4 gap-2">
                  {gallery.slice(0, 4).map((thumb, idx) => {
                    const isActive = activeHeroMedia === thumb;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveHeroMedia(thumb)}
                        className={`relative h-[50px] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          isActive
                            ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <Image src={thumb} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Title, Subtitle, Description, Tech Stack & Buttons (7 cols) */}
              <div className="md:col-span-7 flex flex-col justify-between min-h-[270px]">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-bold tracking-tight mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{project.status || "Published"}</span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-0.5">
                    {project.title}
                  </h1>

                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    {project.subtitle || project.projectType || "Software Project"}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal mb-2.5 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    {project.tags && project.tags.length > 0 ? (
                      project.tags
                        .flatMap((t) =>
                          typeof t === "string"
                            ? t.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
                            : []
                        )
                        .map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 bg-indigo-50/90 text-indigo-600 border border-indigo-100/90 text-[11px] font-semibold rounded-md"
                          >
                            {tag}
                          </span>
                        ))
                    ) : (
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[11px] font-semibold rounded-md">
                        Tech
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 py-1.5 border-y border-slate-100 text-[11px] text-slate-500 font-semibold mb-3">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Team of {project.teamSize || teamList.length || 1}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.projectType || "Academic Project"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Published on {project.publishedDate || "12 Mar 2025"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-xs shadow-indigo-600/25 inline-flex items-center gap-1.5 transition-all"
                    >
                      <span>Visit Live Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}

                  {project.githubUrl ? (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>View GitHub</span>
                    </a>
                  ) : null}

                  {project.apkDownloadUrl ? (
                    <a
                      href={project.apkDownloadUrl}
                      download
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Download APK</span>
                    </a>
                  ) : null}

                  {isOwner && (
                    <div className="ml-auto inline-flex items-center gap-2">
                      <Link
                        href={`/dashboard/add-project?edit=${project.id}`}
                        className="px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                        title="Edit Project Details"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold inline-flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ════════════ Underline Tabs Strip with Flip Morphing ════════════ */}
            <div
              ref={tabsContainerRef}
              className="flex items-center gap-6 sm:gap-8 border-b border-slate-200/90 pt-1 overflow-x-auto scrollbar-none"
            >
              {[
                { id: "overview", label: "Overview" },
                { id: "screenshots", label: "Screenshots" },
                { id: "demo", label: "Demo Video" },
                { id: "resources", label: "Resources" },
                { id: "team", label: "Team" },
                { id: "discussion", label: "Discussion" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id as TabKey)}
                    className={`tab-button pb-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer relative ${
                      isActive ? "text-indigo-600 font-extrabold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="tab-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ════════════ TAB 1: OVERVIEW ════════════ */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Left Column: About, Problem Statement, Solution (~7 cols) */}
                <div className="md:col-span-7 space-y-3.5">
                  {/* About the Project */}
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                      About the Project
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {project.description} {project.objectives || ""}
                    </p>
                  </div>

                  {/* ── Problem Statement Card with Expandable / Modal View ── */}
                  <div className="bg-[#FFF6F5] border border-[#FFE7E4] rounded-2xl p-4 shadow-2xs transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                        <span className="w-5 h-5 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
                          <Lightbulb className="w-3 h-3 fill-orange-500 text-orange-500" />
                        </span>
                        <span>Problem Statement</span>
                      </div>

                      {/* Expand in Fullscreen Reader Modal */}
                      <button
                        type="button"
                        onClick={() =>
                          setReadingModal({
                            title: "Problem Statement",
                            text: project.problemStatement || "No problem statement provided.",
                            type: "problem",
                          })
                        }
                        className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-[10px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Read in Fullscreen Modal"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Expand View</span>
                      </button>
                    </div>

                    {/* Text display with Inline Expand/Collapse */}
                    <div className="text-xs text-slate-700 leading-relaxed font-normal">
                      {project.problemStatement ? (
                        <>
                          <p
                            className={
                              !isPsExpanded && project.problemStatement.length > 200
                                ? "line-clamp-3"
                                : ""
                            }
                          >
                            {project.problemStatement}
                          </p>

                          {project.problemStatement.length > 200 && (
                            <button
                              type="button"
                              onClick={() => setIsPsExpanded(!isPsExpanded)}
                              className="mt-2 text-[11px] font-bold text-orange-600 hover:text-orange-800 inline-flex items-center gap-1 cursor-pointer"
                            >
                              {isPsExpanded ? (
                                <>
                                  <span>Show less</span>
                                  <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  <span>Read full statement</span>
                                  <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="italic text-slate-400">
                          Travel planning can be time-consuming and overwhelming, with too much information scattered across multiple platforms.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ── Solution Card with Expandable / Modal View ── */}
                  <div className="bg-[#F2FBF7] border border-[#D7F5E8] rounded-2xl p-4 shadow-2xs transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                        <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        </span>
                        <span>Proposed Solution</span>
                      </div>

                      {/* Expand in Fullscreen Reader Modal */}
                      <button
                        type="button"
                        onClick={() =>
                          setReadingModal({
                            title: "Proposed Solution",
                            text: project.solution || "No solution statement provided.",
                            type: "solution",
                          })
                        }
                        className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Read in Fullscreen Modal"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Expand View</span>
                      </button>
                    </div>

                    {/* Text display with Inline Expand/Collapse */}
                    <div className="text-xs text-slate-700 leading-relaxed font-normal">
                      {project.solution ? (
                        <>
                          <p
                            className={
                              !isSolExpanded && project.solution.length > 200
                                ? "line-clamp-3"
                                : ""
                            }
                          >
                            {project.solution}
                          </p>

                          {project.solution.length > 200 && (
                            <button
                              type="button"
                              onClick={() => setIsSolExpanded(!isSolExpanded)}
                              className="mt-2 text-[11px] font-bold text-teal-600 hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer"
                            >
                              {isSolExpanded ? (
                                <>
                                  <span>Show less</span>
                                  <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  <span>Read full solution</span>
                                  <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="italic text-slate-400">
                          An AI-powered assistant that brings everything together — planning, recommendations, and real-time updates.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Technologies Used, Project Links, Team Members (~5 cols) */}
                <div className="md:col-span-5 space-y-4">
                  {/* Technologies Used */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 mb-1.5">
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags && project.tags.length > 0 ? (
                        project.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 bg-indigo-50/90 text-indigo-600 border border-indigo-100 text-[11px] font-semibold rounded-md"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[11px] font-semibold rounded-md">
                          React
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Project Links */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 mb-1.5">
                      Project Links
                    </h3>
                    <div className="space-y-1.5">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-2xs group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Globe className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 leading-tight">Live Website</p>
                            <p className="text-[11px] text-blue-600 truncate font-medium">
                              {project.liveUrl}
                            </p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                        </a>
                      )}

                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-2xs group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Github className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 leading-tight">GitHub Repository</p>
                            <p className="text-[11px] text-slate-500 truncate font-mono">
                              {project.githubUrl.replace("https://", "")}
                            </p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-900" />
                        </a>
                      )}

                      {project.videoUrl && (
                        <a
                          href={project.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-2xs group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Video className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 leading-tight">Video Demo</p>
                            <p className="text-[11px] text-indigo-600 truncate font-medium">
                              {project.videoUrl}
                            </p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Team Members */}
                  {teamList.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 mb-1.5">
                        Team Members
                      </h3>
                      <div className="space-y-1.5">
                        {teamList.map((member, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 p-1.5 bg-white rounded-xl border border-slate-100 shadow-2xs"
                          >
                            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-100">
                              {member.avatar ? (
                                <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                                  {member.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 leading-tight">
                                {member.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                {member.role || "Developer"}
                              </p>
                            </div>
                            {member.usn && (
                              <span className="ml-auto text-[9px] font-mono text-slate-400 font-semibold px-1.5 py-0.5 bg-slate-50 rounded">
                                {member.usn}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════════ TAB 2: SCREENSHOTS ════════════ */}
            {activeTab === "screenshots" && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900">
                  Project Gallery & Interfaces
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {gallery.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs cursor-pointer"
                      onClick={() => setActiveHeroMedia(img)}
                    >
                      <Image
                        src={img}
                        alt={`Screenshot ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        View as Main
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════ TAB 3: DEMO VIDEO ════════════ */}
            {activeTab === "demo" && (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs text-center max-w-md mx-auto">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1">
                  Demonstration Walkthrough
                </h3>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  Watch the presentation recording detailing implementation logic, algorithmic design, and real-time responsiveness.
                </p>
                {project.videoUrl ? (
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Open Video in New Tab</span>
                  </a>
                ) : (
                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-500 font-medium">
                    No video recording link was attached to this submission.
                  </div>
                )}
              </div>
            )}

            {/* ════════════ TAB 4: RESOURCES ════════════ */}
            {activeTab === "resources" && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900">
                  Project Assets & Documentation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {project.presentationPdfUrl && (
                    <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Project Synopsis & SRS
                          </p>
                          <p className="text-[10px] text-slate-400">PDF • Verified Academic File</p>
                        </div>
                      </div>
                      <a
                        href={project.presentationPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold hover:bg-slate-50"
                      >
                        View PDF
                      </a>
                    </div>
                  )}

                  {project.githubUrl && (
                    <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                          <Github className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Source Code Repository
                          </p>
                          <p className="text-[10px] text-slate-400">Git / GitHub</p>
                        </div>
                      </div>
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold hover:bg-black"
                      >
                        Inspect Repo
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════════ TAB 5: TEAM & GUIDE ════════════ */}
            {activeTab === "team" && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 mb-2">
                    Project Creators & Contributors
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {teamList.map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl p-3 border border-slate-100 shadow-2xs text-center"
                      >
                        <div className="relative w-12 h-12 rounded-full mx-auto mb-1.5 overflow-hidden border-2 border-indigo-100 bg-slate-200">
                          {m.avatar ? (
                            <Image src={m.avatar} alt={m.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                              {m.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                        <p className="text-[10px] text-indigo-600 font-semibold">{m.role}</p>
                        {m.usn && (
                          <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                            USN: {m.usn}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {project.facultyGuide && (
                  <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100 shadow-2xs">
                    <p className="text-[9px] font-black uppercase tracking-wider text-indigo-600 mb-0.5">
                      Faculty Guide / Mentor
                    </p>
                    <h4 className="text-xs font-bold text-slate-900">{project.facultyGuide}</h4>
                    <p className="text-[10px] text-slate-500">
                      {project.facultyDepartment || "Department of Computer Science & Engineering"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ════════════ TAB 6: DISCUSSION ════════════ */}
            {activeTab === "discussion" && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 mb-0.5">
                    Project Feedback & Discussion
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Engage with fellow student engineers and faculty evaluators.
                  </p>
                </div>

                <form onSubmit={handleAddComment} className="space-y-2">
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Leave constructive feedback or ask a technical question..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    Post Feedback
                  </button>
                </form>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  {comments.map((c) => (
                    <div key={c.id} className="p-2.5 bg-slate-50/70 rounded-xl space-y-0.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{c.author}</span>
                          <span className="text-[10px] text-indigo-600 font-semibold ml-1.5">
                            • {c.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{c.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ════════════ Expandable Reading Modal for Long Text ════════════ */}
      {readingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    readingModal.type === "problem"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-teal-100 text-teal-600"
                  }`}
                >
                  {readingModal.type === "problem" ? (
                    <Lightbulb className="w-4 h-4 fill-orange-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {readingModal.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyModalText}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedModalText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setReadingModal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with comfortable typography */}
            <div className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
              <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                {readingModal.text}
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setReadingModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ Delete Confirmation Modal ════════════ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900 mb-1">
                Delete Project
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-slate-800">
                  &ldquo;{project?.title}&rdquo;
                </span>
                ? This cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
