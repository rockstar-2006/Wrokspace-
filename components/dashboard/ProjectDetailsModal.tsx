"use client";

import React from "react";
import Image from "next/image";
import { X, ExternalLink, Github, Users, Star, Eye, Calendar, Sparkles } from "lucide-react";
import { Project } from "@/lib/firebase/types";

interface ModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectDetailsModal({ project, onClose }: ModalProps) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header Image */}
        <div className="relative h-60 w-full bg-slate-900 shrink-0">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Bottom Title Overlay */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${
                project.status === "Published"
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              ● {project.status}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">{project.title}</h2>
            <p className="text-xs text-white/80">{project.subtitle}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Author & Stats Row */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                <Image
                  src={project.author.avatar}
                  alt={project.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {project.author.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {project.author.college} • {project.author.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{project.stars || 120}</span>
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.views || 890}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Project Overview
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {project.description}
            </p>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Technologies &amp; Libraries
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Team and Classification */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Team Allocation</p>
              <p className="font-bold text-slate-900 mt-0.5">
                Team of {project.teamSize} Innovators
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Category</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {project.category} ({project.projectType})
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
          >
            Close
          </button>
          <a
            href={project.githubUrl || "https://github.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Github className="w-3.5 h-3.5" />
            <span>View Source Code</span>
          </a>
        </div>
      </div>
    </div>
  );
}
