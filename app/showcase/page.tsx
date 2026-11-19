"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Flame,
  Award,
  Layers,
  Smartphone,
  Cpu,
  Bookmark,
  BookmarkCheck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  X,
  Compass,
  Star,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Globe
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlayStoreAppModal from "@/components/showcase/PlayStoreAppModal";
import PlayStoreHeroBanner from "@/components/showcase/PlayStoreHeroBanner";
import PlayStoreCard from "@/components/showcase/PlayStoreCard";
import PlayStoreTopCharts from "@/components/showcase/PlayStoreTopCharts";
import SmoothShelfRow from "@/components/showcase/SmoothShelfRow";
import { Project, ProjectCategory } from "@/lib/firebase/types";
import { FEATURED_PROJECTS } from "@/lib/data/mockData";
import { FirestoreService } from "@/lib/firebase/firestoreService";
import { useAuth } from "@/lib/context/AuthContext";

type ShowcaseTab = "for-you" | "top-charts" | "categories" | "editors-choice" | "wishlist";

export default function PlayStoreShowcasePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("for-you");
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Load Wishlist from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("projecthub_appspace_wishlist");
      if (stored) {
        setWishlistIds(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load wishlist", e);
    }
  }, []);

  // Toggle Wishlist
  const handleToggleWishlist = (projectId: string) => {
    setWishlistIds((prev) => {
      const updated = prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId];
      try {
        localStorage.setItem("projecthub_appspace_wishlist", JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save wishlist", e);
      }
      return updated;
    });
  };

  const loadAllProjects = React.useCallback(async (force = false) => {
    setIsLoading(true);
    try {
      if (!force && typeof window !== "undefined") {
        const cacheRaw = sessionStorage.getItem("projecthub_showcase_cache");
        if (cacheRaw) {
          const cached = JSON.parse(cacheRaw);
          if (Array.isArray(cached) && cached.length > 0) {
            setProjectsList(cached);
            setIsLoading(false);
            return;
          }
        }
      }

      const userKey = user?.uid ? `projecthub_projects_${user.uid}` : "projecthub_user_projects";
      const stored = typeof window !== "undefined" ? localStorage.getItem(userKey) : null;
      const userProjects: Project[] = stored ? JSON.parse(stored) : [];

      const globalRaw = typeof window !== "undefined" ? localStorage.getItem("projecthub_user_projects") : null;
      const globalProjects: Project[] = globalRaw ? JSON.parse(globalRaw) : [];

      let dbProjects: Project[] = [];
      try {
        dbProjects = await FirestoreService.getAllDashboardProjects(user?.uid);
      } catch (err) {
        console.warn("Firestore fetch note:", err);
      }

      const map = new Map<string, Project>();
      FEATURED_PROJECTS.forEach((p) => map.set(p.id, p));
      dbProjects.forEach((p) => map.set(p.id, p));
      userProjects.forEach((p) => {
        if (p.ownerId === user?.uid) map.set(p.id, p);
      });

      const legacyMockIds = [
        "proj-journeybuddy",
        "proj-mindshift",
        "proj-cropmate",
        "proj-mauri",
        "proj-ambucare",
        "proj-aavarta",
        "proj-matricare",
        "proj-campusbot",
        "proj-agrivision",
      ];
      legacyMockIds.forEach((id) => map.delete(id));

      const visible = Array.from(map.values()).filter((p) => {
        if (p.id === "proj-demo-showcase") return true;
        if (p.status === "Published") return true;
        if (user?.uid && p.ownerId === user.uid) return true;
        return false;
      });

      setProjectsList(visible);
      try {
        sessionStorage.setItem("projecthub_showcase_cache", JSON.stringify(visible));
      } catch {}
    } catch (err) {
      console.warn("Failed to load showcase projects:", err);
      setProjectsList(FEATURED_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadAllProjects(false);
  }, [loadAllProjects]);

  // Filtered projects based on category and search query
  const filteredProjects = useMemo(() => {
    return projectsList.filter((proj) => {
      const matchesCategory =
        selectedCategory === "All" || proj.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        proj.author?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [projectsList, selectedCategory, searchQuery]);

  // Spotlight featured projects for Hero Billboard
  const spotlightProjects = useMemo(() => {
    const featured = projectsList.filter((p) => p.featured);
    return featured.length > 0 ? featured : projectsList.slice(0, 3);
  }, [projectsList]);

  // Categorized slices for horizontal shelves
  const webApps = useMemo(
    () => projectsList.filter((p) => p.category === "Web Apps"),
    [projectsList]
  );
  const mobileApps = useMemo(
    () => projectsList.filter((p) => p.category === "Mobile Apps"),
    [projectsList]
  );
  const aiMlProjects = useMemo(
    () => projectsList.filter((p) => p.category === "AI / ML"),
    [projectsList]
  );
  const hardwareProjects = useMemo(
    () => projectsList.filter((p) => p.category === "Hardware"),
    [projectsList]
  );

  // Wishlist projects
  const wishlistedProjects = useMemo(() => {
    return projectsList.filter((p) => wishlistIds.includes(p.id));
  }, [projectsList, wishlistIds]);

  const categoryChips: { label: ProjectCategory; count?: number }[] = [
    { label: "All", count: projectsList.length },
    { label: "Web Apps", count: webApps.length },
    { label: "Mobile Apps", count: mobileApps.length },
    { label: "AI / ML", count: aiMlProjects.length },
    { label: "Hardware", count: hardwareProjects.length },
    { label: "Others" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-[#0F172A] flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 0. Main Navigation */}
      <Navbar />

      {/* ══════════ APPSPACE BRAND HEADER & SEARCH BAR ══════════ */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand Left: Custom Prism Launch Logo */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <Link href="/showcase" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-emerald-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2L2 14L14 18L14 2Z" fill="#10B981" />
                  <path d="M14 18L26 14L14 2V18Z" fill="#34D399" opacity="0.8" />
                  <path d="M14 18L2 14L14 26V18Z" fill="#059669" opacity="0.9" />
                  <path d="M14 26L26 14L14 18V26Z" fill="#047857" />
                </svg>
              </div>
              <div>
                <span className="text-base font-black text-slate-900 tracking-tight block leading-none">
                  Project<span className="text-emerald-600">Space</span>
                </span>
                <span className="text-[11px] font-bold text-slate-500 tracking-wide">
                  Student Project Showcase
                </span>
              </div>
            </Link>

            {/* Mobile Submit CTA */}
            <Link
              href="/dashboard/add-project"
              className="sm:hidden px-3.5 py-1.5 rounded-full bg-[#0F172A] text-white text-xs font-bold shadow-sm"
            >
              + Submit
            </Link>
          </div>

          {/* Center Search Pill */}
          <div className="relative w-full max-w-xl">
            <div className="relative flex items-center w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, AI models, tech stacks (React, YOLO, FastAPI)..."
                className="w-full h-11 pl-11 pr-10 rounded-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 placeholder-slate-400 border border-slate-200/60 focus:border-emerald-500 focus:outline-none focus:ring-3 focus:ring-emerald-500/15 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action: Wishlist Pill & Submit Project */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => loadAllProjects(true)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              title="Fetch latest published projects from Firebase"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setActiveTab("wishlist")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all border ${
                activeTab === "wishlist"
                  ? "bg-rose-50 border-rose-200 text-rose-700 shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Wishlist</span>
              {wishlistIds.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <Link
              href="/dashboard/add-project"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F172A] hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Submit Project</span>
            </Link>
          </div>
        </div>

        {/* ══════════ SUB-TABS NAVIGATION WITH ANIMATED INDICATORS ══════════ */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex items-center gap-6 sm:gap-8 overflow-x-auto text-xs sm:text-sm font-semibold text-slate-600 border-t border-slate-100 scrollbar-none">
          {[
            { id: "for-you", label: "For you" },
            { id: "top-charts", label: "Top charts" },
            { id: "categories", label: "Categories" },
            { id: "editors-choice", label: "Editor's Choice" },
            { id: "wishlist", label: `Wishlist (${wishlistIds.length})`, mobileOnly: true },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ShowcaseTab)}
              className={`py-3 relative whitespace-nowrap transition-colors ${
                tab.mobileOnly ? "sm:hidden" : ""
              } ${
                activeTab === tab.id
                  ? "text-[#0F172A] font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeSubTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full shadow-xs"
                />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ══════════ MAIN CONTENT CANVAS ══════════ */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-9">
        
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => setSelectedCategory(chip.label)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border flex items-center gap-1.5 ${
                selectedCategory === chip.label
                  ? "bg-[#0F172A] text-white border-[#0F172A] font-bold shadow-sm"
                  : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{chip.label}</span>
              {chip.count !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedCategory === chip.label ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {chip.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── SEARCH RESULTS ACTIVE OVERRIDE ── */}
        {searchQuery && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Search Results for &ldquo;{searchQuery}&rdquo; ({filteredProjects.length})
              </h2>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-emerald-600 font-bold hover:underline"
              >
                Clear Search
              </button>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredProjects.map((proj) => (
                  <PlayStoreCard
                    key={proj.id}
                    project={proj}
                    onSelect={setSelectedProject}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 max-w-md mx-auto">
                <p className="font-bold text-slate-800 text-sm">No projects found matching your query</p>
                <p className="text-xs text-slate-500 mt-1">Try another keyword or search by tags like &quot;React&quot;, &quot;Android&quot;, &quot;YOLO&quot;.</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 1: FOR YOU (The Core Experience) ── */}
        {!searchQuery && activeTab === "for-you" && (
          <>
            {/* 1. Hero Spotlight Billboard Carousel */}
            <PlayStoreHeroBanner
              featuredProjects={spotlightProjects}
              onSelectProject={setSelectedProject}
            />

            {/* 2. Shelf Row: Recommended For You */}
            <SmoothShelfRow
              title="Recommended for you"
              subtitle="Based on recent project activity and faculty reviews"
              projects={filteredProjects.slice(0, 10)}
              onSelectProject={setSelectedProject}
              onSeeAll={() => setSelectedCategory("All")}
            />

            {/* 3. Shelf Row: Web Applications */}
            {webApps.length > 0 && (
              <SmoothShelfRow
                title="Full-Stack Web & Distributed Portals"
                subtitle="Modern responsive web dashboards and distributed tools"
                projects={webApps}
                onSelectProject={setSelectedProject}
                onSeeAll={() => setSelectedCategory("Web Apps")}
              />
            )}

            {/* 4. Shelf Row: AI & Machine Learning Breakthroughs */}
            {aiMlProjects.length > 0 && (
              <SmoothShelfRow
                title="AI Models & Intelligent Assistants"
                subtitle="Computer vision, sentiment analysis, and generative algorithms"
                projects={aiMlProjects}
                onSelectProject={setSelectedProject}
                onSeeAll={() => setSelectedCategory("AI / ML")}
              />
            )}

            {/* 5. Shelf Row: Mobile APKs & Native Mobile */}
            {mobileApps.length > 0 && (
              <SmoothShelfRow
                title="Mobile Apps & Device Releases"
                subtitle="Native mobile applications ready for direct device deployment"
                projects={mobileApps}
                onSelectProject={setSelectedProject}
                onSeeAll={() => setSelectedCategory("Mobile Apps")}
              />
            )}
          </>
        )}

        {/* ── TAB 2: TOP CHARTS LEADERBOARD ── */}
        {!searchQuery && activeTab === "top-charts" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Top Ranked Projects
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ranked by peer reviews, community stars, and project views.
              </p>
            </div>

            <PlayStoreTopCharts
              projects={filteredProjects}
              onSelectProject={setSelectedProject}
            />
          </div>
        )}

        {/* ── TAB 3: CATEGORIES BENTO GRID ── */}
        {!searchQuery && activeTab === "categories" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Explore by Domain
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Browse our curated engineering disciplines and department capstone verticals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  cat: "Web Apps",
                  title: "Web & Cloud Apps",
                  desc: "React, Next.js, FastAPI, Node.js portals and microservices",
                  count: webApps.length,
                  icon: <Layers className="w-6 h-6 text-indigo-600" />,
                  bg: "bg-indigo-50/70 border-indigo-100",
                },
                {
                  cat: "Mobile Apps",
                  title: "Android & Cross-Platform",
                  desc: "APK releases, Flutter, React Native, and mobile ML",
                  count: mobileApps.length,
                  icon: <Smartphone className="w-6 h-6 text-emerald-600" />,
                  bg: "bg-emerald-50/70 border-emerald-100",
                },
                {
                  cat: "AI / ML",
                  title: "AI, Vision & Deep Learning",
                  desc: "YOLOv8, Transformers, PyTorch, and NLP models",
                  count: aiMlProjects.length,
                  icon: <Sparkles className="w-6 h-6 text-purple-600" />,
                  bg: "bg-purple-50/70 border-purple-100",
                },
                {
                  cat: "Hardware",
                  title: "IoT, Embedded & Robotics",
                  desc: "ESP32, Arduino, drone telemetry, and smart sensor meshes",
                  count: hardwareProjects.length,
                  icon: <Cpu className="w-6 h-6 text-amber-600" />,
                  bg: "bg-amber-50/70 border-amber-100",
                },
              ].map((c) => (
                <div
                  key={c.cat}
                  onClick={() => {
                    setSelectedCategory(c.cat as ProjectCategory);
                    setActiveTab("for-you");
                  }}
                  className={`p-6 rounded-3xl border ${c.bg} hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white rounded-2xl shadow-2xs group-hover:scale-110 transition-transform">
                      {c.icon}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-white/90 px-2.5 py-1 rounded-full border border-slate-200/60">
                      {c.count} Apps
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <span>Browse collection</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: EDITOR'S CHOICE ── */}
        {!searchQuery && activeTab === "editors-choice" && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Editor's Choice &amp; Honors
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Handpicked projects recognized by faculty evaluators and department chairs for technical depth.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {spotlightProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group"
                >
                  <div className="relative h-48 w-full bg-slate-900">
                    <Image
                      src={project.heroVideoImage || project.image}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow">
                      <Award className="w-3 h-3" />
                      <span>TOP CAPSTONE</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                        {project.author?.name} • {project.category}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-400">
                        {project.stars || 400}+ Stars
                      </span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <span>Inspect Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: WISHLIST / SAVED APPS ── */}
        {!searchQuery && activeTab === "wishlist" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Your Wishlist &amp; Saved Projects
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Projects you&apos;ve bookmarked for evaluation, inspiration, or review.
                </p>
              </div>
              {wishlistedProjects.length > 0 && (
                <button
                  onClick={() => {
                    setWishlistIds([]);
                    localStorage.removeItem("projecthub_appspace_wishlist");
                  }}
                  className="text-xs text-rose-600 font-bold hover:underline"
                >
                  Clear Wishlist
                </button>
              )}
            </div>

            {wishlistedProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {wishlistedProjects.map((proj) => (
                  <PlayStoreCard
                    key={proj.id}
                    project={proj}
                    onSelect={setSelectedProject}
                  />
                ))}
              </div>
            ) : (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Bookmark className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Your wishlist is empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Click the bookmark icon on any project detail sheet to save it here for later.
                </p>
                <button
                  onClick={() => setActiveTab("for-you")}
                  className="mt-5 px-5 py-2.5 rounded-full bg-[#0F172A] text-white text-xs font-bold shadow-sm"
                >
                  Browse Projects
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ══════════ FULL APPSPACE APP DETAIL SHEET MODAL ══════════ */}
      <AnimatePresence>
        {selectedProject && (
          <PlayStoreAppModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            isWishlisted={wishlistIds.includes(selectedProject.id)}
            onToggleWishlist={handleToggleWishlist}
            onOpenProject={(proj) => {
              setSelectedProject(proj);
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
}
