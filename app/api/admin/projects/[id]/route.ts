import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, dbError, jsonError } from "@/lib/admin/guard";
import { applyProjectUpdate, deleteProjectAsAdmin, OpError } from "@/lib/admin/projectOps";

export const dynamic = "force-dynamic";

/** PATCH /api/admin/projects/[id] — review decision, feature toggle and/or field edits. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await req.json().catch(() => ({}));
    const project = await applyProjectUpdate(admin, params.id, body);
    return NextResponse.json({ project });
  } catch (err) {
    if (err instanceof OpError) return jsonError(err.message, err.status);
    return dbError(err);
  }
}

/** DELETE /api/admin/projects/[id] — permanent removal (recorded in the audit log). */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  try {
    const reason = req.nextUrl.searchParams.get("reason") || undefined;
    await deleteProjectAsAdmin(admin, params.id, reason);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof OpError) return jsonError(err.message, err.status);
    return dbError(err);
  }
}
