"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Inbox, Search, AlertTriangle, ArrowRight, Check } from "lucide-react";
import { useAdminData } from "@/components/admin/AdminDataContext";
import ProjectReviewPanel, { qualityChecks } from "@/components/admin/ProjectReviewPanel";
import { Card, Drawer, EmptyState, ErrorBlock, LoadingBlock, PageHeader, StatusBadge, Thumb, inputCls } from "@/components/admin/ui";
import { hoursSince, timeAgo } from "@/lib/admin/client";
import { isAwaitingReview } from "@/lib/admin/types";

type QueueFilter = "all" | "Pending review" | "Under Review" | "overdue";

function ReviewQueueInner() {
  const params = useSearchParams();
  const { projects, settings, loading, error, reload } = useAdminData();
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(params.get("id"));
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const set = () => setIsDesktop(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const queue = useMemo(() => {
    const term = q.trim().toLowerCase();
    return projects
      .filter((p) => isAwaitingReview(p.status))
      .filter((p) => {
        if (filter === "overdue") return hoursSince(p.updatedAt || p.createdAt) > settings.reviewSlaHours;
        if (filter !== "all") return p.status === filter;
        return true;
      })
      .filter(
        (p) =>
          !term ||
          p.title?.toLowerCase().includes(term) ||
          p.author?.name?.toLowerCase().includes(term) ||
          (p.tags || []).some((t) => String(t).toLowerCase().includes(term))
      )
      // Oldest first: first-in, first-reviewed
      .sort((a, b) => (a.updatedAt || a.createdAt || "").localeCompare(b.updatedAt || b.createdAt || ""));
  }, [projects, filter, q, settings.reviewSlaHours]);

  // Auto-select the first item on desktop
  useEffect(() => {
    if (isDesktop && !selectedId && queue.length) setSelectedId(queue[0].id);
  }, [isDesktop, selectedId, queue]);

  const selected = projects.find((p) => p.id === selectedId) || null;
  const selectedInQueue = selected ? queue.some((p) => p.id === selected.id) : false;
  const nextInQueue = queue.find((p) => p.id !== selectedId) || null;

  const awaitingTotal = projects.filter((p) => isAwaitingReview(p.status)).length;
  const overdueTotal = projects.filter(
    (p) => isAwaitingReview(p.status) && hoursSince(p.updatedAt || p.createdAt) > settings.reviewSlaHours
  ).length;

  if (loading && !projects.length) return <LoadingBlock label="Loading review queue…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  const panel = selected ? (
    <div className={isDesktop ? "" : "p-4"}>
      {!selectedInQueue && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 font-semibold">
            <Check className="w-4 h-4" /> Decision saved — now <StatusBadge status={selected.status} />
          </span>
          {nextInQueue && (
            <button
              type="button"
              onClick={() => setSelectedId(nextInQueue.id)}
              className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 hover:underline whitespace-nowrap"
            >
              Next in queue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
      <ProjectReviewPanel className="" project={selected} onDeleted={() => setSelectedId(nextInQueue?.id || null)} />
    </div>
  ) : null;

  const filters: Array<{ key: QueueFilter; label: string; count: number }> = [
    { key: "all", label: "All waiting", count: awaitingTotal },
    { key: "Pending review", label: "New", count: projects.filter((p) => p.status === "Pending review").length },
    { key: "Under Review", label: "In review", count: projects.filter((p) => p.status === "Under Review").length },
    { key: "overdue", label: `Over ${settings.reviewSlaHours}h`, count: overdueTotal },
  ];

  return (
    <div>
      <PageHeader
        title="Review queue"
        subtitle={`Oldest submissions first. Target turnaround: ${settings.reviewSlaHours} hours.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-4 items-start">
        <Card className="overflow-hidden lg:sticky lg:top-24">
          <div className="p-3 border-b border-slate-100 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, student, tech…"
                className={`${inputCls} pl-9`}
                aria-label="Search review queue"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    filter === f.key
                      ? f.key === "overdue"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label} <span className="opacity-70 tabular-nums">{f.count}</span>
                </button>
              ))}
            </div>
          </div>
          {queue.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={awaitingTotal ? "No matches" : "Queue is empty"}
              text={awaitingTotal ? "Try a different filter or search." : "New submissions will appear here as students send them for review."}
            />
          ) : (
            <ul className="max-h-[calc(100vh-260px)] overflow-y-auto divide-y divide-slate-100">
              {queue.map((p) => {
                const age = hoursSince(p.updatedAt || p.createdAt);
                const late = age > settings.reviewSlaHours;
                const checks = qualityChecks(p);
                const passed = checks.filter((c) => c.ok).length;
                const active = p.id === selectedId;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full text-left p-3 flex gap-3 transition-colors ${
                        active ? "bg-indigo-50/80" : "hover:bg-slate-50"
                      }`}
                    >
                      <Thumb src={p.image} className="w-12 h-12" />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold truncate ${active ? "text-indigo-800" : "text-slate-800"}`}>{p.title}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {p.author?.name} · {p.category}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <StatusBadge status={p.status} label={p.status === "Pending review" ? "New" : "In review"} />
                          <span className={`text-[11px] font-bold ${late ? "text-rose-600" : "text-slate-400"}`}>
                            {late && <AlertTriangle className="w-3 h-3 inline -mt-0.5 mr-0.5" />}
                            {timeAgo(p.updatedAt || p.createdAt)}
                          </span>
                          <span
                            className={`text-[11px] font-bold ${passed === checks.length ? "text-emerald-600" : "text-slate-400"}`}
                            title="Submission checklist"
                          >
                            {passed}/{checks.length} checks
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {isDesktop ? (
          <div className="min-w-0">{panel || <EmptyState icon={Inbox} title="Select a submission to review" />}</div>
        ) : (
          <Drawer open={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.title}>
            {panel}
          </Drawer>
        )}
      </div>
    </div>
  );
}

export default function ReviewQueuePage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ReviewQueueInner />
    </Suspense>
  );
}
