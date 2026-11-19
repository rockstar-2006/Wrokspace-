import { NextResponse } from "next/server";
import { readPortalSettings } from "@/lib/admin/settingsStore";

export const dynamic = "force-dynamic";

/** Public, read-only subset of portal settings used by the student app. */
export async function GET() {
  const s = await readPortalSettings();
  return NextResponse.json(
    {
      submissionsOpen: s.submissionsOpen,
      submissionsClosedMessage: s.submissionsClosedMessage,
      announcement: s.announcement.enabled && s.announcement.text.trim() ? s.announcement : null,
      allowedEmailDomains: s.allowedEmailDomains,
    },
    { headers: { "Cache-Control": "public, max-age=30" } }
  );
}
