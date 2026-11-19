import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "./adminEmails";
import { adminDb, AdminNotConfiguredError } from "./firebaseAdmin";
import type { AuditLogEntry } from "./types";

export interface AdminIdentity {
  email: string;
  name: string;
  image?: string;
}

/**
 * Verifies the request comes from a signed-in Host/admin (NextAuth Google session
 * whose email is in ADMIN_EMAILS). Returns the identity, or a ready-made error response.
 */
export async function requireAdmin(): Promise<
  { admin: AdminIdentity; error?: undefined } | { admin?: undefined; error: NextResponse }
> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) {
    return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  }
  if (!isAdminEmail(email)) {
    return { error: NextResponse.json({ error: "This account is not an administrator" }, { status: 403 }) };
  }
  return {
    admin: {
      email,
      name: session?.user?.name || email.split("@")[0],
      image: session?.user?.image || undefined,
    },
  };
}

/** Writes an entry to the `auditLogs` collection. Never throws: a logging failure must not undo an admin action. */
export async function logAdminAction(
  admin: AdminIdentity,
  entry: Omit<AuditLogEntry, "id" | "actorEmail" | "actorName" | "createdAt">
): Promise<void> {
  try {
    const clean: Record<string, unknown> = {
      ...entry,
      actorEmail: admin.email,
      actorName: admin.name,
      createdAt: new Date().toISOString(),
    };
    Object.keys(clean).forEach((k) => clean[k] === undefined && delete clean[k]);
    if (clean.changes) clean.changes = JSON.parse(JSON.stringify(clean.changes));
    await adminDb().collection("auditLogs").add(clean);
  } catch (err) {
    console.warn("[admin] audit log write failed:", err);
  }
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Database errors → readable message + HTTP status. */
export function dbError(err: unknown): NextResponse {
  if (err instanceof AdminNotConfiguredError) return jsonError(err.message, 503);
  const msg = (err as any)?.message || "Database operation failed";
  console.error("[admin] database error:", err);
  return jsonError(msg, 500);
}
