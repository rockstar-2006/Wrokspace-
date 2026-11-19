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
    [
      "Sign-in account",
      user.signInEmail ? (
        <span key="s" className="break-all">{user.signInEmail}</span>
      ) : (
        <span key="s" className="text-amber-700">Not upgraded yet (legacy profile — moves on next sign-in)</span>
      ),
    ],
    ["Student code", <span key="c" className="font-mono">{user.studentCode || "—"}</span>],
    ["USN", user.usn || "—"],
    ["College", user.college || "—"],
    ["Department", user.department || "—"],
    ["Branch", user.branch || "—"],
    ["Year / batch", [user.year, user.batch].filter(Boolean).join(" · ") || "—"],
    ["Gender", user.gender || "—"],
    ["Date of birth", user.dateOfBirth || "—"],
    ["Last updated", formatDate(user.updatedAt)],
    ["User ID", <span key="u" className="font-mono text-[11px] break-all">{user.uid}</span>],
  ];

  return (
    <div className="p-4 sm:p-5 space-y-4">
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Avatar src={user.photoURL} name={user.fullName || user.email} size={64} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 break-words">{user.fullName || "Unnamed user"}</h2>
              {user.isHost && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase">
                  <ShieldCheck className="w-3 h-3" /> Host
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              <StatusBadge status={user.accountStatus || "active"} />
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold capitalize">{user.role || "student"}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  user.profileCompleted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {user.profileCompleted ? "Profile complete" : "Profile incomplete"}
              </span>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              {user.email && (
                <a href={`mailto:${user.email}`} className="flex items-center gap-2 hover:text-indigo-600 break-all">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" /> {user.email}
                </a>
              )}
              {user.phoneNumber && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" /> {user.countryCode} {user.phoneNumber}
                </p>
              )}
            </div>
          </div>
        </div>
        {suspended && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
            <b>Suspended</b> {user.suspendedAt ? `· ${formatDate(user.suspendedAt)}` : ""}
            {user.suspendedReason && <p className="mt-0.5">{user.suspendedReason}</p>}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Account controls</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-800">Role</p>
              <p className="text-xs text-slate-500">Student accounts can submit projects; User is a visitor/stakeholder.</p>
            </div>
            <Select
              ariaLabel="Role"
              value={user.role === "user" ? "user" : "student"}
              onChange={(v) => changeRole(v as "student" | "user")}
              options={[
                { value: "student", label: "Student" },
                { value: "user", label: "User (visitor)" },
              ]}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-800">{suspended ? "Reactivate account" : "Suspend account"}</p>
              <p className="text-xs text-slate-500">Suspended users are blocked from signing in to ProjectHub.</p>
            </div>
            {suspended ? (
              <Button onClick={reactivate} loading={busy === "reactivate"}>
                <RotateCcw className="w-4 h-4" /> Reactivate
              </Button>
            ) : (
              <Button variant="warning" onClick={() => setSuspendOpen(true)} disabled={user.isHost}>
                <Ban className="w-4 h-4" /> Suspend
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 inline-flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4" /> Profile
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
              <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-bold text-slate-600">{s}</span>
            ))}
          </div>
        )}
        {user.bio && <p className="mt-3 text-sm text-slate-600 whitespace-pre-wrap">{user.bio}</p>}
      </Card>

      <Card className="p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Projects ({owned.length})</h3>
        {owned.length === 0 ? (
          <p className="text-sm text-slate-400">No projects owned by this account.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {owned.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/projects?id=${encodeURIComponent(p.id)}`} className="py-2.5 flex items-center gap-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg">
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
        <Card className="p-5 border-rose-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-rose-700">Delete account</p>
              <p className="text-xs text-slate-500">Removes the profile from Firestore. Suspend instead if you may restore it.</p>
            </div>
            <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </Card>
      )}

      <Modal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        title={`Suspend ${user.fullName || user.email}?`}
        footer={
          <>
            <Button onClick={() => setSuspendOpen(false)}>Cancel</Button>
            <Button variant="warning" onClick={suspend} loading={busy === "suspend"}>Suspend</Button>
          </>
        }
      >
        <p>They will be signed out on their next visit and blocked from signing in. Their projects stay as they are.</p>
        <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className={`${inputCls} mt-3`} placeholder="Reason (required, kept in the audit log)" />
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this account permanently?"
        footer={
          <>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={doDelete} loading={busy === "delete"} disabled={confirmText.trim().toLowerCase() !== "delete"}>
              Delete permanently
            </Button>
          </>
        }
      >
        <p>This cannot be undone. If they sign in again, a fresh empty profile will be created.</p>
        {owned.length > 0 && (
          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={withProjects} onChange={(e) => setWithProjects(e.target.checked)} className="w-4 h-4 accent-rose-600" />
            Also delete their {owned.length} project{owned.length === 1 ? "" : "s"}
          </label>
        )}
        <label className="block mt-3 text-xs font-bold text-slate-600">
          Type <span className="font-mono">delete</span> to confirm
          <input className={`${inputCls} mt-1`} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        </label>
      </Modal>
    </div>
  );
}

function UsersInner() {
  const params = useSearchParams();
  const { users, projects, loading, error, reload } = useAdminData();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState(params.get("status") || "all");
  const [profile, setProfile] = useState(params.get("profile") || "all");
  const [dept, setDept] = useState("all");
  const [page, setPage] = useState(1);
  const [openUid, setOpenUid] = useState<string | null>(params.get("uid"));

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

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "all" && (u.role || "student") !== role) return false;
      if (status !== "all" && (u.accountStatus || "active") !== status) return false;
      if (profile === "complete" && !u.profileCompleted) return false;
      if (profile === "incomplete" && u.profileCompleted) return false;
      if (dept !== "all" && u.department !== dept) return false;
      if (!term) return true;
      return [u.fullName, u.email, u.studentCode, u.usn, u.department, u.phoneNumber, u.uid]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [users, q, role, status, profile, dept]);

  useEffect(() => setPage(1), [q, role, status, profile, dept]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openUser = users.find((u) => u.uid === openUid) || null;
  const hasFilters = q || role !== "all" || status !== "all" || profile !== "all" || dept !== "all";

  const exportCsv = () =>
    downloadCsv(
      `projecthub-users-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((u) => ({
        uid: u.uid,
        name: u.fullName,
        email: u.email,
        role: u.role || "student",
        status: u.accountStatus || "active",
        studentCode: u.studentCode || "",
        usn: u.usn || "",
        college: u.college || "",
        department: u.department || "",
        branch: u.branch || "",
        year: u.year || "",
        phone: u.phoneNumber ? `${u.countryCode || ""} ${u.phoneNumber}` : "",
        profileCompleted: u.profileCompleted ? "yes" : "no",
        projects: projectCount.get(u.uid) || 0,
        skills: u.skills,
        updatedAt: u.updatedAt || "",
      }))
    );

  if (loading && !users.length) return <LoadingBlock label="Loading users…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${users.length} registered account${users.length === 1 ? "" : "s"}`}
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
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, student code, USN…" className={`${inputCls} pl-9`} aria-label="Search users" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select ariaLabel="Role" value={role} onChange={setRole} options={[{ value: "all", label: "All roles" }, { value: "student", label: "Students" }, { value: "user", label: "Users (visitors)" }]} />
            <Select ariaLabel="Status" value={status} onChange={setStatus} options={[{ value: "all", label: "Any status" }, { value: "active", label: "Active" }, { value: "suspended", label: "Suspended" }]} />
            <Select ariaLabel="Profile" value={profile} onChange={setProfile} options={[{ value: "all", label: "Any profile" }, { value: "complete", label: "Profile complete" }, { value: "incomplete", label: "Profile incomplete" }]} />
            <Select ariaLabel="Department" value={dept} onChange={setDept} options={[{ value: "all", label: "All departments" }, ...departments.map((d) => ({ value: d, label: d }))]} />
          </div>
        </div>
        {hasFilters && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>{filtered.length} of {users.length} match</span>
            <button
              type="button"
              onClick={() => {
                setQ("");
                setRole("all");
                setStatus("all");
                setProfile("all");
                setDept("all");
              }}
              className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={UsersIcon} title={users.length ? "No users match" : "No users yet"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[820px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-3">Code / USN</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3 text-right">Projects</th>
                  <th className="py-3 px-3">Profile</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((u) => (
                  <tr key={u.uid} onClick={() => setOpenUid(u.uid)} className="hover:bg-slate-50/80 cursor-pointer">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={u.photoURL} name={u.fullName || u.email} size={34} />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[240px] inline-flex items-center gap-1.5">
                            <span className="truncate">{u.fullName || "Unnamed"}</span>
                            {u.isHost && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-label="Host" />}
                          </p>
                          <p className="text-xs text-slate-500 truncate max-w-[240px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-mono text-xs text-slate-700 whitespace-nowrap">{u.studentCode || "—"}</p>
                      <p className="text-[11px] text-slate-400">{u.usn || ""}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate">{u.department || "—"}</td>
                    <td className="py-3 px-3 capitalize text-slate-700 font-semibold">{u.role || "student"}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-semibold text-slate-700">{projectCount.get(u.uid) || 0}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[11px] font-bold ${u.profileCompleted ? "text-emerald-600" : "text-amber-600"}`}>
                        {u.profileCompleted ? "Complete" : "Incomplete"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={u.accountStatus || "active"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="px-2 font-bold text-slate-700">{page} / {pages}</span>
              <Button size="sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} aria-label="Next page"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </Card>

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
