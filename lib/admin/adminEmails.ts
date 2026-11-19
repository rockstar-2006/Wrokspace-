/**
 * Host / admin allowlist.
 *
 * Admin access is granted ONLY to Google accounts listed in the ADMIN_EMAILS
 * environment variable (comma separated). It is deliberately NOT derived from
 * the `role` field in Firestore: the client SDK can write to `users/*`, so a
 * Firestore value cannot be trusted to grant privileges.
 *
 * Server-only: process.env.ADMIN_EMAILS is never exposed to the browser.
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
