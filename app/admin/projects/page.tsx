"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Download,
  FolderGit2,
  Star,
  CheckCircle2,
  MessageSquareWarning,
  XCircle,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
} from "lucide-react";
import type { Project, ProjectStatus } from "@/lib/firebase/types";
import { useAdminData } from "@/components/admin/AdminDataContext";
import ProjectReviewPanel from "@/components/admin/ProjectReviewPanel";
import {
  Avatar,
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  Thumb,
  inputCls,
  useToast,
} from "@/components/admin/ui";
import { adminApi, downloadCsv, timeAgo } from "@/lib/admin/client";
import { PROJECT_CATEGORIES, PROJECT_STATUSES, STATUSES_REQUIRING_NOTE, ProjectUpdateInput } from "@/lib/admin/types";

type SortKey = "newest" | "oldest" | "updated" | "title" | "views";
const PAGE_SIZE = 25;

type BulkAction =
  | { kind: "status"; status: ProjectStatus; label: string }
  | { kind: "feature"; value: boolean; label: string }
  | { kind: "delete"; label: string };

function ProjectsInner() {
  const params = useSearchParams();
  const toast = useToast();
  const { projects, users, loading, error, reload, upsertProject, removeProjects } = useAdminData();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState(params.get("status") || "all");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [dept, setDept] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(params.get("id"));
  const [bulk, setBulk] = useState<BulkAction | null>(null);
  const [bulkNote, setBulkNote] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    setStatus(params.get("status") || "all");
    setCategory(params.get("category") || "all");
    if (params.get("id")) setOpenId(params.get("id"));
  }, [params]);

  const ownerById = useMemo(() => new Map(users.map((u) => [u.uid, u])), [users]);
  const departments = useMemo(() => {
    const s = new Set<string>();
    projects.forEach((p) => {
      const d = p.facultyDepartment || ownerById.get(p.ownerId || "")?.department;
      if (d) s.add(d);
    });
    return Array.from(s).sort();
  }, [projects, ownerById]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = projects.filter((p) => {
      if (status !== "all" && (p.status || "Draft") !== status) return false;
      if (category !== "all" && p.category !== category) return false;
      if (featured === "yes" && !p.featured) return false;
      if (featured === "no" && p.featured) return false;
      const d = p.facultyDepartment || ownerById.get(p.ownerId || "")?.department || "";
      if (dept !== "all" && d !== dept) return false;
      if (!term) return true;
      const owner = ownerById.get(p.ownerId || "");
      return [p.title, p.subtitle, p.author?.name, owner?.email, p.ownerCode, p.teamName, p.id, ...(p.tags || [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
    const by: Record<SortKey, (a: Project, b: Project) => number> = {
      newest: (a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""),
      oldest: (a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""),
      updated: (a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""),
      title: (a, b) => (a.title || "").localeCompare(b.title || ""),
      views: (a, b) => (b.views || 0) - (a.views || 0),
    };
    return list.sort(by[sort]);
  }, [projects, q, status, category, dept, featured, sort, ownerById]);

  useEffect(() => setPage(1), [q, status, category, dept, featured, sort]);
  // Drop selections that are no longer visible
  useEffect(() => {
    setSelected((s) => {
      const visible = new Set(filtered.map((p) => p.id));
      const next = new Set(Array.from(s).filter((id) => visible.has(id)));
      return next.size === s.size ? s : next;
    });
  }, [filtered]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((p) => selected.has(p.id));
  const openProject = projects.find((p) => p.id === openId) || null;
  const hasFilters = q || status !== "all" || category !== "all" || dept !== "all" || featured !== "all";

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const togglePage = () =>
    setSelected((s) => {
      const n = new Set(s);
      if (allOnPageSelected) pageRows.forEach((p) => n.delete(p.id));
      else pageRows.forEach((p) => n.add(p.id));
      return n;
    });

  const runBulk = async () => {
    if (!bulk) return;
    const ids = Array.from(selected);
    if (bulk.kind === "status" && STATUSES_REQUIRING_NOTE.includes(bulk.status) && !bulkNote.trim()) {
      toast("error", "A note for the students is required for this action.");
      return;
    }
    setBulkBusy(true);
    try {
      let res;
      if (bulk.kind === "delete") {
        res = await adminApi.bulkDelete(ids, bulkNote);
        removeProjects(res.results.filter((r) => r.ok).map((r) => r.id));
      } else {
        const update: ProjectUpdateInput =
          bulk.kind === "status" ? { status: bulk.status, note: bulkNote } : { featured: bulk.value };
        res = await adminApi.bulkUpdate(ids, update);
        // Re-fetch to get canonical documents after a bulk change
        await reload();
      }
      const failed = res.results.filter((r) => !r.ok);
      if (failed.length) toast("error", `${res.okCount} done, ${failed.length} failed: ${failed[0].error}`);
      else toast("success", `${bulk.label}: ${res.okCount} project${res.okCount === 1 ? "" : "s"}`);
      setSelected(new Set());
      setBulk(null);
      setBulkNote("");
    } catch (e: any) {
      toast("error", e?.message || "Bulk action failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const exportCsv = () => {
    downloadCsv(
      `projecthub-projects-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((p) => {
        const owner = ownerById.get(p.ownerId || "");
        return {
          id: p.id,
          title: p.title,
          status: p.status,
          featured: p.featured ? "yes" : "no",
          category: p.category,
          projectType: p.projectType,
          lead: p.author?.name,
          leadEmail: owner?.email || "",
          studentCode: p.ownerCode || p.author?.studentCode || "",
          department: p.facultyDepartment || owner?.department || "",
          facultyGuide: p.facultyGuide || "",
          teamSize: p.teamSize,
          team: (p.teamMembers || []).map((m) => m.name),
          tags: p.tags,
          githubUrl: p.githubUrl || "",
          liveUrl: p.liveUrl || "",
          videoUrl: p.videoUrl || "",
          views: p.views || 0,
          createdAt: p.createdAt || "",
          updatedAt: p.updatedAt || "",
          reviewedBy: p.reviewedBy || "",
          reviewNotes: p.reviewNotes || "",
        };
      })
    );
  };

  if (loading && !projects.length) return <LoadingBlock label="Loading projects…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  const bulkButtons: BulkAction[] = [
    { kind: "status", status: "Published", label: "Approve & publish" },
    { kind: "status", status: "Changes requested", label: "Request changes" },
    { kind: "status", status: "Rejected", label: "Reject" },
    { kind: "status", status: "Archived", label: "Archive" },
    { kind: "feature", value: true, label: "Feature" },
    { kind: "feature", value: false, label: "Unfeature" },
    { kind: "delete", label: "Delete" },
  ];
  const bulkIcon = (b: BulkAction) =>
    b.kind === "delete"
      ? Trash2
      : b.kind === "feature"
      ? Star
      : b.status === "Published"
      ? CheckCircle2
      : b.status === "Changes requested"
      ? MessageSquareWarning
      : b.status === "Rejected"
      ? XCircle
      : Archive;

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"} hosted · every status, every student`}
        actions={
          <Button onClick={exportCsv} disabled={!filtered.length}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        }
      />

      <Card className="mb-4 p-3">
        <div className="flex flex-col xl:flex-row gap-2">
          <div className="relative flex-1 min-w-0 xl:min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, student, email, code, tech, team…"
              className={`${inputCls} pl-9`}
              aria-label="Search projects"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Select
              ariaLabel="Status"
              value={status}
              onChange={setStatus}
              options={[{ value: "all", label: "All statuses" }, ...PROJECT_STATUSES.map((s) => ({ value: s, label: s }))]}
            />
            <Select
              ariaLabel="Category"
              value={category}
              onChange={setCategory}
              options={[{ value: "all", label: "All categories" }, ...PROJECT_CATEGORIES.map((s) => ({ value: s, label: s }))]}
            />
            <Select
              ariaLabel="Department"
              value={dept}
              onChange={setDept}
              options={[{ value: "all", label: "All departments" }, ...departments.map((s) => ({ value: s, label: s }))]}
            />
            <Select
              ariaLabel="Featured"
              value={featured}
              onChange={setFeatured}
              options={[
                { value: "all", label: "Featured: any" },
                { value: "yes", label: "Featured only" },
                { value: "no", label: "Not featured" },
              ]}
            />
            <Select
              ariaLabel="Sort"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
                { value: "updated", label: "Recently updated" },
                { value: "title", label: "Title A–Z" },
                { value: "views", label: "Most viewed" },
              ]}
            />
          </div>
        </div>
        {hasFilters && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>
              {filtered.length} of {projects.length} match
            </span>
            <button
              type="button"
              onClick={() => {
                setQ("");
                setStatus("all");
                setCategory("all");
                setDept("all");
                setFeatured("all");
              }}
              className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          </div>
        )}
      </Card>

      {selected.size > 0 && (
        <div className="sticky top-16 z-20 mb-3 p-2.5 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center gap-2 shadow-lg">
          <span className="px-2 text-sm font-bold">{selected.size} selected</span>
          <div className="flex flex-wrap gap-1.5">
            {bulkButtons.map((b) => {
              const Icon = bulkIcon(b);
              return (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => {
                    setBulkNote("");
                    setBulk(b);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                    b.kind === "delete" ? "bg-rose-600 hover:bg-rose-700" : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {b.label}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto px-2 text-xs font-bold text-slate-300 hover:text-white">
            Clear
          </button>
        </div>
      )}

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={FolderGit2} title={projects.length ? "No projects match" : "No projects yet"} text={projects.length ? "Adjust filters or search." : "Projects appear here as soon as students save them."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[860px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 pl-4 pr-2 w-10">
                    <input type="checkbox" aria-label="Select page" checked={allOnPageSelected} onChange={togglePage} className="w-4 h-4 accent-indigo-600" />
                  </th>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3">Lead</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">
                    <button type="button" onClick={() => setSort(sort === "views" ? "newest" : "views")} className="inline-flex items-center gap-1 uppercase">
                      Views <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3">
                    <button type="button" onClick={() => setSort(sort === "newest" ? "oldest" : "newest")} className="inline-flex items-center gap-1 uppercase">
                      Submitted <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map((p) => {
                  const owner = ownerById.get(p.ownerId || "");
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 cursor-pointer ${selected.has(p.id) ? "bg-indigo-50/50" : ""}`}
                      onClick={() => setOpenId(p.id)}
                    >
                      <td className="py-3 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${p.title}`}
                          checked={selected.has(p.id)}
                          onChange={() => toggle(p.id)}
                          className="w-4 h-4 accent-indigo-600"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Thumb src={p.image} className="w-11 h-11" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-[280px] inline-flex items-center gap-1.5">
                              {p.featured && <Star className="w-3.5 h-3.5 text-violet-500 fill-violet-500 shrink-0" aria-label="Featured" />}
                              <span className="truncate">{p.title}</span>
                            </p>
                            <p className="text-xs text-slate-500 truncate max-w-[280px]">{p.subtitle || p.projectType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar src={p.author?.avatar} name={p.author?.name} size={26} />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate max-w-[160px]">{p.author?.name || "—"}</p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{owner?.email || p.ownerCode || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{p.category}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-700 font-semibold">{p.views || 0}</td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap" title={p.createdAt}>
                        {timeAgo(p.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-2 font-bold text-slate-700">
                {page} / {pages}
              </span>
              <Button size="sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} aria-label="Next page">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Drawer open={Boolean(openProject)} onClose={() => setOpenId(null)} title={openProject?.title}>
        {openProject && <ProjectReviewPanel project={openProject} onDeleted={() => setOpenId(null)} />}
      </Drawer>

      <Modal
        open={Boolean(bulk)}
        onClose={() => !bulkBusy && setBulk(null)}
        title={bulk ? `${bulk.label} ${selected.size} project${selected.size === 1 ? "" : "s"}?` : ""}
        footer={
          <>
            <Button onClick={() => setBulk(null)} disabled={bulkBusy}>
              Cancel
            </Button>
            <Button variant={bulk?.kind === "delete" ? "danger" : "primary"} onClick={runBulk} loading={bulkBusy}>
              {bulk?.kind === "delete" ? "Delete permanently" : "Confirm"}
            </Button>
          </>
        }
      >
        {bulk?.kind === "delete" ? (
          <p>This permanently removes the selected projects. It cannot be undone. Consider archiving instead.</p>
        ) : bulk?.kind === "status" ? (
          <p>
            Each project will be moved to <StatusBadge status={bulk.status} /> and the decision recorded in its review history.
          </p>
        ) : (
          <p>{bulk?.label} the selected projects on the public showcase.</p>
        )}
        {bulk && bulk.kind !== "feature" && (
          <textarea
            rows={3}
            value={bulkNote}
            onChange={(e) => setBulkNote(e.target.value)}
            className={`${inputCls} mt-3`}
            placeholder={
              bulk.kind === "status" && STATUSES_REQUIRING_NOTE.includes(bulk.status)
                ? "Note for the students (required)"
                : bulk.kind === "delete"
                ? "Reason (optional, for the audit log)"
                : "Note for the students (optional)"
            }
          />
        )}
        {(() => {
          const ids = Array.from(selected);
          const titles = projects.filter((p) => ids.includes(p.id)).slice(0, 5).map((p) => p.title);
          return (
            <ul className="mt-3 text-xs text-slate-500 list-disc pl-5">
              {titles.map((t) => (
                <li key={t} className="truncate">{t}</li>
              ))}
              {ids.length > 5 && <li>…and {ids.length - 5} more</li>}
            </ul>
          );
        })()}
      </Modal>
    </div>
  );
}

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ProjectsInner />
    </Suspense>
  );
}
