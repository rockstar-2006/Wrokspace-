import type { Project } from "@/lib/firebase/types";
import { adminDb } from "./firebaseAdmin";
import { AdminIdentity, logAdminAction } from "./guard";
import { PROJECT_CATEGORIES, PROJECT_STATUSES, STATUSES_REQUIRING_NOTE, ProjectUpdateInput } from "./types";

export type { ProjectUpdateInput };

export class OpError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const STATUS_ACTION: Record<string, string> = {
  Published: "project.approve",
  "Changes requested": "project.request_changes",
  Rejected: "project.reject",
  Archived: "project.archive",
  "Under Review": "project.start_review",
  "Pending review": "project.reopen",
  Draft: "project.unpublish",
};

function sanitizeFields(fields: ProjectUpdateInput["fields"]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!fields) return out;
  if (typeof fields.title === "string") {
    const t = fields.title.trim();
    if (!t) throw new OpError("Title cannot be empty");
    out.title = t.slice(0, 160);
  }
  if (typeof fields.subtitle === "string") out.subtitle = fields.subtitle.trim().slice(0, 200);
  if (fields.category !== undefined) {
    if (!PROJECT_CATEGORIES.includes(fields.category as any)) throw new OpError("Invalid category");
    out.category = fields.category;
  }
  if (Array.isArray(fields.tags)) {
    out.tags = fields.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 25);
  }
  if (typeof fields.academicYear === "string") out.academicYear = fields.academicYear.trim().slice(0, 40);
  if (typeof fields.facultyGuide === "string") out.facultyGuide = fields.facultyGuide.trim().slice(0, 120);
  if (typeof fields.finalYearProject === "boolean") out.finalYearProject = fields.finalYearProject;
  return out;
}

/** Applies a moderation / edit operation to one project and records it in the audit log. */
export async function applyProjectUpdate(
  admin: AdminIdentity,
  id: string,
  input: ProjectUpdateInput
): Promise<Project> {
  const ref = adminDb().collection("projects").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new OpError("Project not found in Firebase", 404);
  const data = snap.data() as Project;
  const current = { ...data, id: data.id || snap.id };

  const note = (input.note || "").trim().slice(0, 2000);
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = sanitizeFields(input.fields);
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  for (const [k, v] of Object.entries(patch)) {
    const before = (current as any)[k];
    if (JSON.stringify(before) !== JSON.stringify(v)) changes[k] = { from: before ?? null, to: v };
  }

  if (input.status !== undefined) {
    if (!PROJECT_STATUSES.includes(input.status)) throw new OpError("Invalid status");
    if (STATUSES_REQUIRING_NOTE.includes(input.status) && !note) {
      throw new OpError(`A note for the student is required when setting "${input.status}"`);
    }
    if (input.status !== current.status) {
      patch.status = input.status;
      changes.status = { from: current.status ?? null, to: input.status };
      if (input.status === "Published" && !current.publishedDate) patch.publishedDate = now;
    }
    // Every review decision (even re-confirming) is recorded so the student sees the latest feedback
    patch.reviewNotes = note;
    patch.reviewedBy = admin.name;
    patch.reviewedAt = now;
    patch.reviewHistory = [
      ...(Array.isArray(current.reviewHistory) ? current.reviewHistory : []),
      { status: input.status, ...(note ? { note } : {}), by: admin.name, at: now },
    ].slice(-50);
  }

  if (typeof input.featured === "boolean" && input.featured !== Boolean(current.featured)) {
    patch.featured = input.featured;
    changes.featured = { from: Boolean(current.featured), to: input.featured };
  }

  if (Object.keys(patch).length === 0) return current;
  patch.updatedAt = now;

  await ref.update(patch);

  const action =
    input.status !== undefined && changes.status
      ? STATUS_ACTION[input.status] || "project.status"
      : changes.featured
      ? input.featured
        ? "project.feature"
        : "project.unfeature"
      : Object.keys(changes).length
      ? "project.edit"
      : input.status !== undefined
      ? "project.review_note"
      : "project.edit";

  await logAdminAction(admin, {
    action,
    targetType: "project",
    targetId: id,
    targetLabel: current.title,
    note: note || undefined,
    changes: Object.keys(changes).length ? changes : undefined,
  });

  return { ...current, ...(patch as Partial<Project>) };
}

export async function deleteProjectAsAdmin(admin: AdminIdentity, id: string, reason?: string) {
  const ref = adminDb().collection("projects").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new OpError("Project not found in Firebase", 404);
  const p = snap.data() as Project;
  await ref.delete();

  await logAdminAction(admin, {
    action: "project.delete",
    targetType: "project",
    targetId: id,
    targetLabel: p?.title || id,
    note: reason?.trim() || undefined,
    changes: { status: { from: p?.status ?? null, to: "deleted" } },
  });
}
