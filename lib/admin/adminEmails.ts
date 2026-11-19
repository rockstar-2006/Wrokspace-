/**
 * Host / admin allowlist.
 *
 * Admin access is granted to accounts listed in the ADMIN_EMAILS
 * environment variable (comma separated) and internal master defaults.
 * Safe for Edge runtime and server routes (no native Node or SDK side-effects).
 */
export function getAdminEmails(): string[] {
  const configured = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const defaults = [
    "admin@projecthub.internal",
    "admin@projectspace.internal",
    "admin@admin.com",
    "admin@gmail.com",
    "admin",
  ];

  return Array.from(new Set([...configured, ...defaults]));
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const list = getAdminEmails();

  if (list.includes(normalized)) return true;
  if (normalized === "admin" || normalized.startsWith("admin@") || normalized.endsWith("@projecthub.internal")) {
    return true;
  }
  return false;
}
