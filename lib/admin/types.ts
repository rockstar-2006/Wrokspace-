/**
 * Admin (Host) panel shared types & constants.
 * Safe to import from both client and server code (no runtime dependencies).
 */
import type { Project, ProjectStatus, ProjectCategory } from "@/lib/firebase/types";

/** Body accepted by PATCH /api/admin/projects/[id] and POST /api/admin/projects/bulk. */
export interface ProjectUpdateInput {
  status?: ProjectStatus;
  featured?: boolean;
  /** Feedback for the student (required for "Changes requested" / "Rejected"). */
  note?: string;
  fields?: Partial<
    Pick<
      Project,
      "title" | "subtitle" | "category" | "tags" | "academicYear" | "facultyGuide" | "finalYearProject"
    >
  >;
}

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Draft",
  "Pending review",
  "Under Review",
  "Changes requested",
  "Published",
  "Rejected",
  "Archived",
];

export const PROJECT_CATEGORIES: Exclude<ProjectCategory, "All">[] = [
  "Web Apps",
  "Mobile Apps",
  "AI / ML",
  "Hardware",
  "Others",
];

/** Statuses that require a written reason for the student. */
export const STATUSES_REQUIRING_NOTE: ProjectStatus[] = ["Changes requested", "Rejected"];

export const isAwaitingReview = (s?: string) => s === "Pending review" || s === "Under Review";

export type AccountStatus = "active" | "suspended";

export interface ReviewHistoryEntry {
  status: ProjectStatus;
  note?: string;
  by: string;
  at: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  targetType: "project" | "user" | "settings";
  targetId: string;
  targetLabel?: string;
  actorEmail: string;
  actorName?: string;
  note?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  createdAt: string;
}

export interface PortalSettings {
  /** When false, students cannot start new project submissions (editing existing ones still works). */
  submissionsOpen: boolean;
  submissionsClosedMessage: string;
  announcement: {
    enabled: boolean;
    text: string;
    tone: "info" | "warning" | "success";
  };
  /** Lower-case email domains allowed to sign in (e.g. "sode-edu.in"). Empty = everyone. */
  allowedEmailDomains: string[];
  /** Submissions waiting longer than this are flagged as overdue in the review queue. */
  reviewSlaHours: number;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
  submissionsOpen: true,
  submissionsClosedMessage:
    "Project submissions are currently closed. Please check back when the next showcase window opens.",
  announcement: { enabled: false, text: "", tone: "info" },
  allowedEmailDomains: [],
  reviewSlaHours: 48,
};

export function normalizeSettings(raw: Partial<PortalSettings> | null | undefined): PortalSettings {
  const r = raw || {};
  return {
    submissionsOpen: r.submissionsOpen ?? DEFAULT_PORTAL_SETTINGS.submissionsOpen,
    submissionsClosedMessage:
      (r.submissionsClosedMessage || "").trim() || DEFAULT_PORTAL_SETTINGS.submissionsClosedMessage,
    announcement: {
      enabled: Boolean(r.announcement?.enabled),
      text: String(r.announcement?.text || ""),
      tone: (["info", "warning", "success"] as const).includes(r.announcement?.tone as any)
        ? (r.announcement!.tone as PortalSettings["announcement"]["tone"])
        : "info",
    },
    allowedEmailDomains: Array.isArray(r.allowedEmailDomains)
      ? r.allowedEmailDomains.map((d) => String(d).trim().toLowerCase().replace(/^@/, "")).filter(Boolean)
      : [],
    reviewSlaHours:
      Number.isFinite(Number(r.reviewSlaHours)) && Number(r.reviewSlaHours) > 0
        ? Math.round(Number(r.reviewSlaHours))
        : DEFAULT_PORTAL_SETTINGS.reviewSlaHours,
    updatedAt: r.updatedAt,
    updatedBy: r.updatedBy,
  };
}

export function isEmailDomainAllowed(email: string, domains: string[]): boolean {
  if (!domains.length) return true;
  const domain = (email.split("@")[1] || "").toLowerCase();
  return domains.some((d) => domain === d || domain.endsWith(`.${d}`));
}
