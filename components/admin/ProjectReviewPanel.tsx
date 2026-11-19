"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  MessageSquareWarning,
  Star,
  Archive,
  Eye,
  ExternalLink,
  Github,
  Globe,
  PlayCircle,
  FileText,
  Smartphone,
  Link2,
  Loader2,
  Trash2,
  Save,
  Users,
  Clock,
  Check,
  Minus,
  Undo2,
} from "lucide-react";
import type { Project, ProjectStatus } from "@/lib/firebase/types";
import { adminApi, formatDate, timeAgo } from "@/lib/admin/client";
import { PROJECT_CATEGORIES, STATUSES_REQUIRING_NOTE } from "@/lib/admin/types";
import { Avatar, Button, Card, Modal, StatusBadge, Thumb, inputCls, useToast } from "./ui";
import { useAdminData } from "./AdminDataContext";

const CANNED: Array<{ label: string; text: string }> = [
  { label: "Add demo video", text: "Please add a working demo video link (YouTube/Drive, publicly viewable) showing the main features." },
  { label: "Fix repo link", text: "The source repository link is missing, private, or broken. Please add a public GitHub link." },
  { label: "More screenshots", text: "Please upload at least 3 clear screenshots of the working project." },
  { label: "Expand description", text: "Please expand the description with the problem statement, your approach, and the results/outcomes." },
  { label: "Team details", text: "Please list all team members with their USN and roles, and add your faculty guide." },
  { label: "Not original", text: "This submission appears to duplicate existing work. Please clarify your original contribution." },
];

type LinkKey = "githubUrl" | "liveUrl" | "videoUrl" | "demoUrl" | "apkDownloadUrl" | "presentationPdfUrl" | "docsUrl";
const LINKS: Array<{ key: LinkKey; label: string; icon: any }> = [
  { key: "githubUrl", label: "Source code", icon: Github },
  { key: "liveUrl", label: "Live site", icon: Globe },
  { key: "videoUrl", label: "Demo video", icon: PlayCircle },
  { key: "demoUrl", label: "Demo", icon: PlayCircle },
  { key: "apkDownloadUrl", label: "APK download", icon: Smartphone },
  { key: "presentationPdfUrl", label: "Presentation", icon: FileText },
  { key: "docsUrl", label: "Docs", icon: FileText },
];

export function qualityChecks(p: Project) {
  const descLen = (p.description || "").trim().length;
  return [
    { label: "Source repository linked", ok: Boolean(p.githubUrl?.trim()) },
    { label: "Demo video or live link", ok: Boolean(p.videoUrl?.trim() || p.liveUrl?.trim() || p.demoUrl?.trim()) },
    { label: "Screenshots uploaded", ok: (p.galleryImages || []).filter(Boolean).length > 0 },
    { label: "Description ≥ 150 characters", ok: descLen >= 150 },
    { label: "Problem statement provided", ok: Boolean(p.problemStatement?.trim()) },
    { label: "Team members listed", ok: (p.teamMembers || []).length > 0 },
    { label: "Faculty guide named", ok: Boolean(p.facultyGuide?.trim()) },
  ];
}

function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">{title}</h3>
        {right}
      </div>
      {children}
    </Card>
  );
}

export default function ProjectReviewPanel({
  project,
  onDeleted,
  className = "p-4 sm:p-5",
}: {
  project: Project;
  onDeleted?: (id: string) => void;
  className?: string;
}) {
  const toast = useToast();
  const { upsertProject, removeProjects, users } = useAdminData();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [linkResults, setLinkResults] = useState<Record<string, { ok: boolean; status: number; error?: string; ms: number }>>({});
  const [checkingLinks, setCheckingLinks] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [showFull, setShowFull] = useState(false);

  // Editable metadata
  const [edit, setEdit] = useState({
    title: project.title || "",
    subtitle: project.subtitle || "",
    category: project.category || "Others",
    tags: (project.tags || []).join(", "),
    academicYear: project.academicYear || "",
    facultyGuide: project.facultyGuide || "",
    finalYearProject: Boolean(project.finalYearProject),
  });

  useEffect(() => {
    setNote("");
    setLinkResults({});
    setShowFull(false);
    setEdit({
      title: project.title || "",
      subtitle: project.subtitle || "",
      category: project.category || "Others",
      tags: (project.tags || []).join(", "),
      academicYear: project.academicYear || "",
      facultyGuide: project.facultyGuide || "",
      finalYearProject: Boolean(project.finalYearProject),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const owner = useMemo(() => users.find((u) => u.uid === project.ownerId), [users, project.ownerId]);
  const checks = qualityChecks(project);
  const passed = checks.filter((c) => c.ok).length;
  const links = LINKS.filter((l) => (project[l.key] || "").trim());
  const dirty =
    edit.title !== (project.title || "") ||
    edit.subtitle !== (project.subtitle || "") ||
    edit.category !== (project.category || "Others") ||
    edit.tags !== (project.tags || []).join(", ") ||
    edit.academicYear !== (project.academicYear || "") ||
    edit.facultyGuide !== (project.facultyGuide || "") ||
    edit.finalYearProject !== Boolean(project.finalYearProject);

  const run = async (key: string, fn: () => Promise<Project>, success: string) => {
    setBusy(key);
    try {
      const updated = await fn();
      upsertProject(updated);
      toast("success", success);
      return true;
    } catch (e: any) {
      toast("error", e?.message || "Action failed");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const decide = async (status: ProjectStatus, label: string) => {
    if (STATUSES_REQUIRING_NOTE.includes(status) && !note.trim()) {
      toast("error", `Write a note for the student before choosing "${label}".`);
      return;
    }
    const ok = await run(
      status,
      async () => (await adminApi.updateProject(project.id, { status, note })).project,
      `${project.title}: ${label}`
    );
    if (ok) setNote("");
  };

  const saveMeta = () =>
    run(
      "meta",
      async () =>
        (
          await adminApi.updateProject(project.id, {
            fields: {
              title: edit.title,
              subtitle: edit.subtitle,
              category: edit.category as Project["category"],
              tags: edit.tags.split(",").map((t) => t.trim()).filter(Boolean),
              academicYear: edit.academicYear,
              facultyGuide: edit.facultyGuide,
              finalYearProject: edit.finalYearProject,
            },
          })
        ).project,
      "Project details saved"
    );

  const toggleFeatured = () =>
    run(
      "feature",
      async () => (await adminApi.updateProject(project.id, { featured: !project.featured })).project,
      project.featured ? "Removed from featured showcase" : "Added to featured showcase"
    );

  const checkLinks = async () => {
    setCheckingLinks(true);
    try {
      const urls = links.map((l) => project[l.key] as string);
      const { results } = await adminApi.checkLinks(urls);
      const map: typeof linkResults = {};
      results.forEach((r) => (map[r.url] = r));
      setLinkResults(map);
      const broken = results.filter((r) => !r.ok).length;
      toast(broken ? "error" : "success", broken ? `${broken} of ${results.length} links look broken` : "All links reachable");
    } catch (e: any) {
      toast("error", e?.message || "Link check failed");
    } finally {
      setCheckingLinks(false);
    }
  };

  const doDelete = async () => {
    setBusy("delete");
    try {
      await adminApi.deleteProject(project.id, deleteReason);
      removeProjects([project.id]);
      toast("success", `Deleted "${project.title}"`);
      setConfirmDelete(false);
      onDeleted?.(project.id);
    } catch (e: any) {
      toast("error", e?.message || "Delete failed");
    } finally {
      setBusy(null);
    }
  };

  const history = [...(project.reviewHistory || [])].reverse();

  return (
    <div className={`${className} space-y-4`}>
      {/* Header */}
      <Card className="p-4 sm:p-5">
        <div className="flex gap-4">
          <Thumb src={project.image} alt={project.title} className="w-20 h-20 sm:w-24 sm:h-24" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <StatusBadge status={project.status} />
              {project.featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-bold">
                  <Star className="w-3 h-3 fill-current" /> Featured
                </span>
              )}
              <span className="text-[11px] font-semibold text-slate-400">{project.category}</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 leading-snug break-words">{project.title}</h2>
            {project.subtitle && <p className="text-sm text-slate-500">{project.subtitle}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Avatar src={project.author?.avatar} name={project.author?.name} size={18} />
                <span className="font-semibold text-slate-700">{project.author?.name || "Unknown"}</span>
                {owner?.email && <span className="text-slate-400">· {owner.email}</span>}
              </span>
              <span>Submitted {timeAgo(project.createdAt)}</span>
              <span>Updated {timeAgo(project.updatedAt)}</span>
              <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {project.views || 0}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/projects/${project.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open public page
          </Link>
          <Button size="sm" onClick={toggleFeatured} loading={busy === "feature"}>
            <Star className={`w-3.5 h-3.5 ${project.featured ? "fill-violet-500 text-violet-500" : ""}`} />
            {project.featured ? "Unfeature" : "Feature on showcase"}
          </Button>
        </div>
      </Card>

      {/* Decision */}
      <Section title="Review decision">
        {project.reviewNotes && (
          <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-700">Last note to student</span>
            {project.reviewedBy && <span className="text-slate-400"> · {project.reviewedBy}, {timeAgo(project.reviewedAt)}</span>}
            <p className="mt-1 whitespace-pre-wrap">{project.reviewNotes}</p>
          </div>
        )}
        <label htmlFor={`note-${project.id}`} className="text-xs font-bold text-slate-600">
          Feedback for the student <span className="font-medium text-slate-400">(required for changes / rejection)</span>
        </label>
        <textarea
          id={`note-${project.id}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="What should the team fix or know? This is shown on their My Projects page."
          className={`${inputCls} mt-1.5 resize-y`}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CANNED.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setNote((n) => (n.trim() ? `${n.trim()}\n${c.text}` : c.text))}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-bold text-slate-600"
            >
              + {c.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button variant="success" onClick={() => decide("Published", "Approved & published")} loading={busy === "Published"}>
            <CheckCircle2 className="w-4 h-4" /> Approve & publish
          </Button>
          <Button variant="warning" onClick={() => decide("Changes requested", "Changes requested")} loading={busy === "Changes requested"}>
            <MessageSquareWarning className="w-4 h-4" /> Request changes
          </Button>
          <Button variant="danger" onClick={() => decide("Rejected", "Rejected")} loading={busy === "Rejected"}>
            <XCircle className="w-4 h-4" /> Reject
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.status !== "Under Review" && (
            <Button size="sm" variant="ghost" onClick={() => decide("Under Review", "Marked under review")} loading={busy === "Under Review"}>
              <Clock className="w-3.5 h-3.5" /> Mark under review
            </Button>
          )}
          {project.status !== "Archived" && (
            <Button size="sm" variant="ghost" onClick={() => decide("Archived", "Archived")} loading={busy === "Archived"}>
              <Archive className="w-3.5 h-3.5" /> Archive (hide)
            </Button>
          )}
          {project.status !== "Draft" && (
            <Button size="sm" variant="ghost" onClick={() => decide("Draft", "Returned to draft")} loading={busy === "Draft"}>
              <Undo2 className="w-3.5 h-3.5" /> Return to draft
            </Button>
          )}
        </div>
      </Section>

      {/* Quality checklist */}
      <Section
        title={`Submission checklist · ${passed}/${checks.length}`}
        right={
          <span className={`text-[11px] font-black ${passed === checks.length ? "text-emerald-600" : passed >= 4 ? "text-amber-600" : "text-rose-600"}`}>
            {passed === checks.length ? "Complete" : passed >= 4 ? "Mostly complete" : "Incomplete"}
          </span>
        }
      >
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-sm">
              {c.ok ? (
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"><Check className="w-3 h-3" /></span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center"><Minus className="w-3 h-3" /></span>
              )}
              <span className={c.ok ? "text-slate-700" : "text-slate-400"}>{c.label}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Links */}
      <Section
        title="Links & health"
        right={
          links.length > 0 && (
            <Button size="sm" onClick={checkLinks} loading={checkingLinks}>
              <Link2 className="w-3.5 h-3.5" /> Check links
            </Button>
          )
        }
      >
        {links.length === 0 ? (
          <p className="text-sm text-slate-400">No external links were provided.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {links.map((l) => {
              const url = project[l.key] as string;
              const r = linkResults[url];
              const Icon = l.icon;
              return (
                <li key={l.key} className="py-2 flex items-center gap-3 text-sm">
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="w-28 shrink-0 font-semibold text-slate-600">{l.label}</span>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 truncate text-indigo-600 hover:underline">
                    {url.startsWith("data:") ? "Embedded file" : url}
                  </a>
                  {checkingLinks && !r ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  ) : r ? (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        r.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                      title={r.error || `${r.ms} ms`}
                    >
                      {r.ok ? `OK ${r.status}` : r.status ? `Broken ${r.status}` : r.error || "Unreachable"}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Content */}
      <Section
        title="Submission content"
        right={
          <button type="button" onClick={() => setShowFull((v) => !v)} className="text-xs font-bold text-indigo-600 hover:underline">
            {showFull ? "Show less" : "Show all"}
          </button>
        }
      >
        <div className={`space-y-3 text-sm text-slate-700 ${showFull ? "" : "max-h-48 overflow-hidden relative"}`}>
          {[
            ["Description", project.description],
            ["Problem statement", project.problemStatement],
            ["Solution", project.solution],
            ["Outcomes", project.outcomes],
            ["Challenges", project.challenges],
            ["Future scope", project.futureScope || project.futureEnhancements],
          ]
            .filter(([, v]) => (v || "").trim())
            .map(([k, v]) => (
              <div key={k}>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{k}</p>
                <p className="whitespace-pre-wrap break-words mt-0.5">{v}</p>
              </div>
            ))}
          {(project.features || []).length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Features</p>
              <ul className="list-disc pl-5 mt-0.5">
                {project.features!.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {!showFull && <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />}
        </div>
        {(project.galleryImages || []).filter(Boolean).length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {project.galleryImages!.filter(Boolean).slice(0, 8).map((src, i) => (
              <a key={i} href={src.startsWith("data:") ? undefined : src} target="_blank" rel="noopener noreferrer">
                <Thumb src={src} className="w-full aspect-video" />
              </a>
            ))}
          </div>
        )}
      </Section>

      {/* Team */}
      <Section title="Team & academics">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
          <div><dt className="text-[11px] font-bold text-slate-400">Team</dt><dd className="text-slate-800 font-semibold">{project.teamName || "—"}</dd></div>
          <div><dt className="text-[11px] font-bold text-slate-400">Faculty guide</dt><dd className="text-slate-800 font-semibold">{project.facultyGuide || "—"}</dd></div>
          <div><dt className="text-[11px] font-bold text-slate-400">Department</dt><dd className="text-slate-800 font-semibold">{project.facultyDepartment || owner?.department || "—"}</dd></div>
          <div><dt className="text-[11px] font-bold text-slate-400">Academic year</dt><dd className="text-slate-800 font-semibold">{project.academicYear || "—"}</dd></div>
        </dl>
        {(project.teamMembers || []).length > 0 ? (
          <ul className="space-y-1.5">
            {project.teamMembers!.map((m, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <Avatar src={m.avatar} name={m.name} size={26} />
                <span className="font-semibold text-slate-800">{m.name}</span>
                <span className="text-slate-400 text-xs">{[m.role, m.usn || m.studentCode].filter(Boolean).join(" · ")}</span>
                {m.isLeader && <span className="text-[10px] font-black text-indigo-600 uppercase">Lead</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 inline-flex items-center gap-1.5"><Users className="w-4 h-4" /> No team members listed</p>
        )}
      </Section>

      {/* Edit metadata */}
      <Section
        title="Edit listing"
        right={
          <Button size="sm" variant="primary" onClick={saveMeta} disabled={!dirty} loading={busy === "meta"}>
            <Save className="w-3.5 h-3.5" /> Save
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="sm:col-span-2 text-xs font-bold text-slate-600">
            Title
            <input className={`${inputCls} mt-1`} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
          </label>
          <label className="sm:col-span-2 text-xs font-bold text-slate-600">
            Subtitle / domain
            <input className={`${inputCls} mt-1`} value={edit.subtitle} onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })} />
          </label>
          <label className="text-xs font-bold text-slate-600">
            Category
            <select className={`${inputCls} mt-1`} value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value as any })}>
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Academic year
            <input className={`${inputCls} mt-1`} value={edit.academicYear} onChange={(e) => setEdit({ ...edit, academicYear: e.target.value })} />
          </label>
          <label className="sm:col-span-2 text-xs font-bold text-slate-600">
            Tech tags <span className="font-medium text-slate-400">(comma separated)</span>
            <input className={`${inputCls} mt-1`} value={edit.tags} onChange={(e) => setEdit({ ...edit, tags: e.target.value })} />
          </label>
          <label className="text-xs font-bold text-slate-600">
            Faculty guide
            <input className={`${inputCls} mt-1`} value={edit.facultyGuide} onChange={(e) => setEdit({ ...edit, facultyGuide: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 sm:mt-6">
            <input
              type="checkbox"
              checked={edit.finalYearProject}
              onChange={(e) => setEdit({ ...edit, finalYearProject: e.target.checked })}
              className="w-4 h-4 rounded accent-indigo-600"
            />
            Final-year project
          </label>
        </div>
      </Section>

      {/* History */}
      <Section title="Review history">
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">No review decisions yet.</p>
        ) : (
          <ol className="relative border-l border-slate-200 ml-2 space-y-4">
            {history.map((h, i) => (
              <li key={i} className="pl-4 relative">
                <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-400 ring-4 ring-white" />
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={h.status} />
                  <span className="text-xs text-slate-500">by {h.by} · {formatDate(h.at)}</span>
                </div>
                {h.note && <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{h.note}</p>}
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* Danger zone */}
      <Card className="p-4 sm:p-5 border-rose-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-rose-700">Delete project</p>
            <p className="text-xs text-slate-500">Permanently removes it from the registry. Prefer Archive to just hide it.</p>
          </div>
          <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </Card>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete "${project.title}"?`}
        footer={
          <>
            <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={doDelete} loading={busy === "delete"}>
              Delete permanently
            </Button>
          </>
        }
      >
        <p>This cannot be undone. The student will no longer see this project. The deletion is recorded in the audit log.</p>
        <input
          className={`${inputCls} mt-3`}
          placeholder="Reason (optional, for the audit log)"
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
