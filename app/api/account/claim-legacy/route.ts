import { NextResponse } from "next/server";
import { adminAuth, adminDb, AdminNotConfiguredError, verifyBearer } from "@/lib/admin/firebaseAdmin";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { StudentProfile } from "@/lib/firebase/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/account/claim-legacy   (Authorization: Bearer <Firebase ID token>)
 *
 * Before the Firestore lock-down, profiles were stored under made-up ids
 * (email_…, usn_…, google_…) with no real sign-in behind them. When a student
 * signs in with a real Firebase account for the first time, this moves their old
 * profile to users/{realUid} and re-points their projects' ownerId.
 *
 * Runs with the Admin SDK because the student can't read or rewrite the old docs
 * under the new security rules.
 */
export async function POST(req: Request) {
  let decoded;
  try {
    decoded = await verifyBearer(req);
  } catch (err) {
    if (err instanceof AdminNotConfiguredError) return NextResponse.json({ status: "unavailable" }, { status: 503 });
    throw err;
  }
  if (!decoded) return NextResponse.json({ error: "Invalid or missing ID token" }, { status: 401 });

  const uid = decoded.uid;
  const email = (decoded.email || "").toLowerCase();
  const provider = decoded.firebase?.sign_in_provider;
  if (!email) return NextResponse.json({ status: "none" });
  // Google identities must be verified; password accounts are allowed because the
  // legacy login never had a password at all (claiming is logged for the Host to review).
  if (provider === "google.com" && !decoded.email_verified) return NextResponse.json({ status: "none" });

  try {
    const db = adminDb();
    const meRef = db.collection("users").doc(uid);
    const me = await meRef.get();
    const meData = me.exists ? (me.data() as StudentProfile) : null;
    // A real, completed profile already exists → nothing to claim
    if (meData?.profileCompleted) return NextResponse.json({ status: "exists" });

    // Only pre-lockdown ids can be claimed (real Firebase uids never use these prefixes,
    // so a student editing their own profile email can't make their doc "claimable").
    // Formats seen in the data: email_x_y_z, usn_xxx, google_x_y_z, google-xyz (older), google-<timestamp>
    const isLegacyId = (id: string) => /^(email|usn|google)_/.test(id) || /^google-/.test(id);
    const slug = email.replace(/[^a-z0-9]/g, "_");
    const candidateIds = new Set<string>([
      `email_${slug}`,
      `google_${slug}`,
      `google-${email.replace(/[^a-z0-9]/g, "")}`,
    ]);
    const [local, domain] = email.split("@");
    if (domain === "student.college.edu") candidateIds.add(`usn_${local}`); // USN logins used a synthetic email

    const [byEmail, ...byId] = await Promise.all([
      db.collection("users").where("email", "==", email).get(),
      ...Array.from(candidateIds).map((id) => db.collection("users").doc(id).get()),
    ]);
    const seen = new Set<string>();
    const legacy = [...byEmail.docs, ...byId.filter((d) => d.exists)].filter((d) => {
      if (d.id === uid || !isLegacyId(d.id) || seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    }) as QueryDocumentSnapshot[];
    if (!legacy.length) return NextResponse.json({ status: "none" });

    // Prefer the completed, most recently updated legacy profile
    const best = [...legacy].sort((a, b) => {
      const pa = (a.data() as StudentProfile).profileCompleted ? 1 : 0;
      const pb = (b.data() as StudentProfile).profileCompleted ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return String(b.data().updatedAt || "").localeCompare(String(a.data().updatedAt || ""));
    })[0];
    const legacyIds = legacy.map((d) => d.id);
    const now = new Date().toISOString();

    const profile: StudentProfile = {
      ...(best.data() as StudentProfile),
      uid,
      email,
      updatedAt: now,
    };

    const batch = db.batch();
    batch.set(meRef, { ...profile, migratedFrom: legacyIds, migratedAt: now });
    legacy.forEach((d) => batch.delete(d.ref));

    // Re-point projects (Firestore "in" supports up to 30 values)
    let movedProjects = 0;
    for (let i = 0; i < legacyIds.length; i += 30) {
      const owned = await db.collection("projects").where("ownerId", "in", legacyIds.slice(i, i + 30)).get();
      owned.docs.forEach((p) => {
        batch.update(p.ref, { ownerId: uid });
        movedProjects++;
      });
    }
    await batch.commit();

    if (profile.accountStatus === "suspended") {
      await adminAuth().updateUser(uid, { disabled: true }).catch(() => {});
    }

    await db.collection("auditLogs").add({
      action: "account.claim_legacy",
      targetType: "user",
      targetId: uid,
      targetLabel: profile.fullName || email,
      actorEmail: email,
      actorName: `${profile.fullName || email} (self, via ${provider || "sign-in"})`,
      note: `Moved legacy profile ${legacyIds.join(", ")} and ${movedProjects} project(s) to the new sign-in account.`,
      createdAt: now,
    });

    return NextResponse.json({ status: "migrated", profile, movedProjects });
  } catch (err) {
    if (err instanceof AdminNotConfiguredError) return NextResponse.json({ status: "unavailable" }, { status: 503 });
    console.error("[claim-legacy] failed:", err);
    return NextResponse.json({ error: "Account upgrade failed" }, { status: 500 });
  }
}
