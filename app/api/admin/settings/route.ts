import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, dbError, logAdminAction } from "@/lib/admin/guard";
import { readPortalSettings, writePortalSettings } from "@/lib/admin/settingsStore";
import { normalizeSettings } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json({ settings: await readPortalSettings() });
}

export async function PUT(req: NextRequest) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await req.json().catch(() => ({}));
    const before = await readPortalSettings();
    const next = normalizeSettings({
      ...before,
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: admin.email,
    });
    await writePortalSettings(next);

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    (["submissionsOpen", "submissionsClosedMessage", "announcement", "allowedEmailDomains", "reviewSlaHours"] as const).forEach(
      (k) => {
        if (JSON.stringify(before[k]) !== JSON.stringify(next[k])) changes[k] = { from: before[k], to: next[k] };
      }
    );
    if (Object.keys(changes).length) {
      await logAdminAction(admin, {
        action: "settings.update",
        targetType: "settings",
        targetId: "portal",
        targetLabel: "Portal settings",
        changes,
      });
    }
    return NextResponse.json({ settings: next });
  } catch (err) {
    return dbError(err);
  }
}
