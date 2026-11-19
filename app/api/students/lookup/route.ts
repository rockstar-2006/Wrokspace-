import { NextRequest, NextResponse } from "next/server";
import { adminDb, AdminNotConfiguredError, verifyBearer } from "@/lib/admin/firebaseAdmin";
import type { StudentProfile } from "@/lib/firebase/types";

export const dynamic = "force-dynamic";

/** Only what a teammate needs to see — never phone, DOB, gender, or account status. */
function publicCard(p: StudentProfile) {
  return {
    uid: p.uid,
    fullName: p.fullName || "",
    email: p.email || "",
    studentCode: p.studentCode || "",
    usn: p.usn || "",
    college: p.college || "",
    department: p.department || "",
    branch: p.branch || "",
    year: p.year || "",
    photoURL: p.photoURL || "",
    role: p.role || "student",
    profileCompleted: Boolean(p.profileCompleted),
  };
}

/**
 * GET /api/students/lookup?q=PH-2026-XXXX | USN | email
 * Signed-in students only. Replaces the old client-side scan of the whole users collection,
 * which the locked-down rules no longer allow.
 */
export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyBearer(req);
    if (!decoded) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

    const q = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 80);
    if (!q) return NextResponse.json({ student: null });
    const upper = q.toUpperCase();
    const lower = q.toLowerCase();
    const norm = upper.replace(/[^A-Z0-9]/g, "");
    const users = adminDb().collection("users");

    const tryQuery = async (field: string, value: string) => {
      const s = await users.where(field, "==", value).limit(1).get();
      return s.empty ? null : (s.docs[0].data() as StudentProfile);
    };

    let found =
      (await tryQuery("studentCode", upper)) ||
      (await tryQuery("usn", upper)) ||
      (q.includes("@") ? await tryQuery("email", lower) : null);

    // Fallback: normalised / suffix match on student code or USN (small collection)
    if (!found && norm.length >= 4) {
      const all = await users.select("uid", "studentCode", "usn", "fullName", "email", "college", "department", "branch", "year", "photoURL", "role", "profileCompleted", "accountStatus").get();
      for (const d of all.docs) {
        const p = d.data() as StudentProfile;
        const code = (p.studentCode || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        const usn = (p.usn || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (code === norm || usn === norm || code.endsWith(norm)) {
          found = { ...p, uid: p.uid || d.id };
          break;
        }
      }
    }

    if (found && (found as StudentProfile).accountStatus === "suspended") found = null;
    return NextResponse.json({ student: found ? publicCard(found) : null });
  } catch (err) {
    if (err instanceof AdminNotConfiguredError) return NextResponse.json({ error: err.message }, { status: 503 });
    console.error("[students/lookup] failed:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
