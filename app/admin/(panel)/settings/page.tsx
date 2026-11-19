"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Save, Lock, Unlock, Megaphone, Globe2, Timer, ShieldCheck, AlertTriangle, X } from "lucide-react";
import { useAdminData } from "@/components/admin/AdminDataContext";
import { Button, Card, PageHeader, Toggle, inputCls, useToast } from "@/components/admin/ui";
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

export default function PortalSettingsPage() {
  const toast = useToast();
  const { settings, setSettings, users, admin } = useAdminData();
  const [draft, setDraft] = useState<PortalSettings>(settings);
  const [domainInput, setDomainInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

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

  return (
    <div>
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

      <Card className="mb-4">
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
                className={`${inputCls} mt-1`}
                value={draft.submissionsClosedMessage}
                onChange={(e) => setDraft({ ...draft, submissionsClosedMessage: e.target.value })}
              />
            </label>
          )}
        </Row>

        <Row icon={Megaphone} title="Announcement banner" text="A banner shown at the top of every student's dashboard — deadlines, results, maintenance notices.">
          <div className="flex items-center gap-3">
            <Toggle
              checked={draft.announcement.enabled}
              onChange={(v) => setDraft({ ...draft, announcement: { ...draft.announcement, enabled: v } })}
              label="Show announcement"
            />
            <span className="text-sm font-bold text-slate-700">{draft.announcement.enabled ? "Visible to students" : "Hidden"}</span>
          </div>
          <textarea
            rows={2}
            maxLength={300}
            className={`${inputCls} mt-3`}
            placeholder="e.g. Final-year showcase submissions close on 30 Nov at 11:59 PM."
            value={draft.announcement.text}
            onChange={(e) => setDraft({ ...draft, announcement: { ...draft.announcement, text: e.target.value } })}
          />
          <div className="mt-2 flex items-center gap-2">
            {(["info", "warning", "success"] as const).map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => setDraft({ ...draft, announcement: { ...draft.announcement, tone } })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border capitalize ${
                  draft.announcement.tone === tone ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
          {draft.announcement.text.trim() && (
            <div
              className={`mt-3 px-4 py-2.5 rounded-xl text-sm font-semibold border flex items-center gap-2 ${
                draft.announcement.tone === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : draft.announcement.tone === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-indigo-50 border-indigo-200 text-indigo-800"
              }`}
            >
              <Megaphone className="w-4 h-4 shrink-0" /> <span className="break-words">{draft.announcement.text}</span>
              <span className="ml-auto text-[10px] font-black uppercase opacity-60">Preview</span>
            </div>
          )}
        </Row>

        <Row
          icon={Globe2}
          title="Allowed sign-in domains"
          text="Restrict sign-in to your institution's email domains. Leave empty to allow any Google or email account."
        >
          <div className="flex gap-2">
            <input
              className={inputCls}
              placeholder="college.edu"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
              aria-label="Add allowed domain"
            />
            <Button onClick={addDomain}>Add</Button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {draft.allowedEmailDomains.length === 0 ? (
              <span className="text-xs text-slate-400">No restriction — all domains allowed.</span>
            ) : (
              draft.allowedEmailDomains.map((d) => (
                <span key={d} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
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

      <Card className="p-5">
        <div className="flex gap-3">
          <span className="w-9 h-9 rounded-xl bg-slate-900 text-indigo-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div className="text-sm text-slate-600 leading-relaxed">
            <p className="font-black text-slate-900">Who can access this console</p>
            <p className="mt-1">
              Host access is granted to the Google accounts in the <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">ADMIN_EMAILS</code> server
              environment variable (you are signed in as <b>{admin.email}</b>). To add or remove an administrator, edit that variable in
              <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded mx-1">.env.local</code>(or your host&apos;s environment settings) and restart the server.
              It is intentionally not editable here so a compromised student account can never grant itself admin rights.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
