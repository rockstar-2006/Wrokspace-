import { adminAuth } from "./firebaseAdmin";
import { isAdminEmail } from "./adminEmails";

/**
 * Is this account a Host? Uses the verified Firebase Auth email when the account has one,
 * because the `email` field in a student's profile document is editable by that student.
 */
export async function isHostAccount(uid: string, profileEmail?: string): Promise<boolean> {
  try {
    const rec = await adminAuth().getUser(uid);
    return isAdminEmail(rec.email);
  } catch (e: any) {
    // Legacy profile with no Firebase Auth user: fall back to the stored email
    if (e?.code === "auth/user-not-found") return isAdminEmail(profileEmail);
    throw e;
  }
}

/** uid → verified sign-in email for every Firebase Auth user (for list views). */
export async function authEmailsByUid(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let pageToken: string | undefined;
  do {
    const page = await adminAuth().listUsers(1000, pageToken);
    page.users.forEach((u) => u.email && map.set(u.uid, u.email.toLowerCase()));
    pageToken = page.pageToken;
  } while (pageToken);
  return map;
}
