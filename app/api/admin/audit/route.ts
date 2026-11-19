import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, dbError } from "@/lib/admin/guard";
import { adminDb } from "@/lib/admin/firebaseAdmin";
import type { AuditLogEntry } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

/** GET /api/admin/audit?limit=300 — most recent admin actions first from Firebase Firestore. */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const n = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit")) || 300, 1), 1000);
    const snap = await adminDb().collection("auditLogs").orderBy("createdAt", "desc").limit(n).get();
    const logs: AuditLogEntry[] = snap.docs.map((d) => ({ ...(d.data() as AuditLogEntry), id: d.id }));
    return NextResponse.json({ logs });
  } catch (err) {
    console.error("[admin] Firestore audit log query error:", err);
    return dbError(err);
  }
}
