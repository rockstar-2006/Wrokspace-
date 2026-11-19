"use client";

import type { Project, StudentProfile } from "@/lib/firebase/types";
import type { AuditLogEntry, PortalSettings, ProjectUpdateInput as ProjectUpdateInputClient } from "./types";

export type AdminUser = StudentProfile & { isHost?: boolean; signInEmail?: string | null };

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (!p.startsWith("/admin/login")) {
        window.location.href = `/admin/login?next=${encodeURIComponent(p)}`;
      }
    }
  }
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json as T;
}

export const adminApi = {
  me: () => call<{ admin: { email: string; name: string; image?: string } }>("/api/admin/me"),
  projects: () => call<{ projects: Project[] }>("/api/admin/projects"),
  users: () => call<{ users: AdminUser[] }>("/api/admin/users"),
  audit: (limit = 300) => call<{ logs: AuditLogEntry[] }>(`/api/admin/audit?limit=${limit}`),
  settings: () => call<{ settings: PortalSettings }>("/api/admin/settings"),
  saveSettings: (s: Partial<PortalSettings>) =>
    call<{ settings: PortalSettings }>("/api/admin/settings", { method: "PUT", body: JSON.stringify(s) }),
  updateProject: (id: string, update: ProjectUpdateInputClient) =>
    call<{ project: Project }>(`/api/admin/projects/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(update),
    }),
  deleteProject: (id: string, reason?: string) =>
    call<{ ok: true }>(
      `/api/admin/projects/${encodeURIComponent(id)}${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`,
      { method: "DELETE" }
    ),
  bulkUpdate: (ids: string[], update: ProjectUpdateInputClient) =>
    call<{ results: Array<{ id: string; ok: boolean; error?: string }>; okCount: number }>(
      "/api/admin/projects/bulk",
      { method: "POST", body: JSON.stringify({ ids, op: "update", update }) }
    ),
  bulkDelete: (ids: string[], reason?: string) =>
    call<{ results: Array<{ id: string; ok: boolean; error?: string }>; okCount: number }>(
      "/api/admin/projects/bulk",
      { method: "POST", body: JSON.stringify({ ids, op: "delete", reason }) }
    ),
  updateUser: (uid: string, body: { accountStatus?: "active" | "suspended"; reason?: string; role?: "student" | "user" }) =>
    call<{ user: AdminUser }>(`/api/admin/users/${encodeURIComponent(uid)}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteUser: (uid: string, withProjects: boolean, reason?: string) =>
    call<{ ok: true; removedProjects: number }>(
      `/api/admin/users/${encodeURIComponent(uid)}?withProjects=${withProjects ? 1 : 0}${
        reason ? `&reason=${encodeURIComponent(reason)}` : ""
      }`,
      { method: "DELETE" }
    ),
  admins: () => call<{ admins: Array<{ id: string; email: string; name: string; role: string; createdAt: string; createdBy?: string }> }>("/api/admin/admins"),
  addAdmin: (body: { email: string; name: string; password?: string; role?: string }) =>
    call<{ admin: any; ok: boolean }>("/api/admin/admins", { method: "POST", body: JSON.stringify(body) }),
  deleteAdmin: (email: string) =>
    call<{ ok: boolean; removed: string }>(`/api/admin/admins?email=${encodeURIComponent(email)}`, { method: "DELETE" }),
  checkLinks: (urls: string[]) =>
    call<{ results: Array<{ url: string; ok: boolean; status: number; ms: number; error?: string; note?: string }> }>(
      "/api/admin/link-check",
      { method: "POST", body: JSON.stringify({ urls }) }
    ),
};

/** Download rows as a CSV file (Excel-friendly, UTF-8 BOM). */
export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join("; ") : String(v);
    // Neutralise spreadsheet formula injection
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 60) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function hoursSince(iso?: string): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? (Date.now() - t) / 36e5 : 0;
}
