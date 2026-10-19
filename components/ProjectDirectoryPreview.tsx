"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, ExternalLink, Github, Smartphone, Star, Eye, CheckCircle2, Filter } from "lucide-react";
import * as Data from "@/lib/data";

const PROJECTS_LIST =
  ((Data as any).PROJECTS_LIST ??
    (Data as any).projectsList ??
    (Data as any).projects ??
    (Data as any).default ??
    []) as Array<any>;

const CATEGORIES = [
  "All Projects",
  "Web App",
  "Android APK",
  "AI / ML",
  "Hardware / IoT",
  "Finalist",
] as const;

export default function ProjectDirectoryPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Projects");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = PROJECTS_LIST.filter((proj) => {
    const matchesCat =
      selectedCategory === "All Projects" || proj.category === selectedCategory;
    const matchesSearch =
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())) ?? false) ||
      proj.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="projects" className="py-20 md:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Header (0:28-0:30 in video) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted block mb-2">
            REGISTRY ARCHIVE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-charcoal">
            Marketplace for <br />
            <span className="text-coral">Innovation.</span>
          </h2>
        </div>

        {/* Real-time Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, stack, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-black/10 text-xs sm:text-sm text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Category Pills (Matching pills in video 0:28) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-charcoal text-white shadow-sm"
                  : "bg-white text-charcoal-muted hover:text-charcoal border border-black/5 hover:border-black/15"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="rounded-3xl bg-white border border-black/10 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
          >
            {/* Project Image */}
            <div className="relative w-full h-[220px] overflow-hidden bg-slate-900">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-charcoal bg-white/95 backdrop-blur-md shadow-sm border border-black/5 uppercase">
                  {project.badge}
                </span>
              </div>

              {/* Category pill */}
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-black/60 backdrop-blur-md">
                  {project.category}
                </span>
              </div>
            </div>

            {/* Project Content */}
            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-lg font-extrabold text-charcoal tracking-tight group-hover:text-coral transition-colors">
                  {project.title}
                </h3>
                <p className="mt-2 text-xs text-charcoal-muted line-clamp-2 leading-relaxed">
                  {project.tagline}
                </p>

                {/* Tech Stack Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-canvas-subtle text-[10px] font-semibold text-charcoal border border-black/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author & Footer */}
              <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-black/10">
                    <Image
                      src={project.author.avatar}
                      alt={project.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-charcoal block leading-none">
                      {project.author.name}
                    </span>
                    <span className="text-[10px] text-charcoal-muted">
                      {project.author.batch}
                    </span>
                  </div>
                </div>

                {/* Action Links */}
                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub Repository"
                      className="p-2 rounded-full hover:bg-canvas-subtle text-charcoal transition-colors border border-black/5"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {project.apkUrl ? (
                    <a
                      href={project.apkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>APK</span>
                    </a>
                  ) : project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-charcoal text-white text-[11px] font-bold hover:bg-black transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Live</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-black/10">
          <p className="text-charcoal-muted text-sm font-medium">
            No projects found matching your search.
          </p>
        </div>
      )}
    </section>
  );
}
