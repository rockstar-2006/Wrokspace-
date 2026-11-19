import { NextResponse } from "next/server";
import { requireAdmin, dbError } from "@/lib/admin/guard";
import { adminDb } from "@/lib/admin/firebaseAdmin";
import { normalizeDates, str, toIso } from "@/lib/admin/normalize";
import type { Project } from "@/lib/firebase/types";

export const dynamic = "force-dynamic";

/** GET /api/admin/projects — fetches every real project from Firebase Firestore. */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const snap = await adminDb().collection("projects").get();
    const projects: Project[] = snap.docs.map((d) => {
      const raw = normalizeDates(d.data() as Record<string, any>, [
        "createdAt",
        "updatedAt",
        "publishedDate",
        "reviewedAt",
      ]);
      return {
        ...raw,
        id: str(raw.id) || d.id,
        title: str(raw.title, "Untitled project"),
        status: raw.status || "Draft",
        category: raw.category || "Others",
        description: str(raw.description),
        image: str(raw.image),
        tags: Array.isArray(raw.tags)
          ? raw.tags.map((t: unknown) => str(t)).filter(Boolean)
          : [],
        views: Number(raw.views) || 0,
        author: raw.author || { name: "Unknown", avatar: "", role: "", college: "" },
        reviewHistory: Array.isArray(raw.reviewHistory)
          ? raw.reviewHistory.map((h: any) => ({ ...h, at: toIso(h?.at) || "" }))
          : [],
      } as Project;
    });

    projects.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return NextResponse.json({ projects });
  } catch (err) {
    console.error("[admin] Firestore projects query failed:", err);
    return dbError(err);
  }
}
