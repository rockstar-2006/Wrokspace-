"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
} from "lucide-react";

interface ProjectReviewTimelineProps {
  status: "Draft" | "Pending review" | "Under Review" | "Published" | string;
  projectId: string;
  updatedAt?: string;
  department?: string;
  mentorName?: string;
}

export default function ProjectReviewTimeline({
  status,
  projectId,
  updatedAt,
  department = "Computer Science & Engineering",
  mentorName,
}: ProjectReviewTimelineProps) {
  const [showDocket, setShowDocket] = useState(false);

  // Normalize status
  const isDraft = status === "Draft";
  const isInReview = status === "Pending review" || status === "Under Review";
  const isPublished = status === "Published";

  // Step indices: 0 = Draft, 1 = Under Review, 2 = Faculty Audit, 3 = Approved Live
  let currentStep = 0;
  if (isDraft) currentStep = 0;
  else if (isInReview) currentStep = 1;
  else if (isPublished) currentStep = 3;

  const steps = [
    {
      num: 1,
      title: "Draft Initialized",
      subtitle: "Spec & assets saved",
      isDone: true,
      isActive: isDraft,
    },
    {
      num: 2,
      title: "Submitted for Review",
      subtitle: isDraft ? "Action required" : "Docket logged",
      isDone: isInReview || isPublished,
      isActive: isInReview,
    },
    {
      num: 3,
      title: "Faculty Scrutiny",
      subtitle: isPublished ? "Passed evaluation" : isInReview ? "Turnaround 24–48h" : "Awaiting submission",
      isDone: isPublished,
      isActive: isInReview,
    },
    {
      num: 4,
      title: "Approved & Live",
      subtitle: isPublished ? "Publicly featured" : "Pending approval",
      isDone: isPublished,
      isActive: isPublished,
    },
  ];

  // Progress line percentage
  const progressPercent = isPublished
    ? 100
    : isInReview
    ? 66
    : 16;

  // Short docket number generated from project ID
  const docketId = `DOCK-${projectId.slice(-6).toUpperCase()}`;
  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      {/* ── Top Bar: Mini Status Banner & Docket Toggle ── */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Review Lifecycle
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-mono text-slate-500 font-semibold">
            {docketId}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowDocket(!showDocket)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <span>{showDocket ? "Hide Audit Docket" : "Audit Docket"}</span>
          {showDocket ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* ── Visual 4-Stage Connected Stepper ── */}
      <div className="relative pt-2 pb-1">
        {/* Background Track Line */}
        <div className="absolute top-5 left-4 right-4 h-[2px] bg-slate-100 z-0" />

        {/* Animated Active Progress Fill Line */}
        <div
          className={`absolute top-5 left-4 h-[2px] z-0 transition-all duration-700 ease-out ${
            isPublished
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : isInReview
              ? "bg-gradient-to-r from-blue-500 to-amber-500"
              : "bg-slate-300"
          }`}
          style={{ width: `calc(${progressPercent}% - 32px)` }}
        />

        {/* The 4 Stage Nodes */}
        <div className="grid grid-cols-4 relative z-10">
          {steps.map((st, idx) => {
            const isCompleted = st.isDone && (!st.isActive || isPublished);
            const isCurrentActive = st.isActive;

            return (
              <div
                key={idx}
                className={`flex flex-col ${
                  idx === 0
                    ? "items-start text-left"
                    : idx === steps.length - 1
                    ? "items-end text-right"
                    : "items-center text-center"
                }`}
              >
                {/* Node Indicator */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                      : isCurrentActive
                      ? isPublished
                        ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                        : "bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse"
                      : "bg-white border-2 border-slate-200 text-slate-300"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isCurrentActive ? (
                    isPublished ? (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )
                  ) : (
                    <span className="text-[10px] font-bold font-mono">{st.num}</span>
                  )}
                </div>

                {/* Node Title & Subtitle */}
                <div className="mt-1.5 max-w-[120px]">
                  <p
                    className={`text-[11px] font-black leading-tight ${
                      isCompleted
                        ? "text-slate-800"
                        : isCurrentActive
                        ? isPublished
                          ? "text-emerald-700"
                          : "text-amber-700"
                        : "text-slate-400 font-semibold"
                    }`}
                  >
                    {st.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5 hidden sm:block">
                    {st.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Expandable Review Audit Docket & Faculty Notes ── */}
      {showDocket && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 animate-fadeIn space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Field 1: Academic Department */}
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Review Jurisdiction
              </span>
              <p className="text-xs font-black text-slate-800 leading-snug">
                {department}
              </p>
            </div>

            {/* Field 2: Faculty Advisor */}
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Faculty Guide / Mentor
              </span>
              <p className="text-xs font-black text-slate-800 leading-snug">
                {mentorName || "Designated Department Committee"}
              </p>
            </div>

            {/* Field 3: Timeline & Policy */}
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Last Activity
              </span>
              <p className="text-xs font-black text-slate-800 leading-snug">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Guidelines / Next Action Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100/70 text-indigo-950 text-xs font-medium">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              {isDraft ? (
                <span>
                  <strong>Draft Stage:</strong> Your project details are saved in your workspace. When ready, click{" "}
                  <strong>&quot;Submit for Review&quot;</strong> to forward this project to the departmental evaluation committee.
                </span>
              ) : isInReview ? (
                <span>
                  <strong>Faculty Scrutiny in Progress:</strong> The evaluation committee verifies code repository accessibility, academic novelty, and project documentation. Turnaround is typically within 24 to 48 hours.
                </span>
              ) : (
                <span>
                  <strong>Officially Published:</strong> This project has passed departmental technical verification and is live on the public ProjectHub showcase for students, faculty, and recruiters.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
