"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  FileEdit,
  Plus,
  Eye,
  Trash2,
  Sparkles,
  Send,
} from "lucide-react";
import ModernBottomNav from "@/components/dashboard/ModernBottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SplitTextHeading from "@/components/animations/SplitTextHeading";
import ScrambleText from "@/components/animations/ScrambleText";
import PageTransitionWrapper from "@/components/animations/PageTransitionWrapper";
import ParallaxContainer from "@/components/animations/ParallaxContainer";
import ProjectReviewTimeline from "@/components/dashboard/ProjectReviewTimeline";
import { useAuth } from "@/lib/context/AuthContext";
import { Project } from "@/lib/firebase/types";
import { FirestoreService } from "@/lib/firebase/firestoreService";
import { gsap, Flip, ScrollTrigger } from "@/lib/gsapUtils";

type FilterTab = "All" | "Draft" | "Published" | "Under Review";

export default function MyProjectsPage() {
  const { profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingReviewId, setSubmittingReviewId] = useState<string | null>(null);
  const projectListRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);

  // Top Scroll Progress Line
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

  // Load user's actual projects from isolated storage and Firestore
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const userProjectsKey = profile?.uid
          ? `projecthub_projects_${profile.uid}`
          : "projecthub_user_projects";

        // First check Firestore if UID available
        if (profile?.uid) {
          try {
            const firestoreProjects = await FirestoreService.getUserProjects(profile.uid);
            if (firestoreProjects && firestoreProjects.length > 0) {
              setMyProjects(firestoreProjects);
              localStorage.setItem(userProjectsKey, JSON.stringify(firestoreProjects));
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn("Firestore fetch error, falling back to local cache:", e);
          }
        }

        const stored =
          localStorage.getItem(userProjectsKey) ||
          localStorage.getItem("projecthub_user_projects");
        if (stored) {
          setMyProjects(JSON.parse(stored));
        } else {
          setMyProjects([]);
        }
      } catch {
        setMyProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [profile?.uid]);

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await FirestoreService.deleteProject(id, profile?.uid);
      setMyProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete project. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmitForReview = async (id: string, title: string) => {
    setSubmittingReviewId(id);
    try {
      const target = myProjects.find((p) => p.id === id);
      if (!target) return;
      const updated: Project = {
        ...target,
        status: "Pending review",
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      await FirestoreService.saveProject(updated);

      // Update local storage
      const userProjectsKey = profile?.uid
        ? `projecthub_projects_${profile.uid}`
        : "projecthub_user_projects";
      const currentList: Project[] = JSON.parse(
        localStorage.getItem(userProjectsKey) ||
        localStorage.getItem("projecthub_user_projects") ||
        "[]"
      );
      const newList = currentList.map((p) => (p.id === id ? updated : p));
      localStorage.setItem(userProjectsKey, JSON.stringify(newList));
      localStorage.setItem("projecthub_user_projects", JSON.stringify(newList));

      // Update local state
      setMyProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      console.error("Failed to submit project for review:", err);
      alert("Failed to submit project for review. Please try again.");
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const stats = [
    {
      label: "Total Projects",
      value: myProjects.length,
      icon: FolderGit2,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      label: "Published",
      value: myProjects.filter((p) => p.status === "Published").length,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Under Review",
      value: myProjects.filter(
        (p) => p.status === "Pending review" || (p.status as any) === "Under Review"
      ).length,
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      label: "Draft",
      value: myProjects.filter((p) => p.status === "Draft").length,
      icon: FileEdit,
      color: "text-slate-600 bg-slate-50 border-slate-100",
    },
  ];

  const filtered = myProjects.filter((p) => {
    const matchesTab =
      activeFilter === "All" ||
      p.status === activeFilter ||
      (activeFilter === "Under Review" && p.status === "Pending review");
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filterFlipStateRef = useRef<any>(null);

  // Flip layout morphing when switching filter tabs
  const handleFilterChange = (tab: FilterTab) => {
    if (tab === activeFilter) return;
    if (typeof window !== "undefined" && projectListRef.current) {
      filterFlipStateRef.current = Flip.getState(projectListRef.current.children);
    }
    setActiveFilter(tab);
  };

  useEffect(() => {
    if (filterFlipStateRef.current && projectListRef.current) {
      Flip.from(filterFlipStateRef.current, {
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.03,
        onEnter: (elements) =>
          gsap.fromTo(elements, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.3 }),
      });
      filterFlipStateRef.current = null;
    }
  }, [activeFilter]);

  const studentName = profile?.fullName?.trim() || "Student";

  return (
    <div className="relative min-h-screen bg-[#FBFBFE] pb-24 selection:bg-[#4338CA] selection:text-white overflow-x-hidden">
      {/* ── Top ScrollTrigger Scrubbed Reading Progress Bar ── */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-200/50 pointer-events-none">
        <div
          ref={scrollProgressRef}
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-400 w-0 transition-all duration-75"
        />
      </div>

      {/* Top Header */}
      <DashboardHeader onSearch={setSearchQuery} />

      {/* Floating Modern Bottom Nav */}
      <ModernBottomNav activeTab="my-projects" />

      {/* Main Content with Parallax & PageTransition */}
      <ParallaxContainer>
        {/* Ambient Depth Blobs */}
        <div
          data-speed="-0.2"
          className="absolute -top-10 right-10 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none"
        />
        <div
          data-speed="0.3"
          className="absolute top-1/2 left-5 w-[450px] h-[450px] bg-purple-100/20 rounded-full blur-3xl pointer-events-none"
        />

        <PageTransitionWrapper className="p-6 sm:p-10 max-w-[1340px] mx-auto w-full relative z-10">
          {/* ── Top Greeting Card with 3D Artwork & Architectural Watermark ── */}
          <div className="relative rounded-3xl bg-gradient-to-br from-white via-[#FBFBFE] to-indigo-50/30 border border-slate-200/90 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.05)] overflow-hidden mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Subtle Architectural Dot-Matrix Background Texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.035]"
              style={{
                backgroundImage: `radial-gradient(#0F172A 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Soft Ambient Depth Glows */}
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-100/30 rounded-full blur-2xl pointer-events-none" />

            {/* Left Content */}
            <div className="max-w-xl z-10">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Student Portfolio Showcase</span>
                </span>
                {profile?.studentCode && (
                  <span className="text-[10px] font-mono text-slate-400 font-bold hidden sm:inline">
                    {profile.studentCode}
                  </span>
                )}
              </div>

              <div className="mb-1">
                <SplitTextHeading
                  as="h1"
                  className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight"
                >
                  {`Good to see you, ${studentName}!`}
                </SplitTextHeading>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-relaxed">
                Manage your project dockets, track faculty review lifecycles, and showcase your verified innovations to campus and recruiters.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <Link
                  href="/dashboard/add-project"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A36] to-[#FF7A50] hover:from-[#E84E2A] hover:to-[#FF683C] text-white text-xs sm:text-sm font-black shadow-lg shadow-orange-500/25 transition-all transform hover:scale-[1.01]"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Project</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs hidden sm:inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Explore Showcase</span>
                </Link>
              </div>
            </div>

            {/* Right: Modern 3D Isometric Artwork with Parallax Float */}
            <div
              data-speed="0.15"
              className="relative w-56 h-40 sm:w-72 sm:h-48 shrink-0 flex items-center justify-center will-change-transform z-10"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden p-1 flex items-center justify-center">
                <Image
                  src="/api/assets/student_portfolio_hero_1791708895687.jpg"
                  alt="Student Innovation Portfolio"
                  fill
                  className="object-contain hover:scale-105 transition-transform duration-500 drop-shadow-md"
                  priority
                />
              </div>
            </div>
          </div>

          {/* ── 4 Stats Metric Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      {s.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-0.5">
                      {s.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${s.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Filter Tabs & Action Bar with GSAP Flip Morphing ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 bg-slate-100/70 p-1 rounded-2xl">
              {(["All", "Draft", "Published", "Under Review"] as FilterTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleFilterChange(tab)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeFilter === tab
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            <p className="text-xs font-semibold text-slate-400">
              Showing {filtered.length} of {myProjects.length} projects
            </p>
          </div>

          {/* ── Project Rows / Cards Grid with Flip Morphing & Skeleton Loader ── */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 animate-pulse"
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-200/80 shrink-0" />
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-4 rounded-full bg-slate-200" />
                        <div className="w-20 h-3 rounded bg-slate-100" />
                      </div>
                      <div className="w-2/3 h-5 rounded-lg bg-slate-200" />
                      <div className="w-4/5 h-3.5 rounded bg-slate-100" />
                      <div className="flex gap-2 pt-1">
                        <div className="w-12 h-4 rounded bg-slate-100" />
                        <div className="w-14 h-4 rounded bg-slate-100" />
                        <div className="w-10 h-4 rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <div className="w-28 h-8 rounded-xl bg-slate-200" />
                    <div className="w-16 h-8 rounded-xl bg-slate-200" />
                    <div className="w-8 h-8 rounded-xl bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div ref={projectListRef} className="space-y-4">
              {filtered.map((proj) => {
                const isPub = proj.status === "Published";
                const isRev = proj.status === "Under Review" || proj.status === "Pending review";

                return (
                  <div
                    key={proj.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group"
                  >
                    {/* Top Section: Thumbnail, Metadata & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                          <Image
                            src={proj.image}
                            alt={proj.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isPub
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : isRev
                                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                 isPub
                                    ? "bg-emerald-500"
                                    : isRev
                                    ? "bg-amber-500"
                                    : "bg-slate-400"
                                }`}
                              />
                              <ScrambleText triggerOn="hover">{proj.status}</ScrambleText>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] font-semibold text-slate-400">
                              {proj.projectType}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-[#0F172A] group-hover:text-indigo-600 transition-colors">
                            {proj.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {proj.subtitle}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                            {proj.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                        {/* Submit for Review Button for Drafts */}
                        {proj.status === "Draft" && (
                          <button
                            type="button"
                            disabled={submittingReviewId === proj.id}
                            onClick={() => handleSubmitForReview(proj.id, proj.title)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-500/20 disabled:opacity-50"
                            title="Submit draft to faculty reviewers for approval"
                          >
                            <Send className={`w-3.5 h-3.5 ${submittingReviewId === proj.id ? "animate-spin" : ""}`} />
                            <span>{submittingReviewId === proj.id ? "Submitting..." : "Submit for Review"}</span>
                          </button>
                        )}

                        <Link
                          href={`/projects/${proj.id}`}
                          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </Link>

                        <Link
                          href="/dashboard/add-project"
                          className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id, proj.title)}
                          disabled={deletingId === proj.id}
                          className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Delete Project"
                        >
                          <Trash2 className={`w-4 h-4 ${deletingId === proj.id ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Section: Review Lifecycle 4-Stage Stepper */}
                    <ProjectReviewTimeline
                      status={proj.status}
                      projectId={proj.id}
                      updatedAt={proj.updatedAt}
                      department={profile?.department || "Dept. of Engineering"}
                      mentorName={(proj as any).mentorName || (proj as any).guide}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4">
                <FolderGit2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-[#0F172A] mb-1">
                No projects added yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mb-6 font-medium">
                You haven&apos;t added any projects yet. Start by submitting your first innovative project for peer review and showcase.
              </p>
              <Link
                href="/dashboard/add-project"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A36] to-[#FF7A50] hover:from-[#E84E2A] hover:to-[#FF683C] text-white text-xs sm:text-sm font-black shadow-lg shadow-orange-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Your First Project</span>
              </Link>
            </div>
          )}
        </PageTransitionWrapper>
      </ParallaxContainer>
    </div>
  );
}
