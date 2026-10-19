"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  LayoutDashboard,
  FolderGit2,
  Users,
  FileBarChart2,
  Settings,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Check,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { FEATURED_PROJECTS } from "@/lib/data/mockData";
import { Project, ProjectStatus } from "@/lib/firebase/types";

type AdminFilterTab = "All" | "Pending Approval" | "Selected Showcase";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminFilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectsList, setProjectsList] = useState<Project[]>(FEATURED_PROJECTS);

  // Stats calculation
  const totalCount = projectsList.length;
  const publishedCount = projectsList.filter((p) => p.status === "Published").length;
  const underReviewCount = projectsList.filter(
    (p) => p.status === "Under Review" || p.status === "Pending review"
  ).length;
  const draftCount = projectsList.filter((p) => p.status === "Draft").length;

  const handleApprove = (id: string) => {
    setProjectsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Published" } : p))
    );
  };

  const handleReject = (id: string) => {
    setProjectsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Draft" } : p))
    );
  };

  const handleDelete = (id: string) => {
    setProjectsList((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredProjects = projectsList.filter((proj) => {
    const isUnderReview = proj.status === "Under Review" || proj.status === "Pending review";
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Pending Approval" && isUnderReview) ||
      (activeTab === "Selected Showcase" && proj.featured);

    const matchesSearch =
      !searchQuery ||
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex selection:bg-[#FF4A38] selection:text-white">
      {/* ── 1. Admin Sidebar (Matching Screen 5 Bottom-Right) ── */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 shrink-0 min-h-screen">
        <div>
          {/* Admin Brand Logo */}
          <Link href="/admin" className="flex items-center gap-3 mb-10 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-[2px] shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-[#0F172A] block leading-none">
                Project Hub
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Admin Portal
              </span>
            </div>
          </Link>

          {/* Admin Navigation Menu */}
          <nav className="space-y-1.5">
            {[
              { label: "Dashboard", icon: LayoutDashboard, active: true },
              { label: "Manage Projects", icon: FolderGit2, active: false },
              { label: "Students & Users", icon: Users, active: false },
              { label: "Analytics & Reports", icon: FileBarChart2, active: false },
              { label: "Portal Settings", icon: Settings, active: false },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    item.active
                      ? "bg-indigo-50 text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Switcher at Bottom */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Current Role
          </p>
          <p className="text-xs font-bold text-slate-800 mt-0.5">
            Faculty Administrator
          </p>
          <Link
            href="/dashboard"
            className="text-[11px] font-bold text-indigo-600 hover:underline mt-2 inline-block"
          >
            ← Switch to Student View
          </Link>
        </div>
      </aside>

      {/* ── 2. Admin Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, lead, or tech..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Live Campus Server</span>
          </div>
        </header>

        <main className="p-6 sm:p-10 max-w-[1440px] mx-auto w-full">
          {/* ── Top Welcome Banner with Admin Illustration (Matching Screen 5) ── */}
          <div className="relative rounded-3xl bg-white border border-slate-100 p-6 sm:p-8 shadow-sm overflow-hidden mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-xl z-10">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-wider mb-2.5 inline-block">
                System Administration
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                Welcome Admin
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-relaxed">
                Review submitted student innovations, approve pending final-year submissions, and curate projects for the annual college showcase.
              </p>
            </div>

            {/* Dynamic Admin Illustration Card (Matching Image 3 Screen 5) */}
            <div className="relative w-48 h-36 sm:w-56 sm:h-40 shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-[2px] shadow-lg shadow-indigo-600/15 overflow-hidden">
              <div className="w-full h-full bg-[#0F172A] rounded-[14px] p-3.5 flex flex-col justify-between text-white relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[9px] font-mono text-purple-300">admin // audit</span>
                </div>

                <div className="my-auto text-center py-1">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center text-purple-300 mb-1 border border-white/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-black tracking-tight">Review Portal</p>
                  <p className="text-[10px] text-slate-400">Department Governance</p>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-slate-800 pt-1">
                  <span>Peer Review</span>
                  <span className="text-emerald-400 font-bold">● Operational</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 4 Stats Metric Cards (Matching Screen 5) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[
              {
                label: "Total Projects",
                value: totalCount,
                icon: FolderGit2,
                color: "text-indigo-600 bg-indigo-50 border-indigo-100",
              },
              {
                label: "Published",
                value: publishedCount,
                icon: CheckCircle2,
                color: "text-emerald-600 bg-emerald-50 border-emerald-100",
              },
              {
                label: "Under Review",
                value: underReviewCount,
                icon: Clock,
                color: "text-amber-600 bg-amber-50 border-amber-100",
              },
              {
                label: "Drafts / Rejected",
                value: draftCount,
                icon: XCircle,
                color: "text-slate-600 bg-slate-50 border-slate-100",
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      {s.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-0.5">
                      {s.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Filter Tabs & Table Controls (Matching Screen 5) ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 bg-slate-100/70 p-1 rounded-2xl">
              {(["All", "Pending Approval", "Selected Showcase"] as AdminFilterTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab
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
              Showing {filteredProjects.length} projects
            </p>
          </div>

          {/* ── Admin Management Data Table (Matching Screen 5) ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Project Title & Overview</th>
                    <th className="py-4 px-6">Team Lead</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProjects.map((proj) => {
                    const isPub = proj.status === "Published";
                    const isRev = proj.status === "Under Review" || proj.status === "Pending review";

                    return (
                      <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Project Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                              <Image
                                src={proj.image}
                                alt={proj.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <Link
                                href={`/projects/${proj.id}`}
                                className="font-extrabold text-[#0F172A] hover:text-indigo-600 transition-colors block text-sm"
                              >
                                {proj.title}
                              </Link>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {proj.subtitle}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Author */}
                        <td className="py-4 px-6 font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-200">
                              <Image
                                src={proj.author.avatar}
                                alt={proj.author.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span>{proj.author.name}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {proj.category}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isPub
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : isRev
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isPub ? "bg-emerald-500" : isRev ? "bg-amber-500" : "bg-slate-400"
                              }`}
                            />
                            {proj.status}
                          </span>
                        </td>

                        {/* Actions (Approve, Edit, Delete) */}
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {proj.status !== "Published" ? (
                              <button
                                type="button"
                                onClick={() => handleApprove(proj.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                                title="Approve Project"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleReject(proj.id)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                                title="Mark as Draft"
                              >
                                <span>Unpublish</span>
                              </button>
                            )}

                            <Link
                              href={`/projects/${proj.id}`}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                              title="View Project"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDelete(proj.id)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
