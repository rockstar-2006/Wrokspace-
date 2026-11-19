import { FIREBASE_AUTH_ENDPOINTS, firebaseConfig } from "./config";
import { AuthUser, StudentProfile, UserRole } from "./types";
import { createEmptyStudentProfile, generateStudentCode } from "../data/mockData";
import { FirestoreService } from "./firestoreService";

const AUTH_STORAGE_KEY = "projecthub_auth_user";
const PROFILE_STORAGE_KEY = "projecthub_student_profile";
const REGISTRY_STORAGE_KEY = "projecthub_accounts_registry";

/** Thrown when the Host's portal policy blocks a sign-in (suspended account / disallowed domain). */
export class AccessDeniedError extends Error {
  code: string;
  constructor(code: "projecthub/suspended" | "projecthub/domain-not-allowed", message: string) {
    super(message);
    this.code = code;
  }
}

export class AuthService {
  /** True while an explicit sign-in is running, so the auth-state listener doesn't race it. */
  static signingIn = false;

  /** Public portal policy set by the Host in the admin console. Fails open if the API is unreachable. */
  static async getPortalPolicy(): Promise<{ allowedEmailDomains: string[] }> {
    if (typeof window === "undefined") return { allowedEmailDomains: [] };
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (!res.ok) return { allowedEmailDomains: [] };
      const json = await res.json();
      return { allowedEmailDomains: Array.isArray(json?.allowedEmailDomains) ? json.allowedEmailDomains : [] };
    } catch {
      return { allowedEmailDomains: [] };
    }
  }

  static async assertDomainAllowed(email: string): Promise<void> {
    const { allowedEmailDomains } = await this.getPortalPolicy();
    if (!allowedEmailDomains.length) return;
    const domain = (email.split("@")[1] || "").toLowerCase();
    const ok = allowedEmailDomains.some((d) => domain === d || domain.endsWith(`.${d}`));
    if (!ok) {
      throw new AccessDeniedError(
        "projecthub/domain-not-allowed",
        `Sign-in is limited to ${allowedEmailDomains.map((d) => "@" + d).join(", ")} accounts. Please use your institution email.`
      );
    }
  }

  static assertNotSuspended(profile?: Partial<StudentProfile> | null): void {
    if (profile?.accountStatus === "suspended") {
      throw new AccessDeniedError(
        "projecthub/suspended",
        `This account has been suspended by the portal administrator${
          profile.suspendedReason ? `: ${profile.suspendedReason}` : "."
        }`
      );
    }
  }

  /**
   * Get registry of all registered accounts for account isolation
   */
  static getRegistry(): Record<string, { user: AuthUser; profile: StudentProfile }> {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(REGISTRY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /**
   * Save accounts registry
   */
  static saveRegistry(registry: Record<string, { user: AuthUser; profile: StudentProfile }>): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(registry));
    } catch (e) {
      console.error("Failed to save accounts registry:", e);
    }
  }

  /**
   * Get list of saved Google accounts from registry for the Google account chooser
   */
  static getSavedGoogleAccounts(): Array<{
    email: string;
    displayName: string;
    photoURL?: string;
    profileCompleted: boolean;
    studentCode?: string;
  }> {
    const registry = this.getRegistry();
    const list: Array<{
      email: string;
      displayName: string;
      photoURL?: string;
      profileCompleted: boolean;
      studentCode?: string;
    }> = [];

    Object.values(registry).forEach((entry: any) => {
      if (entry && entry.user && entry.user.email && entry.user.email.includes("@")) {
        list.push({
          email: entry.user.email,
          displayName: entry.user.displayName || entry.user.email.split("@")[0],
          photoURL: entry.user.photoURL || entry.profile?.photoURL,
          profileCompleted: Boolean(entry.profile?.profileCompleted),
          studentCode: entry.profile?.studentCode,
        });
      }
    });

    if (list.length === 0) {
      list.push(
        {
          email: "bhushan.poojary@sode-edu.in",
          displayName: "Bhushan Poojary",
          photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          profileCompleted: true,
          studentCode: "PH-2026-BHU1",
        },
        {
          email: "student@sode-edu.in",
          displayName: "Student Innovator",
          photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=student_innovator",
          profileCompleted: false,
          studentCode: "PH-2026-STU1",
        }
      );
    }

    return list;
  }

  /**
   * Search registered student profile by unique Student UID Code (e.g. PH-2026-XXXX)
   * Supports exact, suffix, and normalized matches, plus verified mock peer profiles for testing
   */
  static findStudentByCode(code: string): StudentProfile | null {
    if (typeof window === "undefined") return null;
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return null;

    const normalizedInput = cleanCode.replace(/[^A-Z0-9]/g, "");

    const registry = this.getRegistry();
    for (const key of Object.keys(registry)) {
      const entry = registry[key];
      const p = entry?.profile;
      if (p?.studentCode) {
        const norm = p.studentCode.replace(/[^A-Z0-9]/g, "").toUpperCase();
        if (norm === normalizedInput || p.studentCode.toUpperCase() === cleanCode || norm.endsWith(normalizedInput)) {
          return p;
        }
      }
    }

    // Scan any isolated profiles stored in localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("projecthub_profile_")) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const p: StudentProfile = JSON.parse(raw);
            if (p.studentCode) {
              const norm = p.studentCode.replace(/[^A-Z0-9]/g, "").toUpperCase();
              if (norm === normalizedInput || p.studentCode.toUpperCase() === cleanCode || norm.endsWith(normalizedInput)) {
                return p;
              }
            }
          }
        }
      }
    } catch {}

    // Check active profile
    const active = this.getStoredProfile();
    if (active.studentCode) {
      const norm = active.studentCode.replace(/[^A-Z0-9]/g, "").toUpperCase();
      if (norm === normalizedInput || active.studentCode.toUpperCase() === cleanCode || norm.endsWith(normalizedInput)) {
        return active;
      }
    }

    // Verified Demo Peer Students for smooth cross-student team collaboration testing
    const demoStudents: StudentProfile[] = [
      {
        uid: "demo-stu-1",
        studentCode: "PH-2026-DEMO",
        fullName: "Pratik Shetty",
        email: "pratik.shetty@college.edu",
        phoneNumber: "",
        countryCode: "+91",
        dateOfBirth: "",
        gender: "",
        college: "Shri Madhwa Vadiraja Institute of Technology & Management",
        department: "Computer Science & Engineering",
        branch: "CSE",
        year: "Final Year",
        usn: "4MV22CS089",
        photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        skills: ["React", "Node.js", "TypeScript"],
        bio: "Full-stack developer interested in scalable cloud systems.",
        role: "student",
        projectsCount: 2,
        publicationsCount: 1,
        followersCount: 8,
        profileCompleted: true,
      },
      {
        uid: "demo-stu-2",
        studentCode: "PH-2026-ROBO",
        fullName: "Sanjana Rao",
        email: "sanjana.rao@college.edu",
        phoneNumber: "",
        countryCode: "+91",
        dateOfBirth: "",
        gender: "",
        college: "Shri Madhwa Vadiraja Institute of Technology & Management",
        department: "Artificial Intelligence & Data Science",
        branch: "AI & DS",
        year: "3rd Year",
        usn: "4MV23AI045",
        photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        skills: ["Python", "TensorFlow", "Computer Vision"],
        bio: "AI researcher focusing on deep learning and medical imaging.",
        role: "student",
        projectsCount: 4,
        publicationsCount: 2,
        followersCount: 15,
        profileCompleted: true,
      },
      {
        uid: "demo-stu-3",
        studentCode: "PH-2026-IOT1",
        fullName: "Arjun Hegde",
        email: "arjun.hegde@college.edu",
        phoneNumber: "",
        countryCode: "+91",
        dateOfBirth: "",
        gender: "",
        college: "Shri Madhwa Vadiraja Institute of Technology & Management",
        department: "Electronics & Communication Engineering",
        branch: "ECE",
        year: "Final Year",
        usn: "4MV22EC012",
        photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        skills: ["Arduino", "ESP32", "Embedded C"],
        bio: "Hardware enthusiast working on smart agricultural telemetry.",
        role: "student",
        projectsCount: 3,
        publicationsCount: 0,
        followersCount: 6,
        profileCompleted: true,
      },
    ];

    for (const demo of demoStudents) {
      if (!demo.studentCode) continue;
      const norm = demo.studentCode.replace(/[^A-Z0-9]/g, "").toUpperCase();
      if (norm === normalizedInput || demo.studentCode.toUpperCase() === cleanCode || norm.endsWith(normalizedInput)) {
        return demo;
      }
    }

    return null;
  }

  /**
   * Asynchronous student lookup across local storage and live Firestore database
   */
  static async findStudentAsync(code: string): Promise<StudentProfile | null> {
    const local = this.findStudentByCode(code);
    if (local) return local;
    return FirestoreService.findStudent(code);
  }

  /**
   * Get currently persisted user from local storage
   */
  static getStoredUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      const parsed: AuthUser = JSON.parse(data);
      if (parsed.email === "student.google@projecthub.edu" || parsed.displayName === "Student User") {
        parsed.email = "";
        parsed.displayName = "";
        parsed.photoURL = "";
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Get isolated student profile by UID or active session
   */
  static getStoredProfile(uid?: string): StudentProfile {
    if (typeof window === "undefined") return createEmptyStudentProfile();
    try {
      const targetUid = uid || this.getStoredUser()?.uid;
      if (targetUid) {
        const isolated = localStorage.getItem(`projecthub_profile_${targetUid}`);
        if (isolated) {
          const parsed: StudentProfile = JSON.parse(isolated);
          if (parsed.email === "student.google@projecthub.edu" || parsed.fullName === "Student User") {
            parsed.email = "";
            parsed.fullName = "";
            parsed.photoURL = "";
          }
          return parsed;
        }
      }

      const data = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!data) return createEmptyStudentProfile();
      const parsed: StudentProfile = JSON.parse(data);
      if (parsed.email === "student.google@projecthub.edu" || parsed.fullName === "Student User") {
        parsed.email = "";
        parsed.fullName = "";
        parsed.photoURL = "";
      }
      return parsed;
    } catch {
      return createEmptyStudentProfile();
    }
  }

  /**
   * Save user session with full account isolation
   */
  static saveSession(user: AuthUser, profile?: Partial<StudentProfile>): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

      const currentProfile = this.getStoredProfile(user.uid);
      const merged: StudentProfile = {
        ...currentProfile,
        ...(profile || {}),
        uid: user.uid,
        email: user.email || currentProfile.email,
        studentCode:
          (profile && profile.studentCode) ||
          currentProfile.studentCode ||
          generateStudentCode(),
      };

      // 1. Save active profile pointer
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(merged));
      // 2. Save isolated profile for this user's UID
      localStorage.setItem(`projecthub_profile_${user.uid}`, JSON.stringify(merged));

      // 3. Update account in Registry
      const registry = this.getRegistry();
      const accountKey = (user.email || user.uid).toLowerCase();
      registry[accountKey] = {
        user,
        profile: merged,
      };
      this.saveRegistry(registry);
    } catch (err) {
      console.error("Failed to save auth session:", err);
    }
  }

  /**
   * Clear session — removes active auth + profile keys.
   * The per-user isolated profile key is intentionally kept so returning users
   * can have their profile restored from Firestore on next login.
   */
  static clearSession(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear auth session:", err);
    }
  }

  /**
   * Turns an email or USN into the Firebase sign-in email.
   * USNs use a synthetic address so they can have a real password.
   */
  static identifierToEmail(identifier: string): { email: string; isEmail: boolean } {
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes("@");
    return {
      isEmail,
      email: isEmail
        ? trimmed.toLowerCase()
        : `${trimmed.toLowerCase().replace(/[^a-z0-9]/g, "")}@student.college.edu`,
    };
  }

  /**
   * Sign in with Email or Register Number (USN) + password — real Firebase Authentication.
   * First-time users are registered automatically (same "sign in to create" UX as before).
   */
  static async signIn(
    identifier: string,
    password: string,
    role: UserRole = "student"
  ): Promise<{ user: AuthUser; profile: StudentProfile; isNewUser: boolean }> {
    this.signingIn = true;
    try {
      return await this.signInInner(identifier, password, role);
    } finally {
      this.signingIn = false;
    }
  }

  private static async signInInner(
    identifier: string,
    password: string,
    role: UserRole
  ): Promise<{ user: AuthUser; profile: StudentProfile; isNewUser: boolean }> {
    const trimmedId = identifier.trim();
    const { email, isEmail } = this.identifierToEmail(trimmedId);
    if (isEmail) await this.assertDomainAllowed(email);

    const {
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      updateProfile: updateFbProfile,
    } = await import("firebase/auth");
    const { auth } = await import("./config");

    let fbUser;
    try {
      fbUser = (await signInWithEmailAndPassword(auth, email, password)).user;
    } catch (err: any) {
      const code = err?.code || "";
      // With email-enumeration protection Firebase can't tell "no account" from "wrong password",
      // so try to register; "email already in use" then means the password was wrong.
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/invalid-login-credentials") {
        try {
          fbUser = (await createUserWithEmailAndPassword(auth, email, password)).user;
          const displayName = isEmail ? trimmedId.split("@")[0] : trimmedId.toUpperCase();
          await updateFbProfile(fbUser, { displayName }).catch(() => {});
        } catch (createErr: any) {
          if (createErr?.code === "auth/email-already-in-use") {
            const e: any = new Error(
              "Incorrect password. If you created this account with Google, use “Continue with Google” instead."
            );
            e.code = "auth/wrong-password";
            throw e;
          }
          throw createErr;
        }
      } else {
        throw err;
      }
    }

    return this.completeFirebaseSignIn(fbUser, role, {
      registerNumber: !isEmail ? trimmedId.toUpperCase() : undefined,
    });
  }

  /** Moves a pre-lockdown profile (stored under a made-up id) onto this real Firebase account. */
  static async claimLegacyAccount(fbUser: { getIdToken: () => Promise<string> }): Promise<StudentProfile | null> {
    try {
      const token = await fbUser.getIdToken();
      const res = await fetch("/api/account/claim-legacy", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 503) {
        console.warn("[auth] Legacy account upgrade unavailable: Firebase Admin SDK not configured on the server.");
        return null;
      }
      if (!res.ok) return null;
      const json = await res.json();
      return json?.status === "migrated" ? (json.profile as StudentProfile) : null;
    } catch {
      return null;
    }
  }

  /**
   * Shared tail of every sign-in method: the Firebase user's uid IS the profile id
   * (users/{uid}), which is what the Firestore security rules check.
   */
  static async completeFirebaseSignIn(
    fbUser: {
      uid: string;
      email: string | null;
      displayName: string | null;
      photoURL: string | null;
      getIdToken: () => Promise<string>;
    },
    role: UserRole = "student",
    extras: { registerNumber?: string } = {}
  ): Promise<{ user: AuthUser; profile: StudentProfile; isNewUser: boolean }> {
    const uid = fbUser.uid;
    const email = (fbUser.email || "").toLowerCase();
    if (!email) throw new Error("No email returned for this account.");
    await this.assertDomainAllowed(email);

    let { profile } = await FirestoreService.getUserProfile(uid);
    if (!profile || !profile.profileCompleted) {
      const claimed = await this.claimLegacyAccount(fbUser);
      if (claimed) profile = claimed;
    }

    try {
      this.assertNotSuspended(profile);
    } catch (e) {
      const { signOut } = await import("firebase/auth");
      const { auth } = await import("./config");
      await signOut(auth).catch(() => {});
      throw e;
    }

    // Keep the user's most recent local avatar choices (e.g. mascot) if any
    const local = typeof window !== "undefined" ? this.getStoredProfile(uid) : null;
    const localPhoto = local?.uid === uid ? local.photoURL : "";
    const localRing = local?.uid === uid ? local.avatarRingStyle : undefined;

    let isNew = false;
    if (!profile) {
      isNew = true;
      const displayName = fbUser.displayName || email.split("@")[0];
      profile = createEmptyStudentProfile(uid, email, displayName, role);
      profile.photoURL = localPhoto || fbUser.photoURL || "";
      profile.avatarRingStyle = localRing || "instagram";
      profile.studentCode = generateStudentCode();
      if (extras.registerNumber) profile.usn = extras.registerNumber;
      const saved = await FirestoreService.saveUserProfile(profile, { create: true });
      if (!saved) {
        throw new Error("Your account was created, but its profile could not be saved. Please try again.");
      }
    } else {
      profile = {
        ...profile,
        uid,
        photoURL: localPhoto || profile.photoURL || fbUser.photoURL || "",
        avatarRingStyle: localRing || profile.avatarRingStyle || "instagram",
        studentCode: profile.studentCode || generateStudentCode(),
      };
    }

    const user: AuthUser = {
      uid,
      email,
      displayName: profile.fullName || fbUser.displayName || email.split("@")[0],
      role: profile.role || role,
      photoURL: profile.photoURL,
      registerNumber: extras.registerNumber,
    };
    this.saveSession(user, profile);
    return { user, profile, isNewUser: isNew || !profile.profileCompleted };
  }

  /**
   * Real Production Google OAuth 2.0 Sign-In via Firebase Auth SDK.
   * Strategy:
   *   1. Try signInWithPopup (best UX — instant, no page reload)
   *   2. If popup is blocked or unavailable, fall back to signInWithRedirect
   *      (redirect stores a pending-role key in sessionStorage so AuthContext
   *       can pick up the result after the page reloads back from Google)
   */
  static async signInWithRealGoogle(
    role: UserRole = "student"
  ): Promise<{ user: AuthUser; profile: StudentProfile; isNewUser: boolean }> {
    const { signInWithPopup, signInWithRedirect, GoogleAuthProvider } = await import("firebase/auth");
    const { auth } = await import("./config");

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    provider.addScope("email");
    provider.addScope("profile");

    this.signingIn = true;
    try {
      const result = await signInWithPopup(auth, provider);
      if (!result.user?.email) {
        throw new Error("No email returned from Google account.");
      }
      return this.completeFirebaseSignIn(result.user, role);
    } catch (popupErr: any) {
      if (popupErr?.code === "auth/popup-closed-by-user" || popupErr?.code === "auth/cancelled-popup-request") {
        throw popupErr;
      }
      if (
        popupErr?.code === "auth/popup-blocked" ||
        popupErr?.code === "auth/unauthorized-domain" ||
        popupErr?.code === "auth/operation-not-supported-in-this-environment"
      ) {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem("projecthub_google_redirect_role", role);
          sessionStorage.setItem("projecthub_google_redirect_pending", "true");
        }
        await signInWithRedirect(auth, provider);
        throw new Error("Redirecting to Google…");
      }
      throw popupErr;
    } finally {
      this.signingIn = false;
    }
  }

  /**
   * Complete a pending signInWithRedirect — call this on page load.
   * Returns null if there is no pending redirect result.
   */
  static async completeGoogleRedirect(): Promise<{
    user: AuthUser;
    profile: StudentProfile;
    isNewUser: boolean;
  } | null> {
    if (typeof window === "undefined") return null;
    const pending = sessionStorage.getItem("projecthub_google_redirect_pending");
    if (!pending) return null;

    try {
      const { getRedirectResult } = await import("firebase/auth");
      const { auth } = await import("./config");
      const result = await getRedirectResult(auth);
      sessionStorage.removeItem("projecthub_google_redirect_pending");
      const storedRole = (sessionStorage.getItem("projecthub_google_redirect_role") as UserRole) || "student";
      sessionStorage.removeItem("projecthub_google_redirect_role");
      if (!result?.user?.email) return null;
      return this.completeFirebaseSignIn(result.user, storedRole);
    } catch (err) {
      sessionStorage.removeItem("projecthub_google_redirect_pending");
      sessionStorage.removeItem("projecthub_google_redirect_role");
      console.error("getRedirectResult failed:", err);
      return null;
    }
  }

  /**
   * Alias kept for backward compatibility — delegates to signInWithRealGoogle.
   */
  static async signInWithGoogle(
    role: UserRole = "student"
  ): Promise<{ user: AuthUser; profile: StudentProfile; isNewUser: boolean }> {
    return this.signInWithRealGoogle(role);
  }

  /**
   * Send Password Reset Email via Firebase
   */
  static async sendPasswordReset(email: string): Promise<boolean> {
    try {
      const response = await fetch(FIREBASE_AUTH_ENDPOINTS.sendOobCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "PASSWORD_RESET",
          email,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Update and persist Student Profile in Firestore and isolated local storage
   */
  static async updateProfile(
    profileData: Partial<StudentProfile>
  ): Promise<StudentProfile> {
    const currentUser = this.getStoredUser();
    const uid = profileData.uid || currentUser?.uid;
    const current = this.getStoredProfile(uid);

    const updated: StudentProfile = {
      ...current,
      ...profileData,
      uid: uid || current.uid,
      studentCode:
        current.studentCode ||
        profileData.studentCode ||
        generateStudentCode(),
      profileCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        // 1. Synchronously save to local storage active & isolated caches
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));

        if (updated.uid) {
          localStorage.setItem(`projecthub_profile_${updated.uid}`, JSON.stringify(updated));
          // Clear temporary in-progress draft since changes are now finalized
          FirestoreService.clearDraft(updated.uid);
        }

        // 2. Update Registry
        const registry = this.getRegistry();
        const accountKey = (updated.email || updated.uid).toLowerCase();
        const user: AuthUser = currentUser
          ? {
              ...currentUser,
              displayName: updated.fullName || currentUser.displayName,
              photoURL: updated.photoURL || currentUser.photoURL || "",
            }
          : {
              uid: updated.uid,
              email: updated.email,
              displayName: updated.fullName,
              role: updated.role,
              photoURL: updated.photoURL || "",
            };
        this.saveSession(user, updated);
        registry[accountKey] = { user, profile: updated };
        this.saveRegistry(registry);

      } catch (err) {
        console.error("Failed to cache profile locally:", err);
      }

      // 3. Save to Firestore — surface failures (e.g. signed-out or suspended) instead of pretending it worked
      const saved = await FirestoreService.saveUserProfile(updated);
      if (!saved) {
        throw new Error("Your profile couldn't be saved to the server. Please sign in again and retry.");
      }
    }

    return updated;
  }
}
