import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, dbError, jsonError, logAdminAction } from "@/lib/admin/guard";
import { adminAuth, adminDb } from "@/lib/admin/firebaseAdmin";
import { isHostAccount } from "@/lib/admin/hostCheck";
import type { StudentProfile } from "@/lib/firebase/types";

export const dynamic = "force-dynamic";

const ASSIGNABLE_ROLES = ["student", "user"] as const;

/**
 * PATCH /api/admin/users/[uid]
 * { accountStatus?: "active" | "suspended", reason?: string, role?: "student" | "user" }
 */
export async function PATCH(req: NextRequest, { params }: { params: { uid: string } }) {
  const { admin, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json().catch(() => ({}));
    const ref = adminDb().collection("users").doc(params.uid);
    const snap = await ref.get();
    if (!snap.exists) return jsonError("User not found in Firebase", 404);
    const current = snap.data() as StudentProfile;

    const patch: Record<string, unknown> = {};
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    const reason = String(body?.reason || "").trim().slice(0, 1000);
    let action = "user.edit";

    if (body?.accountStatus === "suspended" || body?.accountStatus === "active") {
      if (body.accountStatus === "suspended") {
        if (await isHostAccount(params.uid, current.email)) return jsonError("Host accounts cannot be suspended");
        if (!reason) return jsonError("A reason is required to suspend an account");
      }
      const from = current.accountStatus || "active";
      if (from !== body.accountStatus) {
        patch.accountStatus = body.accountStatus;
        patch.suspendedReason = body.accountStatus === "suspended" ? reason : "";
        patch.suspendedAt = body.accountStatus === "suspended" ? new Date().toISOString() : "";
        changes.accountStatus = { from, to: body.accountStatus };
        action = body.accountStatus === "suspended" ? "user.suspend" : "user.reactivate";
      }
    }

    if (body?.role !== undefined) {
      if (!ASSIGNABLE_ROLES.includes(body.role)) return jsonError("Invalid role");
      if ((current.role || "student") !== body.role) {
        patch.role = body.role;
        changes.role = { from: current.role || "student", to: body.role };
        if (action === "user.edit") action = "user.role_change";
      }
    }

    if (!Object.keys(patch).length) return NextResponse.json({ user: current });
    patch.updatedAt = new Date().toISOString();
    await ref.update(patch);

    if (patch.accountStatus) {
      try {
        const disabled = patch.accountStatus === "suspended";
        await adminAuth().updateUser(params.uid, { disabled });
        if (disabled) await adminAuth().revokeRefreshTokens(params.uid);
      } catch (e: any) {
        if (e?.code !== "auth/user-not-found") console.warn("[admin] auth update failed:", e?.message);
      }
    }

    await logAdminAction(admin, {
      action,
      targetType: "user",
      targetId: params.uid,
      targetLabel: current.fullName || current.email,
      note: reason || undefined,
      changes,
    });
    return NextResponse.json({ user: { ...current, ...patch } });
  } catch (err) {
    return dbError(err);
  }
}

/** DELETE /api/admin/users/[uid]?withProjects=1&reason=... */
export async function DELETE(req: NextRequest, { params }: { params: { uid: string } }) {
  const { admin, error } = await requireAdmin();
  if (error) return error;

  try {
    const db = adminDb();
    const ref = db.collection("users").doc(params.uid);
    const snap = await ref.get();
    if (!snap.exists) return jsonError("User not found in Firebase", 404);
    const current = snap.data() as StudentProfile;
    if (await isHostAccount(params.uid, current.email)) return jsonError("Host accounts cannot be deleted from the panel");

    const withProjects = req.nextUrl.searchParams.get("withProjects") === "1";
    const reason = req.nextUrl.searchParams.get("reason") || undefined;
    let removedProjects = 0;

    if (withProjects) {
      const owned = await db.collection("projects").where("ownerId", "==", params.uid).get();
      const batch = db.batch();
      owned.docs.forEach((d) => batch.delete(d.ref));
      if (owned.size) await batch.commit();
      removedProjects = owned.size;
    }

    await ref.delete();

    try {
      await adminAuth().deleteUser(params.uid);
    } catch (e: any) {
      if (e?.code !== "auth/user-not-found") console.warn("[admin] auth delete failed:", e?.message);
    }

    await logAdminAction(admin, {
      action: "user.delete",
      targetType: "user",
      targetId: params.uid,
      targetLabel: current.fullName || current.email,
      note: [reason, withProjects ? `Also deleted ${removedProjects} project(s)` : ""].filter(Boolean).join(" — ") || undefined,
    });
    return NextResponse.json({ ok: true, removedProjects });
  } catch (err) {
    return dbError(err);
  }
}
