import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, jsonError } from "@/lib/admin/guard";
import { AdminNotConfiguredError } from "@/lib/admin/firebaseAdmin";
import { applyProjectUpdate, deleteProjectAsAdmin, OpError, ProjectUpdateInput } from "@/lib/admin/projectOps";

export const dynamic = "force-dynamic";

const MAX_BULK = 100;

/**
 * POST /api/admin/projects/bulk
 * { ids: string[], op: "update", update: ProjectUpdateInput } | { ids, op: "delete", reason? }
 * Each project is processed independently; the response reports per-id success/failure.
 */
export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.map(String).slice(0, MAX_BULK) : [];
  if (!ids.length) return jsonError("No projects selected");
  const op = body?.op === "delete" ? "delete" : "update";
  const update: ProjectUpdateInput = body?.update || {};

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];
  for (const id of ids) {
    try {
      if (op === "delete") await deleteProjectAsAdmin(admin, id, body?.reason);
      else await applyProjectUpdate(admin, id, update);
      results.push({ id, ok: true });
    } catch (err) {
      if (err instanceof AdminNotConfiguredError) return jsonError(err.message, 503);
      results.push({
        id,
        ok: false,
        error: err instanceof OpError ? err.message : (err as any)?.message || "Database operation failed",
      });
    }
  }
  return NextResponse.json({ results, okCount: results.filter((r) => r.ok).length });
}
