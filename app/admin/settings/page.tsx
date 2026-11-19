"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Save,
  Lock,
  Unlock,
  Megaphone,
  Globe2,
  Timer,
  ShieldCheck,
  AlertTriangle,
  X,
  UserPlus,
  Trash2,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { useAdminData } from "@/components/admin/AdminDataContext";
import { Button, Card, PageHeader, Toggle, Modal, inputCls, useToast } from "@/components/admin/ui";
import { adminApi, formatDate } from "@/lib/admin/client";
import { isEmailDomainAllowed, PortalSettings } from "@/lib/admin/types";

function Row({ icon: Icon, title, text, children }: { icon: any; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-4 border-b border-slate-100 last:border-b-0">
      <div className="flex gap-3">
        <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </span>
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{text}</p>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

interface AdminItem {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  createdBy?: string;
}

export default function PortalSettingsPage() {
  const toast = useToast();
  const { settings, setSettings, users, admin } = useAdminData();
  const [draft, setDraft] = useState<PortalSettings>(settings);
  const [domainInput, setDomainInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Admin accounts state
  const [adminsList, setAdminsList] = useState<AdminItem[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "", role: "admin" });
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  useEffect(() => setDraft(settings), [settings]);

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const res = await adminApi.admins();
      setAdminsList(res.admins || []);
    } catch (e: any) {
      console.warn("Could not load admins:", e);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const dirty = JSON.stringify({ ...draft, updatedAt: 0, updatedBy: 0 }) !== JSON.stringify({ ...settings, updatedAt: 0, updatedBy: 0 });

  const lockedOut = useMemo(
    () => users.filter((u) => u.email && !u.isHost && !isEmailDomainAllowed(u.email, draft.allowedEmailDomains)).length,
    [users, draft.allowedEmailDomains]
  );

  const addDomain = () => {
    const d = domainInput.trim().toLowerCase().replace(/^@/, "");
    if (!d) return;
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) {
      toast("error", "Enter a domain like college.edu");
      return;
    }
    if (!draft.allowedEmailDomains.includes(d)) setDraft({ ...draft, allowedEmailDomains: [...draft.allowedEmailDomains, d] });
    setDomainInput("");
  };

  const save = async () => {
    setSaving(true);
    try {
      const { settings: s } = await adminApi.saveSettings(draft);
      setSettings(s);
      toast("success", "Portal settings saved");
    } catch (e: any) {
      toast("error", e?.message || "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.email.trim()) {
      toast("error", "Please provide an email address or username.");
      return;
    }

    setAddingAdmin(true);
    try {
      await adminApi.addAdmin(newAdmin);
      toast(
        "success",
        `Admin access granted to ${newAdmin.email}! They can now log in via Google or password.`
      );
      setAddModalOpen(false);
      setNewAdmin({ name: "", email: "", password: "", role: "admin" });
      await loadAdmins();
    } catch (err: any) {
      toast("error", err?.message || "Failed to add administrator");
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRevokeAdmin = async (email: string) => {
    if (!confirm(`Are you sure you want to revoke admin access for ${email}?`)) return;
    setDeletingEmail(email);
    try {
      await adminApi.deleteAdmin(email);
      toast("success", `Admin access revoked for ${email}`);
      await loadAdmins();
    } catch (err: any) {
      toast("error", err?.message || "Failed to revoke admin");
    } finally {
      setDeletingEmail(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portal settings"
        subtitle={settings.updatedAt ? `Last changed ${formatDate(settings.updatedAt)} by ${settings.updatedBy}` : "Controls that apply to the whole ProjectHub portal."}
        actions={
          <>
            {dirty && (
              <Button onClick={() => setDraft(settings)} disabled={saving}>
                Discard
              </Button>
            )}
            <Button variant="primary" onClick={save} disabled={!dirty} loading={saving}>
              <Save className="w-4 h-4" /> Save changes
            </Button>
          </>
        }
      />

      {/* ══════════ ADMINISTRATOR TEAM & ACCESS MANAGER ══════════ */}
      <Card className="p-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900">Administrator Access & Credentials</h2>
              <p className="text-xs text-slate-500">
                Manage who can log into this host console. Add emails and passwords for co-admins or faculty evaluators.
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}>
            <UserPlus className="w-3.5 h-3.5" /> + Add Administrator
          </Button>
        </div>

        <div className="mt-4">
          {loadingAdmins ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading administrators…</div>
          ) : adminsList.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">No custom administrators found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {adminsList.map((adm) => {
                const isMaster = adm.id === "master-admin" || adm.email === "admin@projecthub.internal";
                return (
                  <div key={adm.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{adm.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          adm.role === "superadmin"
                            ? "bg-indigo-100 text-indigo-700"
                            : adm.role === "reviewer"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {adm.role}
                        </span>
                        {isMaster && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Master Account
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5 font-mono">{adm.email}</p>
                    </div>

                    {!isMaster && adm.email !== admin.email && (
                      <button
                        type="button"
                        onClick={() => handleRevokeAdmin(adm.email)}
                        disabled={deletingEmail === adm.email}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3 h-3" /> Revoke
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* ══════════ MODAL: ADD ADMINISTRATOR ══════════ */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Administrator"
        footer={
          <>
            <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateAdmin} loading={addingAdmin}>
              Save & Authorize
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-sm">
          <p className="text-xs text-slate-500">
            This person will immediately be authorized to log into the Admin Console via <b>Continue with Google</b> (using this email) or via password.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. A. Sharma"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email or Login Username</label>
            <input
              type="text"
              required
              placeholder="e.g. sharma@sode-edu.in or sharma_admin"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Login Password (Optional)</label>
              <span className="text-[10px] text-slate-400 font-medium">Leave blank for Google Sign-In only</span>
            </div>
            <input
              type="password"
              placeholder="Optional password for manual credentials login"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Role / Permissions</label>
            <select
              value={newAdmin.role}
              onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
              className={inputCls}
            >
              <option value="admin">Administrator (Full Access)</option>
              <option value="reviewer">Reviewer (Submissions & Reviews)</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* ══════════ SUBMISSIONS & NOTICES ══════════ */}
      <Card>
        <Row
          icon={draft.submissionsOpen ? Unlock : Lock}
          title="Project submissions"
          text="Close submissions outside the showcase window. Students can still edit existing projects."
        >
          <div className="flex items-center gap-3">
            <Toggle checked={draft.submissionsOpen} onChange={(v) => setDraft({ ...draft, submissionsOpen: v })} label="Submissions open" />
            <span className={`text-sm font-bold ${draft.submissionsOpen ? "text-emerald-700" : "text-amber-700"}`}>
              {draft.submissionsOpen ? "Open — students can submit new projects" : "Closed — new submissions are blocked"}
            </span>
          </div>
          {!draft.submissionsOpen && (
            <label className="block mt-3 text-xs font-bold text-slate-600">
              Message shown to students
              <textarea
                rows={2}
                value={draft.submissionsClosedMessage}
                onChange={(e) => setDraft({ ...draft, submissionsClosedMessage: e.target.value })}
                className={`${inputCls} mt-1`}
              />
            </label>
          )}
        </Row>

        <Row icon={Megaphone} title="Portal-wide announcement" text="A banner shown across all student portal and showcase pages.">
          <div className="flex items-center gap-3">
            <Toggle checked={draft.announcement.enabled} onChange={(v) => setDraft({ ...draft, announcement: { ...draft.announcement, enabled: v } })} label="Show banner" />
            <span className="text-xs font-bold text-slate-500">{draft.announcement.enabled ? "Visible" : "Hidden"}</span>
          </div>
          {draft.announcement.enabled && (
            <div className="mt-3 space-y-2">
              <input
                className={inputCls}
                placeholder="e.g. Final project submissions close Friday at 5 PM."
                value={draft.announcement.text}
                onChange={(e) => setDraft({ ...draft, announcement: { ...draft.announcement, text: e.target.value } })}
              />
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">Tone:</span>
                {(["info", "warning", "success"] as const).map((t) => (
                  <label key={t} className="inline-flex items-center gap-1.5 text-xs font-bold capitalize text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="tone"
                      checked={draft.announcement.tone === t}
                      onChange={() => setDraft({ ...draft, announcement: { ...draft.announcement, tone: t } })}
                      className="accent-slate-900"
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
          )}
        </Row>

        <Row icon={Globe2} title="Allowed email domains" text="Restrict student registration to specific domains (e.g. college.edu). Leave empty to allow any email.">
          <div className="flex gap-2">
            <input
              placeholder="e.g. sode-edu.in"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
              className={`${inputCls} max-w-xs`}
            />
            <Button size="sm" onClick={addDomain}>
              Add domain
            </Button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {draft.allowedEmailDomains.length === 0 ? (
              <span className="text-xs text-slate-400">All email domains currently allowed.</span>
            ) : (
              draft.allowedEmailDomains.map((d) => (
                <span key={d} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                  @{d}
                  <button
                    type="button"
                    aria-label={`Remove ${d}`}
                    onClick={() => setDraft({ ...draft, allowedEmailDomains: draft.allowedEmailDomains.filter((x) => x !== d) })}
                    className="p-0.5 rounded hover:bg-indigo-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          {lockedOut > 0 && (
            <p className="mt-2.5 text-xs font-semibold text-amber-700 inline-flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> {lockedOut} existing account{lockedOut === 1 ? "" : "s"} would be blocked from signing in.
            </p>
          )}
        </Row>

        <Row icon={Timer} title="Review turnaround target" text="Submissions waiting longer than this are flagged as overdue in the review queue and overview.">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={720}
              className={`${inputCls} w-28`}
              value={draft.reviewSlaHours}
              onChange={(e) => setDraft({ ...draft, reviewSlaHours: Math.max(1, Number(e.target.value) || 1) })}
              aria-label="Review target in hours"
            />
            <span className="text-sm text-slate-600 font-semibold">hours</span>
          </div>
        </Row>
      </Card>
    </div>
  );
}
