"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Users,
  UserX,
  UserCheck,
  Star,
  ArrowRight,
  Clock,
  History,
  Megaphone,
  Lock,
} from "lucide-react";
import { useAdminData } from "@/components/admin/AdminDataContext";
import { Card, PageHeader, Thumb, Avatar, LoadingBlock, ErrorBlock, STATUS_BAR_COLOR } from "@/components/admin/ui";
import { DailyBars, HBars } from "@/components/admin/charts";
import { adminApi, hoursSince, timeAgo } from "@/lib/admin/client";
import { isAwaitingReview, PROJECT_STATUSES, AuditLogEntry } from "@/lib/admin/types";
import { describeAction } from "@/components/admin/auditFormat";

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: number | string;
  sub?: React.ReactNode;
  icon: any;
  tone: string;
  href?: string;
}) {
  const body = (
    <Card className={`p-4 sm:p-5 h-full ${href ? "hover:border-indigo-300 hover:shadow-md transition-all" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tabular-nums">{value}</p>
        </div>
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
          <Icon className="w-5 h-5" />
        </span>
      </div>
      {sub && <div className="mt-2 text-xs text-slate-500">{sub}</div>}
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const { projects, users, settings, loading, error, reload, admin } = useAdminData();
  const [logs, setLogs] = useState<AuditLogEntry[] | null>(null);

  useEffect(() => {
    adminApi
      .audit(8)
      .then((r) => setLogs(r.logs))
      .catch(() => setLogs([]));
  }, [projects]);

  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    PROJECT_STATUSES.forEach((s) => (byStatus[s] = 0));
    projects.forEach((p) => (byStatus[p.status || "Draft"] = (byStatus[p.status || "Draft"] || 0) + 1));
    const pending = projects.filter((p) => isAwaitingReview(p.status));
    const overdue = pending.filter((p) => hoursSince(p.updatedAt || p.createdAt) > settings.reviewSlaHours);
    const students = users.filter((u) => (u.role || "student") === "student").length;
    const suspended = users.filter((u) => u.accountStatus === "suspended").length;
    const incomplete = users.filter((u) => !u.profileCompleted).length;
    const featured = projects.filter((p) => p.featured).length;
    const weekAgo = Date.now() - 7 * 864e5;
    const newThisWeek = projects.filter((p) => new Date(p.createdAt || 0).getTime() > weekAgo).length;
    const newUsersWeek = users.filter((u) => new Date(u.createdAt || u.updatedAt || 0).getTime() > weekAgo).length;

    // Last 30 days of submissions, bucketed by the admin's local calendar day
    const localKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const days: Array<{ date: string; label: string; value: number }> = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      days.push({
        date: localKey(d),
        label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        value: 0,
      });
    }
    const idx = new Map(days.map((d, i) => [d.date, i]));
    projects.forEach((p) => {
      if (!p.createdAt) return;
      const d = new Date(p.createdAt);
      if (!Number.isFinite(d.getTime())) return;
      const i = idx.get(localKey(d));
      if (i !== undefined) days[i].value++;
    });
    const last30 = days.reduce((s, d) => s + d.value, 0);

    const countBy = (key: (p: (typeof projects)[number]) => string | undefined) => {
      const m = new Map<string, number>();
      projects.forEach((p) => {
        const k = (key(p) || "Unspecified").trim() || "Unspecified";
        m.set(k, (m.get(k) || 0) + 1);
      });
      return Array.from(m.entries())
        .map(([k, v]) => ({ key: k, label: k, value: v }))
        .sort((a, b) => b.value - a.value);
    };
    const userDept = new Map(users.map((u) => [u.uid, u.department]));

    return {
      byStatus,
      pending,
      overdue,
      students,
      suspended,
      incomplete,
      featured,
      newThisWeek,
      newUsersWeek,
      days,
      last30,
      categories: countBy((p) => p.category),
      departments: countBy((p) => p.facultyDepartment || userDept.get(p.ownerId || "")).slice(0, 6),
      oldestPending: [...pending].sort((a, b) => (a.updatedAt || a.createdAt || "").localeCompare(b.updatedAt || b.createdAt || "")).slice(0, 5),
      topViewed: [...projects].filter((p) => p.status === "Published").sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
    };
  }, [projects, users, settings.reviewSlaHours]);

  if (loading && !projects.length && !users.length) return <LoadingBlock label="Loading registry…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  const firstName = admin.name.split(" ")[0];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Everything hosted on ProjectHub at a glance — what needs your attention first."
        actions={
          stats.pending.length > 0 ? (
            <Link
              href="/admin/review"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black"
            >
              Review {stats.pending.length} pending <ArrowRight className="w-4 h-4" />
            </Link>
          ) : null
        }
      />

      {/* Portal state banners */}
      {(!settings.submissionsOpen || settings.announcement.enabled) && (
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          {!settings.submissionsOpen && (
            <Link href="/admin/settings" className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <Lock className="w-4 h-4 shrink-0" /> <span><b>Submissions are closed.</b> Students can&apos;t start new projects.</span>
            </Link>
          )}
          {settings.announcement.enabled && (
            <Link href="/admin/settings" className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-200 text-sm text-indigo-800 min-w-0">
              <Megaphone className="w-4 h-4 shrink-0" /> <span className="truncate"><b>Announcement live:</b> {settings.announcement.text}</span>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Kpi
          label="Awaiting review"
          value={stats.pending.length}
          icon={Inbox}
          tone="bg-amber-50 text-amber-600"
          href="/admin/review"
          sub={
            stats.overdue.length > 0 ? (
              <span className="text-rose-600 font-bold inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {stats.overdue.length} older than {settings.reviewSlaHours}h
              </span>
            ) : (
              <span>All within {settings.reviewSlaHours}h target</span>
            )
          }
        />
        <Kpi
          label="Published"
          value={stats.byStatus["Published"] || 0}
          icon={CheckCircle2}
          tone="bg-emerald-50 text-emerald-600"
          href="/admin/projects?status=Published"
          sub={<span className="inline-flex items-center gap-1"><Star className="w-3 h-3" /> {stats.featured} featured</span>}
        />
        <Kpi
          label="Total projects"
          value={projects.length}
          icon={FolderGit2}
          tone="bg-indigo-50 text-indigo-600"
          href="/admin/projects"
          sub={`${stats.newThisWeek} submitted in the last 7 days`}
        />
        <Kpi
          label="Registered users"
          value={users.length}
          icon={Users}
          tone="bg-sky-50 text-sky-600"
          href="/admin/users"
          sub={`${stats.students} students · ${stats.newUsersWeek} active this week`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card className="p-4 sm:p-5 xl:col-span-2">
          <div className="flex items-baseline justify-between mb-4 gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Submissions per day</h2>
              <p className="text-xs text-slate-500">Last 30 days · {stats.last30} new project{stats.last30 === 1 ? "" : "s"}</p>
            </div>
          </div>
          <DailyBars data={stats.days} />
        </Card>

        <Card className="p-4 sm:p-5">
          <h2 className="text-sm font-black text-slate-900 mb-1">Pipeline by status</h2>
          <p className="text-xs text-slate-500 mb-4">Click a status to open those projects</p>
          <HBars
            rows={PROJECT_STATUSES.map((s) => ({ key: s, label: s, value: stats.byStatus[s] || 0 })).filter((r) => r.value > 0)}
            colorFor={(k) => STATUS_BAR_COLOR[k] || "bg-slate-400"}
            onSelect={(k) => router.push(`/admin/projects?status=${encodeURIComponent(k)}`)}
            emptyText="No projects yet"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-slate-900 inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> Waiting longest</h2>
            <Link href="/admin/review" className="text-xs font-bold text-indigo-600 hover:underline">Queue</Link>
          </div>
          {stats.oldestPending.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Nothing waiting. Inbox zero 🎉</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.oldestPending.map((p) => {
                const late = hoursSince(p.updatedAt || p.createdAt) > settings.reviewSlaHours;
                return (
                  <li key={p.id}>
                    <Link href={`/admin/review?id=${encodeURIComponent(p.id)}`} className="py-2.5 flex items-center gap-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg">
                      <Thumb src={p.image} className="w-9 h-9" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate">{p.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{p.author?.name}</p>
                      </div>
                      <span className={`text-[11px] font-bold whitespace-nowrap ${late ? "text-rose-600" : "text-slate-500"}`}>
                        {timeAgo(p.updatedAt || p.createdAt)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-4 sm:p-5">
          <h2 className="text-sm font-black text-slate-900 mb-4">Projects by category</h2>
          <HBars
            rows={stats.categories}
            onSelect={(k) => router.push(`/admin/projects?category=${encodeURIComponent(k)}`)}
          />
        </Card>

        <Card className="p-4 sm:p-5">
          <h2 className="text-sm font-black text-slate-900 mb-4">Projects by department</h2>
          <HBars rows={stats.departments} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5">
          <h2 className="text-sm font-black text-slate-900 mb-3">Account health</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-slate-600"><UserCheck className="w-4 h-4 text-emerald-500" /> Profiles complete</span>
              <b className="tabular-nums">{users.length - stats.incomplete}</b>
            </li>
            <li className="flex items-center justify-between">
              <Link href="/admin/users?profile=incomplete" className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600"><Users className="w-4 h-4 text-amber-500" /> Profiles incomplete</Link>
              <b className="tabular-nums">{stats.incomplete}</b>
            </li>
            <li className="flex items-center justify-between">
              <Link href="/admin/users?status=suspended" className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600"><UserX className="w-4 h-4 text-rose-500" /> Suspended</Link>
              <b className="tabular-nums">{stats.suspended}</b>
            </li>
          </ul>
        </Card>

        <Card className="p-4 sm:p-5">
          <h2 className="text-sm font-black text-slate-900 mb-3">Most viewed (published)</h2>
          {stats.topViewed.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No published projects yet</p>
          ) : (
            <ol className="space-y-2">
              {stats.topViewed.map((p, i) => (
                <li key={p.id} className="flex items-center gap-2.5 text-sm">
                  <span className="w-5 text-xs font-black text-slate-400 tabular-nums">{i + 1}</span>
                  <Link href={`/admin/projects?id=${encodeURIComponent(p.id)}`} className="flex-1 min-w-0 truncate font-semibold text-slate-800 hover:text-indigo-600">
                    {p.title}
                  </Link>
                  <span className="text-xs font-bold text-slate-500 tabular-nums">{p.views || 0} views</span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-slate-900 inline-flex items-center gap-1.5"><History className="w-4 h-4 text-slate-400" /> Recent admin activity</h2>
            <Link href="/admin/activity" className="text-xs font-bold text-indigo-600 hover:underline">All</Link>
          </div>
          {logs === null ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No admin actions recorded yet</p>
          ) : (
            <ul className="space-y-2.5">
              {logs.slice(0, 6).map((l) => (
                <li key={l.id} className="flex items-start gap-2.5 text-xs">
                  <Avatar name={l.actorName || l.actorEmail} size={22} />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-700">
                      <b>{l.actorName || l.actorEmail}</b> {describeAction(l.action)}{" "}
                      <span className="font-semibold text-slate-900">{l.targetLabel}</span>
                    </p>
                    <p className="text-slate-400">{timeAgo(l.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

    </div>
  );
}
