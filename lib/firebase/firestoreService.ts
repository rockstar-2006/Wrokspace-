import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { StudentProfile, Project } from "./types";
import { generateStudentCode, FEATURED_PROJECTS, createEmptyStudentProfile } from "../data/mockData";

/** Fields only the Host console (Admin SDK) may set — security rules reject student writes to them. */
const PROTECTED_PROJECT_FIELDS = ["featured", "reviewNotes", "reviewedBy", "reviewedAt", "reviewHistory", "publishedDate"] as const;

export class FirestoreService {
  /**
   * Fetch a user profile from Firestore by UID or email.
   * If found, returns the profile and marks isExisting: true (Old User).
   * If not found, returns null and marks isExisting: false (New User).
   */
  static async getUserProfile(
    uid: string,
    email?: string
  ): Promise<{ profile: StudentProfile | null; isExisting: boolean }> {
    // Security rules only allow a signed-in user to read their OWN profile (users/{auth.uid}).
    // Old profiles stored under other ids are moved by /api/account/claim-legacy instead.
    void email;
    if (!uid) {
      return { profile: null, isExisting: false };
    }

    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) return { profile: null, isExisting: false };

    const data = docSnap.data() as StudentProfile;
    if (!Array.isArray(data.skills)) data.skills = [];
    if (!data.uid) data.uid = uid;
    // Ensure studentCode exists (best effort — e.g. a suspended account can't write)
    if (!data.studentCode) {
      data.studentCode = generateStudentCode();
      try {
        await setDoc(userDocRef, { studentCode: data.studentCode }, { merge: true });
      } catch { /* ignore */ }
    }
    return { profile: data, isExisting: true };
  }

  /**
   * Search registered student profile across Firestore 'users' collection and local caches
   * Searches by:
   * 1. studentCode (exact e.g. "PH-2026-WLRF", without hyphens "PH2026WLRF", or suffix "WLRF")
   * 2. USN (case-insensitive, e.g. "4MW21CS001")
   * 3. Email (e.g. "student@gmail.com")
   */
  static async findStudent(
    codeOrIdentifier: string
  ): Promise<StudentProfile | null> {
    if (!codeOrIdentifier) return null;
    const clean = codeOrIdentifier.trim();
    if (!clean) return null;

    const upper = clean.toUpperCase();
    const lower = clean.toLowerCase();
    const normalizedAlphanumeric = upper.replace(/[^A-Z0-9]/g, "");

    // 1. Check local storage first (instant if on same device or previously cached)
    if (typeof window !== "undefined") {
      try {
        const rawRegistry = localStorage.getItem("projecthub_accounts_registry");
        if (rawRegistry) {
          const registry = JSON.parse(rawRegistry);
          for (const key of Object.keys(registry)) {
            const p = registry[key]?.profile as StudentProfile;
            if (p) {
              const sCode = (p.studentCode || "").toUpperCase();
              const sNorm = sCode.replace(/[^A-Z0-9]/g, "");
              const uNorm = (p.usn || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
              if (
                sCode === upper ||
                sNorm === normalizedAlphanumeric ||
                (normalizedAlphanumeric.length >= 4 && sNorm.endsWith(normalizedAlphanumeric)) ||
                (uNorm && uNorm === normalizedAlphanumeric) ||
                (p.email && p.email.toLowerCase() === lower)
              ) {
                return p;
              }
            }
          }
        }

        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("projecthub_profile_")) {
            const raw = localStorage.getItem(k);
            if (raw) {
              const p: StudentProfile = JSON.parse(raw);
              if (p) {
                const sCode = (p.studentCode || "").toUpperCase();
                const sNorm = sCode.replace(/[^A-Z0-9]/g, "");
                const uNorm = (p.usn || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
                if (
                  sCode === upper ||
                  sNorm === normalizedAlphanumeric ||
                  (normalizedAlphanumeric.length >= 4 && sNorm.endsWith(normalizedAlphanumeric)) ||
                  (uNorm && uNorm === normalizedAlphanumeric) ||
                  (p.email && p.email.toLowerCase() === lower)
                ) {
                  return p;
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("LocalStorage student lookup check failed:", e);
      }
    }

    // 2. Ask the server (security rules don't let students read other students' profiles;
    //    the server returns only the public teammate card)
    try {
      const { auth } = await import("./config");
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        const res = await fetch(`/api/students/lookup?q=${encodeURIComponent(clean)}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.ok) {
          const { student } = await res.json();
          if (student) {
            return { ...createEmptyStudentProfile(student.uid, student.email, student.fullName, student.role), ...student } as StudentProfile;
          }
        }
      }
    } catch (err) {
      console.warn("Student lookup failed:", err);
    }

    return null;
  }

  /**
   * Save or update complete user profile in Firestore.
   */
  static async saveUserProfile(profile: StudentProfile, opts: { create?: boolean } = {}): Promise<boolean> {
    if (!profile.uid) return false;

    try {
      const userDocRef = doc(db, "users", profile.uid);
      const cleanData: Record<string, any> = {
        uid: profile.uid,
        fullName: profile.fullName || "",
        email: (profile.email || "").toLowerCase(),
        phoneNumber: profile.phoneNumber || "",
        countryCode: profile.countryCode || "+91",
        dateOfBirth: profile.dateOfBirth || "",
        college: profile.college || "",
        usn: profile.usn || "",
        department: profile.department || "",
        year: profile.year || "",
        branch: profile.branch || "",
        batch: profile.batch || "",
        gender: profile.gender || "",
        skills: profile.skills || [],
        bio: profile.bio || "",
        studentCode: profile.studentCode || generateStudentCode(),
        photoURL: profile.photoURL || "",
        projectsCount: profile.projectsCount || 0,
        publicationsCount: profile.publicationsCount || 0,
        followersCount: profile.followersCount || 0,
        profileCompleted: Boolean(profile.profileCompleted),
        updatedAt: new Date().toISOString(),
      };
      // `role` is chosen once at account creation; afterwards only the Host can change it
      if (opts.create) {
        cleanData.role = profile.role === "user" ? "user" : "student";
        cleanData.createdAt = new Date().toISOString();
      }

      await setDoc(userDocRef, cleanData, { merge: true });
      return true;
    } catch (err) {
      console.error("Failed to save profile to Firestore:", err);
      return false;
    }
  }

  /**
   * Save in-progress draft profile to avoid data loss on refresh
   */
  static saveDraft(uid: string, draft: Partial<StudentProfile>): void {
    if (typeof window === "undefined" || !uid) return;
    try {
      localStorage.setItem(`projecthub_draft_${uid}`, JSON.stringify(draft));
    } catch {}
  }

  /**
   * Retrieve in-progress draft profile
   */
  static getDraft(uid: string): Partial<StudentProfile> | null {
    if (typeof window === "undefined" || !uid) return null;
    try {
      const raw = localStorage.getItem(`projecthub_draft_${uid}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clear draft profile once saved
   */
  static clearDraft(uid: string): void {
    if (typeof window === "undefined" || !uid) return;
    try {
      localStorage.removeItem(`projecthub_draft_${uid}`);
    } catch {}
  }

  /**
   * Save project to Firestore and local storage
   */
  static async saveProject(project: Project): Promise<boolean> {
    if (!project.id) return false;
    try {
      const projRef = doc(db, "projects", project.id);
      const data: Record<string, any> = { ...project, updatedAt: new Date().toISOString() };
      // Review/curation fields belong to the Host; merge keeps their stored values
      PROTECTED_PROJECT_FIELDS.forEach((k) => delete data[k]);
      // Firestore rejects undefined values
      Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
      await setDoc(projRef, data, { merge: true });
      return true;
    } catch (err) {
      console.warn("Firestore saveProject failed or offline:", err);
      return false;
    }
  }

  /**
   * Fetch a project by its unique ID from Firestore, local storage, or mock data
   */
  static async getProjectById(id: string, uid?: string): Promise<Project | null> {
    if (!id) return null;

    // 1. Try Firestore first
    try {
      const projRef = doc(db, "projects", id);
      const snap = await getDoc(projRef);
      if (snap.exists()) {
        const data = snap.data() as Project;
        return { ...data, id: data.id || snap.id };
      }
    } catch (err) {
      console.warn("Firestore getProjectById fetch failed or offline:", err);
    }

    // 2. Try User Isolated & Global LocalStorage
    if (typeof window !== "undefined") {
      try {
        const userProjectsKey = uid ? `projecthub_projects_${uid}` : null;
        if (userProjectsKey) {
          const userStored = localStorage.getItem(userProjectsKey);
          if (userStored) {
            const list: Project[] = JSON.parse(userStored);
            const found = list.find((p) => p.id === id || p.slug === id);
            if (found) return found;
          }
        }

        // Global LocalStorage
        const globalStored = localStorage.getItem("projecthub_user_projects");
        if (globalStored) {
          const list: Project[] = JSON.parse(globalStored);
          const found = list.find((p) => p.id === id || p.slug === id);
          if (found) return found;
        }

        // Deep scan across all localStorage keys for this project ID
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("projecthub_projects_") || key.includes("projects"))) {
            const raw = localStorage.getItem(key);
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  const match = parsed.find((p: any) => p && (p.id === id || p.slug === id));
                  if (match) return match as Project;
                }
              } catch {}
            }
          }
        }
      } catch (err) {
        console.warn("LocalStorage getProjectById failed:", err);
      }
    }

    // 3. Fallback to mock FEATURED_PROJECTS
    const mock = FEATURED_PROJECTS.find((p) => p.id === id || p.slug === id);
    if (mock) return mock;

    return null;
  }

  /**
   * Delete a project permanently from Firestore and local storage caches
   */
  static async deleteProject(id: string, uid?: string): Promise<boolean> {
    if (!id) return false;
    let success = false;

    // 1. Delete from Firestore
    try {
      const projRef = doc(db, "projects", id);
      await deleteDoc(projRef);
      success = true;
    } catch (err) {
      console.warn("Firestore deleteDoc failed:", err);
    }

    // 2. Remove from LocalStorage caches
    if (typeof window !== "undefined") {
      try {
        // Remove from user-isolated key
        if (uid) {
          const userKey = `projecthub_projects_${uid}`;
          const userRaw = localStorage.getItem(userKey);
          if (userRaw) {
            const list: Project[] = JSON.parse(userRaw);
            const filtered = list.filter((p) => p.id !== id);
            localStorage.setItem(userKey, JSON.stringify(filtered));
          }
        }

        // Remove from global user projects key
        const globalRaw = localStorage.getItem("projecthub_user_projects");
        if (globalRaw) {
          const list: Project[] = JSON.parse(globalRaw);
          const filtered = list.filter((p) => p.id !== id);
          localStorage.setItem("projecthub_user_projects", JSON.stringify(filtered));
        }

        // Also check if stored under any other key
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("projecthub_projects_")) {
            const raw = localStorage.getItem(k);
            if (raw) {
              const list: Project[] = JSON.parse(raw);
              const filtered = list.filter((p) => p.id !== id);
              localStorage.setItem(k, JSON.stringify(filtered));
            }
          }
        }
        // success reflects the SERVER delete only (a rules denial must not look like success)
      } catch (err) {
        console.warn("LocalStorage delete project failed:", err);
      }
    }

    return success;
  }

  /**
   * Fetch all projects belonging to a specific user from Firestore and local storage
   */
  static async getUserProjects(uid: string): Promise<Project[]> {
    if (!uid) return [];

    const results: Project[] = [];

    // 1. Try Firestore first
    try {
      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("ownerId", "==", uid));
      const querySnap = await getDocs(q);
      querySnap.forEach((d) => {
        results.push(d.data() as Project);
      });
      if (results.length > 0) return results;
    } catch (err) {
      console.warn("Firestore getUserProjects failed or offline, falling back to local:", err);
    }

    // 2. Fall back to user-isolated local storage
    if (typeof window !== "undefined") {
      try {
        const userKey = `projecthub_projects_${uid}`;
        const raw = localStorage.getItem(userKey) || localStorage.getItem("projecthub_user_projects");
        if (raw) {
          const list: Project[] = JSON.parse(raw);
          return list.filter((p) => !p.ownerId || p.ownerId === uid);
        }
      } catch (err) {
        console.warn("LocalStorage getUserProjects failed:", err);
      }
    }

    return [];
  }

  /**
   * Fetch all visible projects for dashboard:
   * - All "Published" projects
   * - Plus any projects owned by the currently logged-in user (even if Pending review / Under Review / Draft)
   */
  static async getAllDashboardProjects(uid?: string): Promise<Project[]> {
    const list: Project[] = [];
    const map = new Map<string, Project>();

    try {
      const projectsRef = collection(db, "projects");

      // 1. Fetch published projects
      const publishedQuery = query(projectsRef, where("status", "==", "Published"));
      const publishedSnap = await getDocs(publishedQuery);
      publishedSnap.forEach((doc) => {
        const data = doc.data() as Project;
        map.set(data.id || doc.id, { ...data, id: data.id || doc.id });
      });

      // 2. Fetch projects owned by the active user (Pending review, Under review, Draft)
      if (uid) {
        const userProjectsQuery = query(projectsRef, where("ownerId", "==", uid));
        const userSnap = await getDocs(userProjectsQuery);
        userSnap.forEach((doc) => {
          const data = doc.data() as Project;
          map.set(data.id || doc.id, { ...data, id: data.id || doc.id });
        });
      }
    } catch (err) {
      console.warn("Failed to fetch dashboard projects from Firestore:", err);
    }

    return Array.from(map.values());
  }

  /**
   * Fetch all published projects from Firestore
   */
  static async getPublishedProjects(): Promise<Project[]> {
    try {
      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("status", "==", "Published"));
      const querySnap = await getDocs(q);
      const list: Project[] = [];
      querySnap.forEach((doc) => {
        list.push(doc.data() as Project);
      });
      return list;
    } catch (err) {
      console.warn("Failed to fetch published projects from Firestore:", err);
      return [];
    }
  }
}
