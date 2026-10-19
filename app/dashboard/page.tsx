"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, LayoutGrid, ListFilter, Compass } from "lucide-react";
import ModernBottomNav from "@/components/dashboard/ModernBottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeBanner3D from "@/components/dashboard/WelcomeBanner3D";
import ProjectCard from "@/components/dashboard/ProjectCard";
import ProjectCardSkeleton from "@/components/dashboard/ProjectCardSkeleton";
import SplitTextHeading from "@/components/animations/SplitTextHeading";
import TypewriterText from "@/components/animations/TypewriterText";
import PageTransitionWrapper from "@/components/animations/PageTransitionWrapper";
import ParallaxContainer from "@/components/animations/ParallaxContainer";
import { Project, ProjectCategory } from "@/lib/firebase/types";
import { useAuth } from "@/lib/context/AuthContext";
import { FirestoreService } from "@/lib/firebase/firestoreService";
import { gsap, Flip, ScrollTrigger } from "@/lib/gsapUtils";

export default function StudentDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Auth guard — redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !user?.uid) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);

  // Top Page ScrollTrigger Scrubbed Progress Bar
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

  // Load real projects from Firestore + user isolated storage (NO DUMMY MOCK DATA)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const userKey = user?.uid ? `projecthub_projects_${user.uid}` : "projecthub_user_projects";
        const stored = localStorage.getItem(userKey);
        const userProjects: Project[] = stored ? JSON.parse(stored) : [];

        // Global user projects
        const globalRaw = localStorage.getItem("projecthub_user_projects");
        const globalProjects: Project[] = globalRaw ? JSON.parse(globalRaw) : [];

        // Fetch published projects from Firestore database
        const dbProjects = await FirestoreService.getPublishedProjects();

        // Merge with deduplication by ID (prioritizing user submissions)
        const map = new Map<string, Project>();
        userProjects.forEach((p) => map.set(p.id, p));
        globalProjects.forEach((p) => {
          if (!map.has(p.id)) map.set(p.id, p);
        });
        dbProjects.forEach((p) => {
          if (!map.has(p.id)) map.set(p.id, p);
        });

        setProjectsList(Array.from(map.values()));
      } catch (err) {
        console.warn("Failed to load projects:", err);
        setProjectsList([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, [user?.uid]);

  // Layout morphing between Grid and List views via GSAP Flip
  const handleToggleViewMode = (mode: "grid" | "list") => {
    if (mode === viewMode) return;

    if (typeof window !== "undefined" && gridContainerRef.current) {
      const state = Flip.getState(gridContainerRef.current.children);
      setViewMode(mode);
      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.03,
          scale: true,
        });
      });
    } else {
      setViewMode(mode);
    }
  };

  // Filter projects based on category and search query
  const filteredProjects = useMemo(() => {
    return projectsList.filter((proj) => {
      const matchesCategory =
        selectedCategory === "All" || proj.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.tags.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesCategory && matchesSearch;
    });
  }, [projectsList, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FBFBFE] pb-28 selection:bg-[#4338CA] selection:text-white">
      {/* ── ScrollTrigger Scrubbed Reading Line ── */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-200/50 pointer-events-none">
        <div
          ref={scrollProgressRef}
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-400 w-0 transition-all duration-75"
        />
      </div>

      {/* Top Header Bar */}
      <DashboardHeader onSearch={setSearchQuery} />

      {/* Floating Bottom Navigation (Only Bottom Nav, No Sidebar!) */}
      <ModernBottomNav activeTab="home" />

      {/* Main Content Canvas */}
      <ParallaxContainer>
        {/* Parallax Ambient Depth Blobs */}
        <div
          data-speed="-0.3"
          className="absolute -top-10 left-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none"
        />
        <div
          data-speed="0.4"
          className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl pointer-events-none"
        />

        <PageTransitionWrapper className="p-6 sm:p-10 max-w-[1340px] mx-auto w-full relative z-10">
          {/* Welcome Banner with 3D Code Graphic, Parallax, & Category Flip */}
          <WelcomeBanner3D
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Interactive Search Inspiration Ticker with Typewriter Effect */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-3 bg-white/70 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Compass className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: "12s" }} />
              <span>Explore ideas:</span>
              <TypewriterText
                words={[
                  "AI communication tools for accessibility",
                  "Blockchain verification for degree certs",
                  "IoT agricultural soil telemetry systems",
                  "Full-stack Next.js capstone dashboards",
                ]}
                className="text-indigo-600 font-bold"
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {isLoadingProjects ? "Loading..." : `${filteredProjects.length} projects`}
            </span>
          </div>

          {/* Featured Projects Section Header */}
          <div className="flex items-center justify-between mb-6 pt-2">
            <div className="flex items-center gap-2.5">
              <span className="text-amber-500 text-lg leading-none">✦</span>
              <SplitTextHeading as="h2" className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A]">
                Featured Projects
              </SplitTextHeading>
            </div>

            {/* Layout Toggle (Grid vs. List morphing via GSAP Flip) */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Grid Layout"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleViewMode("list")}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white text-indigo-600 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Compact Stream"
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="text-xs sm:text-sm font-bold text-[#4338CA] hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ════════ Projects Rendering / Skeleton Loading ════════ */}
          {isLoadingProjects ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <ProjectCardSkeleton key={n} />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div
              ref={gridContainerRef}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  : "grid grid-cols-1 sm:grid-cols-2 gap-4"
              }
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  compact={viewMode === "list"}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-100 shadow-xs max-w-lg mx-auto">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-7 h-7" />
              </div>
              <p className="font-bold text-slate-800 text-base">
                {projectsList.length === 0 ? "No projects submitted yet" : "No matching projects found"}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {projectsList.length === 0
                  ? "Be the first student to showcase your innovation and publish your capstone project!"
                  : "Try selecting a different category or clearing your search filters."}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                {projectsList.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("All");
                      setSearchQuery("");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                ) : null}
                <Link
                  href="/dashboard/add-project"
                  className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  <span>Submit Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </PageTransitionWrapper>
      </ParallaxContainer>
    </div>
  );
}
