"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, StudentProfile, UserRole } from "../firebase/types";
import { AuthService } from "../firebase/authService";
import { FirestoreService } from "../firebase/firestoreService";
import { createEmptyStudentProfile } from "../data/mockData";

export interface LoginResult {
  success: boolean;
  isNewUser: boolean;
  profileCompleted: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: StudentProfile;
  role: UserRole;
  isLoading: boolean;
  setRole: (role: UserRole) => void;
  login: (identifier: string, password: string, role?: UserRole) => Promise<LoginResult>;
  loginWithGoogle: (role?: UserRole) => Promise<LoginResult>;
  loginWithRealGoogle: (role?: UserRole) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<StudentProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile>(createEmptyStudentProfile());
  const [role, setRoleState] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const endSession = () => {
      AuthService.clearSession();
      setUser(null);
      setProfile(createEmptyStudentProfile());
    };

    const init = async () => {
      // 1. Restore from local cache immediately (zero-flicker UI), but stay "loading"
      //    until Firebase Auth confirms the session — Firestore rules need a real token.
      const storedUser = AuthService.getStoredUser();
      const storedProfile = AuthService.getStoredProfile();
      if (storedUser) {
        setUser(storedUser);
        setRoleState(storedUser.role);
      }
      if (storedProfile?.uid) setProfile(storedProfile);

      // 2. A pending Google redirect result (signInWithRedirect landing back here)
      try {
        const redirectResult = await AuthService.completeGoogleRedirect();
        if (redirectResult && !cancelled) {
          setUser(redirectResult.user);
          setProfile(redirectResult.profile);
          setRoleState(redirectResult.user.role);
          setIsLoading(false);
          return;
        }
      } catch {
        /* no redirect pending */
      }

      // 3. Reconcile the cached session with the real Firebase Auth session
      const { onAuthStateChanged } = await import("firebase/auth");
      const { auth } = await import("../firebase/config");
      let first = true;
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (cancelled || AuthService.signingIn) return;
        const cached = AuthService.getStoredUser();
        try {
          if (!fbUser) {
            // Signed out, token revoked/disabled by the Host, or a pre-lockdown
            // localStorage-only session → it can no longer read or write data.
            if (cached) endSession();
          } else if (!cached || cached.uid !== fbUser.uid) {
            // Firebase has a session the app hasn't adopted yet (or a legacy cached uid)
            const result = await AuthService.completeFirebaseSignIn(fbUser, cached?.role || "student");
            if (!cancelled) {
              setUser(result.user);
              setProfile(result.profile);
              setRoleState(result.user.role);
            }
          } else {
            // Same user: refresh the profile from Firestore (picks up Host changes)
            const { profile: remote, isExisting } = await FirestoreService.getUserProfile(fbUser.uid);
            if (cancelled) return;
            if (isExisting && remote?.accountStatus === "suspended") {
              const { signOut } = await import("firebase/auth");
              await signOut(auth).catch(() => {});
              endSession();
              if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/admin")) {
                window.location.href = "/login?error=suspended";
              }
            } else if (isExisting && remote) {
              const merged = { ...remote, uid: fbUser.uid };
              setProfile(merged);
              const updatedUser = { ...cached, role: remote.role || cached.role };
              setUser(updatedUser);
              setRoleState(updatedUser.role);
              AuthService.saveSession(updatedUser, merged);
            }
          }
        } catch (err: any) {
          console.warn("Session restore failed:", err);
          if (String(err?.code || "").startsWith("projecthub/")) endSession();
        } finally {
          if (first && !cancelled) {
            first = false;
            setIsLoading(false);
          }
        }
      });
    };

    init();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const setRole = (newRole: UserRole) => {
    // Only affects the role picked for a brand-new account; an existing account's
    // role is stored in Firestore and can only be changed by the Host.
    setRoleState(newRole);
  };

  const applyResult = (result: { user: AuthUser; profile: StudentProfile; isNewUser: boolean }): LoginResult => {
    setUser(result.user);
    setProfile(result.profile);
    setRoleState(result.user.role);
    if (typeof window !== "undefined") sessionStorage.removeItem("projecthub_user_logged_out");
    return {
      success: true,
      isNewUser: result.isNewUser,
      profileCompleted: result.profile.profileCompleted,
    };
  };

  /** Email / USN + password. Throws with a Firebase/portal error code on failure. */
  const login = async (identifier: string, password: string, loginRole?: UserRole): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      return applyResult(await AuthService.signIn(identifier, password, loginRole || role));
    } finally {
      setIsLoading(false);
    }
  };

  /** Kept for compatibility: always real Google OAuth (the old "pick a saved account" path is gone). */
  const loginWithGoogle = async (googleRole?: UserRole): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      return applyResult(await AuthService.signInWithGoogle(googleRole || role));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithRealGoogle = async (googleRole?: UserRole): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      return applyResult(await AuthService.signInWithRealGoogle(googleRole || role));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("projecthub_user_logged_out", "true");
    }
    // Sign out of Firebase Auth SDK too so redirect state is cleared
    try {
      const { signOut } = await import("firebase/auth");
      const { auth } = await import("../firebase/config");
      await signOut(auth);
    } catch { /* ignore */ }
    AuthService.clearSession();
    setUser(null);
    setProfile(createEmptyStudentProfile());
  };

  const updateProfile = async (data: Partial<StudentProfile>): Promise<boolean> => {
    try {
      const updated = await AuthService.updateProfile(data);
      setProfile(updated);
      if (user) {
        setUser((prev) =>
          prev ? { ...prev, displayName: updated.fullName, photoURL: updated.photoURL } : null
        );
      }
      return true;
    } catch (err) {
      console.error("Failed to update profile:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        setRole,
        login,
        loginWithGoogle,
        loginWithRealGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}