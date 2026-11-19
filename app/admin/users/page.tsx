"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Download,
  Users as UsersIcon,
  ShieldCheck,
  Ban,
  RotateCcw,
  Trash2,
  Mail,
  Phone,
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  LayoutGrid,
  Table as TableIcon,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAdminData } from "@/components/admin/AdminDataContext";
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
import { adminApi, AdminUser, downloadCsv, formatDate, timeAgo } from "@/lib/admin/client";

const PAGE_SIZE = 30;

/** Extracts academic batch year from student USN, email, or profile (e.g. 4MW23AD... -> "2023 Batch") */
function extractBatch(user: AdminUser): string {
  if (user.batch && user.batch.trim()) {
    const clean = user.batch.trim();
    if (clean.toLowerCase().includes("batch")) return clean;
    return `${clean} Batch`;
  }

  // 1. Check USN (e.g. 4MW23AD006 or 4mw23ad020 or 4MV23...)
  if (user.usn) {
    const cleanUsn = user.usn.trim().toUpperCase();
    const match = cleanUsn.match(/[0-9][A-Z]{2}(\d{2})/);
    if (match && match[1]) {
      return `20${match[1]} Batch`;
    }
    const match2 = cleanUsn.match(/(\d{2})[A-Z]{2}/);
    if (match2 && match2[1]) {
      return `20${match2[1]} Batch`;
    }
  }

  // 2. Check College Email (e.g. varsha.23ad018@sode-edu.in -> 23 -> 2023 Batch)
  if (user.email) {
    const matchEmail = user.email.toLowerCase().match(/\.(\d{2})[a-z]{2}/);
    if (matchEmail && matchEmail[1]) {
      return `20${matchEmail[1]} Batch`;
    }
    const matchCode = user.email.toLowerCase().match(/(\d{2})[a-z]{2}\d{3}@/);
    if (matchCode && matchCode[1]) {
      return `20${matchCode[1]} Batch`;
    }
  }

  // 3. Check Year
  if (user.year) {
    if (user.year.includes("2023") || user.year.includes("23")) return "2023 Batch";
    if (user.year.includes("2024") || user.year.includes("24")) return "2024 Batch";
    if (user.year.includes("2022") || user.year.includes("22")) return "2022 Batch";
    if (user.year.includes("2025") || user.year.includes("25")) return "2025 Batch";
    if (user.year.includes("2026") || user.year.includes("26")) return "2026 Batch";
  }

  return "Other Accounts";
}

function UserDetail({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const toast = useToast();
  const { projects, upsertUser, removeUser, removeProjects } = useAdminData();
  const owned = projects.filter((p) => p.ownerId === user.uid);
  const [busy, setBusy] = useState<string | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [withProjects, setWithProjects] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const suspended = user.accountStatus === "suspended";

  const act = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e: any) {
      toast("error", e?.message || "Action failed");
    } finally {
      setBusy(null);
    }
  };

  const changeRole = (role: "student" | "user") =>
    act("role", async () => {
      const { user: u } = await adminApi.updateUser(user.uid, { role });
      upsertUser({ ...user, ...u });
      toast("success", `Role changed to ${role}`);
    });

  const suspend = () =>
    act("suspend", async () => {
      if (!reason.trim()) throw new Error("Please give a reason");
      const { user: u } = await adminApi.updateUser(user.uid, { accountStatus: "suspended", reason });
      upsertUser({ ...user, ...u });
      setSuspendOpen(false);
      setReason("");
      toast("success", `${user.fullName || user.email} suspended`);
    });

  const reactivate = () =>
    act("reactivate", async () => {
      const { user: u } = await adminApi.updateUser(user.uid, { accountStatus: "active" });
      upsertUser({ ...user, ...u });
      toast("success", "Account reactivated");
    });

  const doDelete = () =>
    act("delete", async () => {
      const res = await adminApi.deleteUser(user.uid, withProjects);
      removeUser(user.uid);
      if (withProjects) removeProjects(owned.map((p) => p.id));
      toast("success", `Deleted account${withProjects ? ` and ${res.removedProjects} project(s)` : ""}`);
      setDeleteOpen(false);
      onClose();
    });

  const fields: Array<[string, React.ReactNode]> = [
    ["Email", user.email || "—"],
    ["Verified sign-in", user.signInEmail || user.email || "—"],
    ["USN", user.usn || "—"],
    ["Batch", extractBatch(user)],
    ["Student code", user.studentCode || "—"],
    ["Phone", user.phoneNumber ? `${user.countryCode || "+91"} ${user.phoneNumber}` : "—"],
    ["College", user.college || "—"],
    ["Department", user.department || "—"],
    ["Branch", user.branch || "—"],
    ["Year", user.year || "—"],
    ["Gender", user.gender || "—"],
    ["Role", user.role || "student"],
    ["Account created", user.createdAt ? formatDate(user.createdAt) : "—"],
    ["Last updated", user.updatedAt ? timeAgo(user.updatedAt) : "—"],
  ];

  return (
    <div className="space-y-5 p-5">
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Avatar src={user.photoURL} name={user.fullName || user.email} size={54} />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-black text-slate-900 inline-flex items-center gap-2 flex-wrap">
              <span>{user.fullName || "Unnamed student"}</span>
              {user.isHost && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Administrator
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{user.email}</p>
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <StatusBadge status={user.accountStatus || "active"} />
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black">
                {extractBatch(user)}
              </span>
              <span className={`text-xs font-bold ${user.profileCompleted ? "text-emerald-600" : "text-amber-600"}`}>
                Profile {user.profileCompleted ? "complete" : "incomplete"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
          {!user.isHost && (
            <>
              {suspended ? (
                <Button size="sm" onClick={reactivate} loading={busy === "reactivate"}>
                  <RotateCcw className="w-3.5 h-3.5" /> Reactivate account
                </Button>
              ) : (
                <Button size="sm" variant="warning" onClick={() => setSuspendOpen(true)}>
                  <Ban className="w-3.5 h-3.5" /> Suspend account
                </Button>
              )}
              {user.role === "student" ? (
                <Button size="sm" onClick={() => changeRole("user")} loading={busy === "role"}>
                  Set role to User
                </Button>
              ) : (
                <Button size="sm" onClick={() => changeRole("student")} loading={busy === "role"}>
                  Set role to Student
                </Button>
              )}
            </>
          )}
          {user.email && (
            <a
              href={`mailto:${user.email}`}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> Email student
            </a>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 inline-flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4" /> Academic Profile
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
          {fields.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] font-bold text-slate-400">{k}</dt>
              <dd className="text-slate-800 font-semibold break-words">{v}</dd>
            </div>
          ))}
        </dl>
        {user.skills?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {user.skills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-bold text-slate-600">
                {s}
              </span>
            ))}
          </div>
        )}
        {user.bio && <p className="mt-3 text-sm text-slate-600 whitespace-pre-wrap">{user.bio}</p>}
      </Card>

      <Card className="p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Projects ({owned.length})</h3>
        {owned.length === 0 ? (
          <p className="text-sm text-slate-400">No projects submitted by this student yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {owned.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/projects?id=${encodeURIComponent(p.id)}`}
                  className="py-2.5 flex items-center gap-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg"
                >
                  <Thumb src={p.image} className="w-10 h-10" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{p.title}</p>
                    <p className="text-[11px] text-slate-500">{timeAgo(p.createdAt)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {!user.isHost && (
        <Card className="p-5 border-rose-200 bg-rose-50/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-rose-700">Delete student account</p>
              <p className="text-xs text-slate-500">
                Permanently removes this student profile from Firebase Firestore and Authentication.
              </p>
            </div>
            <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-3.5 h-3.5" /> Remove Student
            </Button>
          </div>
        </Card>
      )}

      {/* Suspend Modal */}
      <Modal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        title={`Suspend ${user.fullName || user.email}?`}
        footer={
          <>
            <Button onClick={() => setSuspendOpen(false)}>Cancel</Button>
            <Button variant="warning" onClick={suspend} loading={busy === "suspend"}>
              Suspend
            </Button>
          </>
        }
      >
        <p>They will be signed out on their next visit and blocked from signing in.</p>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={`${inputCls} mt-3`}
          placeholder="Reason for suspension"
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Permanently remove student?"
        footer={
          <>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={doDelete}
              loading={busy === "delete"}
              disabled={confirmText.trim().toLowerCase() !== "delete"}
            >
              Confirm & Remove
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <b>{user.fullName || user.email}</b>? This action will permanently remove their
          profile document and Firebase Auth credentials.
        </p>
        {owned.length > 0 && (
          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={withProjects}
              onChange={(e) => setWithProjects(e.target.checked)}
              className="w-4 h-4 accent-rose-600"
            />
            Also remove their {owned.length} project{owned.length === 1 ? "" : "s"}
          </label>
        )}
        <label className="block mt-3 text-xs font-bold text-slate-600">
          Type <span className="font-mono text-rose-600">delete</span> to confirm:
          <input className={`${inputCls} mt-1`} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        </label>
      </Modal>
    </div>
  );
}

function UsersInner() {
  const toast = useToast();
  const params = useSearchParams();
  const { users, projects, loading, error, reload, removeUser, removeProjects } = useAdminData();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState(params.get("status") || "all");
  const [profile, setProfile] = useState(params.get("profile") || "all");
  const [dept, setDept] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"folder" | "table">("folder");
  const [page, setPage] = useState(1);
  const [openUid, setOpenUid] = useState<string | null>(params.get("uid"));

  // Direct fast delete state from row/card
  const [targetDeleteUser, setTargetDeleteUser] = useState<AdminUser | null>(null);
  const [deleteWithProjects, setDeleteWithProjects] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setStatus(params.get("status") || "all");
    setProfile(params.get("profile") || "all");
  }, [params]);

  const projectCount = useMemo(() => {
    const m = new Map<string, number>();
    projects.forEach((p) => p.ownerId && m.set(p.ownerId, (m.get(p.ownerId) || 0) + 1));
    return m;
  }, [projects]);

  const departments = useMemo(() => Array.from(new Set(users.map((u) => u.department).filter(Boolean))).sort(), [users]);

  // Compute all batches and student counts
  const batchStats = useMemo(() => {
    const counts = new Map<string, number>();
    users.forEach((u) => {
      const b = extractBatch(u);
      counts.set(b, (counts.get(b) || 0) + 1);
    });

    const list = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        if (a.name === "Other Accounts") return 1;
        if (b.name === "Other Accounts") return -1;
        return b.name.localeCompare(a.name);
      });

    return list;
  }, [users]);

  // Filter users by search, role, status, department, and batch
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter((u) => {
      if (selectedBatch !== "all" && extractBatch(u) !== selectedBatch) return false;
      if (role !== "all" && (u.role || "student") !== role) return false;
      if (status !== "all" && (u.accountStatus || "active") !== status) return false;
      if (profile === "complete" && !u.profileCompleted) return false;
      if (profile === "incomplete" && u.profileCompleted) return false;
      if (dept !== "all" && u.department !== dept) return false;
      if (!term) return true;
      return [u.fullName, u.email, u.studentCode, u.usn, u.department, u.phoneNumber, u.uid, extractBatch(u)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [users, q, role, status, profile, dept, selectedBatch]);

  useEffect(() => setPage(1), [q, role, status, profile, dept, selectedBatch]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openUser = users.find((u) => u.uid === openUid) || null;
  const hasFilters = q || role !== "all" || status !== "all" || profile !== "all" || dept !== "all" || selectedBatch !== "all";

  // Fast direct removal of a student
  const confirmDirectDelete = async () => {
    if (!targetDeleteUser) return;
    setIsDeleting(true);
    try {
      const owned = projects.filter((p) => p.ownerId === targetDeleteUser.uid);
      const res = await adminApi.deleteUser(targetDeleteUser.uid, deleteWithProjects);
      removeUser(targetDeleteUser.uid);
      if (deleteWithProjects && owned.length) {
        removeProjects(owned.map((p) => p.id));
      }
      toast("success", `Removed ${targetDeleteUser.fullName || targetDeleteUser.email} successfully.`);
      setTargetDeleteUser(null);
    } catch (err: any) {
      toast("error", err?.message || "Failed to remove student");
    } finally {
      setIsDeleting(false);
    }
  };

  const exportCsv = () =>
    downloadCsv(
      `projecthub-students-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((u) => ({
        uid: u.uid,
        name: u.fullName,
        email: u.email,
        batch: extractBatch(u),
        usn: u.usn || "",
        department: u.department || "",
        role: u.role || "student",
        status: u.accountStatus || "active",
        studentCode: u.studentCode || "",
        phone: u.phoneNumber ? `${u.countryCode || ""} ${u.phoneNumber}` : "",
        profileCompleted: u.profileCompleted ? "yes" : "no",
        projects: projectCount.get(u.uid) || 0,
      }))
    );

  if (loading && !users.length) return <LoadingBlock label="Loading registered students…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Student Directory & Accounts"
        subtitle={`${users.length} registered account${users.length === 1 ? "" : "s"} segregated by batch`}
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("folder")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === "folder" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-500" /> Folders
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5 text-indigo-500" /> Table
              </button>
            </div>
            <Button onClick={exportCsv} disabled={!filtered.length}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        }
      />

      {/* ══════════ BATCH FOLDERS BAR ══════════ */}
      <div className="space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 text-amber-500" /> Academic Batch Folders (USN Segregated)
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedBatch("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
              selectedBatch === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>All Students</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              selectedBatch === "all" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"
            }`}>
              {users.length}
            </span>
          </button>

          {batchStats.map((b) => (
            <button
              key={b.name}
              type="button"
              onClick={() => setSelectedBatch(b.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                selectedBatch === b.name
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-200"
              }`}
            >
              <Folder className={`w-4 h-4 ${selectedBatch === b.name ? "text-white" : "text-amber-500"}`} />
              <span>{b.name}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                selectedBatch === b.name ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {b.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════ SEARCH & FILTERS CARD ══════════ */}
      <Card className="p-3">
        <div className="flex flex-col xl:flex-row gap-2">
          <div className="relative flex-1 min-w-0 xl:min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search student name, email, USN (e.g. 4MW23AD...)..."
              className={`${inputCls} pl-9`}
              aria-label="Search users"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select
              ariaLabel="Role"
              value={role}
              onChange={setRole}
              options={[
                { value: "all", label: "All roles" },
                { value: "student", label: "Students" },
                { value: "user", label: "Users (visitors)" },
              ]}
            />
            <Select
              ariaLabel="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "Any status" },
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" },
              ]}
            />
            <Select
              ariaLabel="Profile"
              value={profile}
              onChange={setProfile}
              options={[
                { value: "all", label: "Any profile" },
                { value: "complete", label: "Profile complete" },
                { value: "incomplete", label: "Profile incomplete" },
              ]}
            />
            <Select
              ariaLabel="Department"
              value={dept}
              onChange={setDept}
              options={[{ value: "all", label: "All departments" }, ...departments.map((d) => ({ value: d, label: d }))]}
            />
          </div>
        </div>
        {hasFilters && (
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <b>{filtered.length}</b> of <b>{users.length}</b> accounts
              {selectedBatch !== "all" && <span className="ml-1 text-amber-700 font-bold">in {selectedBatch}</span>}
            </span>
            <button
              type="button"
              onClick={() => {
                setQ("");
                setRole("all");
                setStatus("all");
                setProfile("all");
                setDept("all");
                setSelectedBatch("all");
              }}
              className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
            >
              <X className="w-3 h-3" /> Reset all filters
            </button>
          </div>
        )}
      </Card>

      {/* ══════════ VIEW MODE 1: FOLDER CARDS VIEW ══════════ */}
      {viewMode === "folder" ? (
        filtered.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={Folder}
              title="No students found"
              text={hasFilters ? "No students match your selected filters." : "No registered students in this batch."}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rows.map((u) => {
              const batch = extractBatch(u);
              return (
                <Card
                  key={u.uid}
                  className="p-4 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setOpenUid(u.uid)}>
                        <Avatar src={u.photoURL} name={u.fullName || u.email} size={42} />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors">
                            {u.fullName || "Unnamed"}
                          </p>
                          <p className="text-xs text-slate-500 truncate font-mono">{u.email}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-black shrink-0">
                        {batch}
                      </span>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">USN</span>
                        <span className="font-mono font-bold text-slate-700">{u.usn || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Department</span>
                        <span className="font-semibold text-slate-700 truncate block">{u.department || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Projects</span>
                        <span className="font-bold text-slate-700">{projectCount.get(u.uid) || 0} submitted</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Status</span>
                        <StatusBadge status={u.accountStatus || "active"} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenUid(u.uid)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                    >
                      View profile <ArrowRight className="w-3 h-3" />
                    </button>

                    {!u.isHost && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetDeleteUser(u);
                        }}
                        title="Remove student from database"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors inline-flex items-center gap-1 text-xs font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden group-hover:inline">Remove</span>
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        /* ══════════ VIEW MODE 2: TABLE VIEW ══════════ */
        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState icon={UsersIcon} title="No users found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[880px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-3">Batch</th>
                    <th className="py-3 px-3">USN</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3 text-right">Projects</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 cursor-pointer" onClick={() => setOpenUid(u.uid)}>
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar src={u.photoURL} name={u.fullName || u.email} size={34} />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-[220px] inline-flex items-center gap-1.5">
                              <span className="truncate">{u.fullName || "Unnamed"}</span>
                              {u.isHost && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-label="Host" />}
                            </p>
                            <p className="text-xs text-slate-500 truncate max-w-[220px] font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black">
                          {extractBatch(u)}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-700 font-bold">{u.usn || "—"}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate">{u.department || "—"}</td>
                      <td className="py-3 px-3 text-right tabular-nums font-semibold text-slate-700">
                        {projectCount.get(u.uid) || 0}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={u.accountStatus || "active"} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" onClick={() => setOpenUid(u.uid)}>
                            View
                          </Button>
                          {!u.isHost && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTargetDeleteUser(u);
                              }}
                              title="Delete Student"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="px-4 py-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-500 shadow-xs">
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

      {/* ══════════ MODAL: FAST DIRECT REMOVE STUDENT ══════════ */}
      <Modal
        open={Boolean(targetDeleteUser)}
        onClose={() => setTargetDeleteUser(null)}
        title="Remove Student from Portal?"
        footer={
          <>
            <Button onClick={() => setTargetDeleteUser(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDirectDelete} loading={isDeleting}>
              <Trash2 className="w-3.5 h-3.5" /> Yes, Remove Student
            </Button>
          </>
        }
      >
        {targetDeleteUser && (
          <div className="space-y-3 text-sm">
            <p>
              Are you sure you want to permanently delete the student account for:
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-black text-slate-900">{targetDeleteUser.fullName || "Unnamed Student"}</p>
              <p className="text-xs text-slate-500 font-mono">{targetDeleteUser.email}</p>
              {targetDeleteUser.usn && <p className="text-xs text-slate-600 font-bold">USN: {targetDeleteUser.usn}</p>}
              <p className="text-xs text-amber-700 font-bold">{extractBatch(targetDeleteUser)}</p>
            </div>
            <p className="text-xs text-slate-500">
              This will remove their profile from Firestore and revoke their Firebase Auth account.
            </p>
            {projectCount.get(targetDeleteUser.uid) ? (
              <label className="flex items-center gap-2 pt-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={deleteWithProjects}
                  onChange={(e) => setDeleteWithProjects(e.target.checked)}
                  className="w-4 h-4 accent-rose-600"
                />
                Also delete their {projectCount.get(targetDeleteUser.uid)} submitted project(s)
              </label>
            ) : null}
          </div>
        )}
      </Modal>

      {/* Detailed Student Drawer */}
      <Drawer open={Boolean(openUser)} onClose={() => setOpenUid(null)} title={openUser?.fullName || openUser?.email}>
        {openUser && <UserDetail key={openUser.uid} user={openUser} onClose={() => setOpenUid(null)} />}
      </Drawer>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <UsersInner />
    </Suspense>
  );
}
