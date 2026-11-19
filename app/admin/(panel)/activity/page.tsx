"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { History, Search, Download, RefreshCw } from "lucide-react";
import { Avatar, Button, Card, EmptyState, ErrorBlock, LoadingBlock, PageHeader, Select, inputCls } from "@/components/admin/ui";
import { adminApi, downloadCsv, formatDate, timeAgo } from "@/lib/admin/client";
import type { AuditLogEntry } from "@/lib/admin/types";
import { ACTION_LABELS, describeAction } from "@/components/admin/auditFormat";

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === "") return "∅";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [action, setAction] = useState("all");
  const [actor, setActor] = useState("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setLogs((await adminApi.audit(1000)).logs);
    } catch (e: any) {
      setError(e?.message || "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const actors = useMemo(() => Array.from(new Set((logs || []).map((l) => l.actorEmail))).sort(), [logs]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (logs || []).filter((l) => {
      if (type !== "all" && l.targetType !== type) return false;
      if (action !== "all" && l.action !== action) return false;
      if (actor !== "all" && l.actorEmail !== actor) return false;
      if (!term) return true;
      return [l.targetLabel, l.targetId, l.note, l.actorEmail, l.actorName, l.action].filter(Boolean).some((v) => String(v).toLowerCase().includes(term));
    });
  }, [logs, q, type, action, actor]);

  if (error) return <ErrorBlock message={error} onRetry={load} />;
  if (!logs) return <LoadingBlock label="Loading audit log…" />;

  const targetHref = (l: AuditLogEntry) =>
    l.action.endsWith(".delete")
      ? null
      : l.targetType === "project"
      ? `/admin/projects?id=${encodeURIComponent(l.targetId)}`
      : l.targetType === "user"
      ? `/admin/users?uid=${encodeURIComponent(l.targetId)}`
      : "/admin/settings";

  return (
    <div>
      <PageHeader
        title="Audit log"
        subtitle="Every action taken in the Host console — who, what, when and why."
        actions={
          <>
            <Button onClick={load} loading={loading}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Button
              disabled={!filtered.length}
              onClick={() =>
                downloadCsv(
                  `projecthub-audit-${new Date().toISOString().slice(0, 10)}.csv`,
                  filtered.map((l) => ({
                    time: l.createdAt,
                    actor: l.actorEmail,
                    action: l.action,
                    targetType: l.targetType,
                    targetId: l.targetId,
                    target: l.targetLabel || "",
                    note: l.note || "",
                    changes: l.changes ? JSON.stringify(l.changes) : "",
                  }))
                )
              }
            >
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </>
        }
      />

      <Card className="mb-4 p-3">
        <div className="flex flex-col xl:flex-row gap-2">
          <div className="relative flex-1 min-w-0 xl:min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search target, note, admin…" className={`${inputCls} pl-9`} aria-label="Search audit log" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Select ariaLabel="Target type" value={type} onChange={setType} options={[{ value: "all", label: "All targets" }, { value: "project", label: "Projects" }, { value: "user", label: "Users" }, { value: "settings", label: "Settings" }]} />
            <Select
              ariaLabel="Action"
              value={action}
              onChange={setAction}
              options={[{ value: "all", label: "All actions" }, ...Object.keys(ACTION_LABELS).map((a) => ({ value: a, label: a }))]}
            />
            <Select ariaLabel="Admin" value={actor} onChange={setActor} options={[{ value: "all", label: "All admins" }, ...actors.map((a) => ({ value: a, label: a }))]} />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={History} title={logs.length ? "No entries match" : "No admin actions yet"} text={logs.length ? undefined : "Approvals, edits, suspensions and settings changes will be listed here."} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((l) => {
              const href = targetHref(l);
              return (
                <li key={l.id} className="p-4 flex gap-3">
                  <Avatar name={l.actorName || l.actorEmail} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">
                      <b className="text-slate-900">{l.actorName || l.actorEmail}</b> {describeAction(l.action)}{" "}
                      {href ? (
                        <Link href={href} className="font-bold text-indigo-700 hover:underline break-words">{l.targetLabel || l.targetId}</Link>
                      ) : (
                        <span className="font-bold text-slate-900 break-words">{l.targetLabel || l.targetId}</span>
                      )}
                    </p>
                    {l.note && <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap break-words border-l-2 border-slate-200 pl-2.5">{l.note}</p>}
                    {l.changes && Object.keys(l.changes).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {Object.entries(l.changes).map(([k, c]) => (
                          <span key={k} className="max-w-full text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono truncate" title={`${fmt(c.from)} → ${fmt(c.to)}`}>
                            {k}: {fmt(c.from).slice(0, 40)} → {fmt(c.to).slice(0, 40)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-500 whitespace-nowrap" title={formatDate(l.createdAt)}>{timeAgo(l.createdAt)}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{l.action}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
