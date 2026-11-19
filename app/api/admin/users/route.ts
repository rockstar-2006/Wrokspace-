import { NextResponse } from "next/server";
import { requireAdmin, dbError } from "@/lib/admin/guard";
import { adminDb } from "@/lib/admin/firebaseAdmin";
import { isAdminEmail } from "@/lib/admin/adminEmails";
import { authEmailsByUid } from "@/lib/admin/hostCheck";
import { normalizeDates, str } from "@/lib/admin/normalize";
import type { StudentProfile } from "@/lib/firebase/types";

export const dynamic = "force-dynamic";

/** GET /api/admin/users — every registered account from Firebase, flagged with isHost when on the ADMIN_EMAILS list. */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [snap, authEmails] = await Promise.all([adminDb().collection("users").get(), authEmailsByUid()]);
    const users = snap.docs.map((d) => {
      const data = normalizeDates(d.data() as Record<string, any>, ["createdAt", "updatedAt", "suspendedAt"]);
      return {
        ...(data as StudentProfile),
        uid: str(data.uid) || d.id,
        email: str(data.email),
        fullName: str(data.fullName),
        skills: Array.isArray(data.skills) ? data.skills.map((s: unknown) => str(s)).filter(Boolean) : [],
        accountStatus: data.accountStatus === "suspended" ? "suspended" : "active",
        signInEmail: authEmails.get(d.id) || null,
        isHost: isAdminEmail(authEmails.get(d.id) || (authEmails.has(d.id) ? "" : str(data.email))),
      };
    });

    users.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    return NextResponse.json({ users });
  } catch (err) {
    console.error("[admin] Firebase users query failed:", err);
    return dbError(err);
  }
}
