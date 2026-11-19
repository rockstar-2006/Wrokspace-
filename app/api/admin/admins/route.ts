import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, dbError, jsonError, logAdminAction } from "@/lib/admin/guard";
import { adminDb } from "@/lib/admin/firebaseAdmin";

export const dynamic = "force-dynamic";

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: "superadmin" | "admin" | "reviewer";
  password?: string;
  createdAt: string;
  createdBy?: string;
}

/** GET /api/admin/admins — returns all administrator accounts */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const snap = await adminDb().collection("admins").get();
    const customAdmins: AdminAccount[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        email: data.email || d.id,
        name: data.name || data.email?.split("@")[0] || "Administrator",
        role: data.role || "admin",
        createdAt: data.createdAt || new Date().toISOString(),
        createdBy: data.createdBy || "system",
      };
    });

    // Also include primary system master admin
    const masterAdmin: AdminAccount = {
      id: "master-admin",
      email: "admin@projecthub.internal",
      name: "Host Master Admin",
      role: "superadmin",
      createdAt: "2024-01-01T00:00:00.000Z",
      createdBy: "system",
    };

    const all = [masterAdmin, ...customAdmins.filter((a) => a.email !== masterAdmin.email)];
    return NextResponse.json({ admins: all });
  } catch (err) {
    console.error("[admin] Failed to fetch admins:", err);
    return dbError(err);
  }
}

/** POST /api/admin/admins — add a new administrator account */
export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim() || email.split("@")[0];
    const password = String(body.password || "").trim();
    const role = (["superadmin", "admin", "reviewer"].includes(body.role) ? body.role : "admin") as AdminAccount["role"];

    if (!email) {
      return jsonError("Email address is required.");
    }

    const docId = email.replace(/[^a-z0-9_.-]/g, "_");
    const adminDoc: AdminAccount = {
      id: docId,
      email,
      name,
      password: password || undefined,
      role,
      createdAt: new Date().toISOString(),
      createdBy: admin.email,
    };

    await adminDb().collection("admins").doc(docId).set(adminDoc);

    await logAdminAction(admin, {
      action: "admin.create",
      targetType: "user",
      targetId: docId,
      targetLabel: `${name} (${email})`,
      note: `Added administrator with role: ${role}`,
    });

    const safeResponse = { ...adminDoc };
    delete safeResponse.password;
    return NextResponse.json({ admin: safeResponse, ok: true });
  } catch (err) {
    console.error("[admin] Failed to create admin:", err);
    return dbError(err);
  }
}

/** DELETE /api/admin/admins?email=... — revoke administrator privileges */
export async function DELETE(req: NextRequest) {
  const { admin, error } = await requireAdmin();
  if (error) return error;

  try {
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    if (!email) {
      return jsonError("Email parameter is required.");
    }

    if (email === "admin" || email === "admin@projecthub.internal" || email === admin.email) {
      return jsonError("Cannot remove your own or the master administrator account.");
    }

    const docId = email.replace(/[^a-z0-9_.-]/g, "_");
    await adminDb().collection("admins").doc(docId).delete();

    await logAdminAction(admin, {
      action: "admin.delete",
      targetType: "user",
      targetId: docId,
      targetLabel: email,
      note: `Revoked administrator access for ${email}`,
    });

    return NextResponse.json({ ok: true, removed: email });
  } catch (err) {
    console.error("[admin] Failed to delete admin:", err);
    return dbError(err);
  }
}
