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
  loginWithGoogle: (
    role?: UserRole,
    account?: { email: string; displayName: string; photoURL?: string }
  ) => Promise<LoginResult>;
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

    const init = async () => {
      // 1. Restore from local cache immediately (zero-flicker)
      const storedUser = AuthService.getStoredUser();
      const storedProfile = AuthService.getStoredProfile();
      if (storedUser) {
        setUser(storedUser);
        setRoleState(storedUser.role);
      }
      if (storedProfile?.uid) {
        setProfile(storedProfile);
      }

      // 2. Check for a pending Google redirect result FIRST
      //    (happens when signInWithRedirect lands back on the page)
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
        // no redirect pending — safe to ignore
      }

      // 3. Check for active NextAuth Google OAuth session
      if (!storedUser && typeof window !== "undefined") {
        const isLoggedOut = sessionStorage.getItem("projecthub_user_logged_out") === "true";
        if (!isLoggedOut) {
          try {
            const { getSession } = await import("next-auth/react");
            const session = await getSession();
            if (session?.user?.email && !cancelled) {
              const email = session.user.email.toLowerCase();
              const displayName = session.user.name || email.split("@")[0];
              const photoURL = session.user.image || "";

              const result = await AuthService.signInWithGoogleAccount(
                { email, displayName, photoURL },
                "student"
              );
              if (!cancelled) {
                setUser(result.user);
                setProfile(result.profile);
                setRoleState(result.user.role);
                setIsLoading(false);
                return;
              }
            }
          } catch (e) {
            console.warn("NextAuth session check error:", e);
          }
        }
      }

      // 4. Background Firestore sync for existing session
      if (storedUser?.uid) {
        FirestoreService.getUserProfile(storedUser.uid, storedUser.email)
          .then(({ profile: remoteProfile, isExisting }) => {
            if (isExisting && remoteProfile && !cancelled) {
              setProfile(remoteProfile);
              AuthService.saveSession(storedUser, remoteProfile);
            }
          })
          .catch(() => {});
      }

      if (!cancelled) setIsLoading(false);
    };

    init();
    return () => { cancelled = true; };
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      AuthService.saveSession(updatedUser);
    }
  };

  const login = async (
    identifier: string,
    password: string,
    loginRole?: UserRole
  ): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const activeRole = loginRole || role;
      const result = await AuthService.signIn(identifier, password, activeRole);
      setUser(result.user);
      setProfile(result.profile);
      setRoleState(activeRole);
      return {
        success: true,
        isNewUser: result.isNewUser,
        profileCompleted: result.profile.profileCompleted,
      };
    } catch (err) {
      console.error("Login failed:", err);
      return { success: false, isNewUser: false, profileCompleted: false };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (
    googleRole?: UserRole,
    account?: { email: string; displayName: string; photoURL?: string }
  ): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const activeRole = googleRole || role;
      const result = account
        ? await AuthService.signInWithGoogleAccount(account, activeRole)
        : await AuthService.signInWithGoogle(activeRole);
      setUser(result.user);
      setProfile(result.profile);
      setRoleState(activeRole);
      return {
        success: true,
        isNewUser: result.isNewUser,
        profileCompleted: result.profile.profileCompleted,
      };
    } catch (err) {
      console.error("Google sign in failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithRealGoogle = async (googleRole?: UserRole): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const activeRole = googleRole || role;
      const result = await AuthService.signInWithRealGoogle(activeRole);
      setUser(result.user);
      setProfile(result.profile);
      setRoleState(activeRole);
      return {
        success: true,
        isNewUser: result.isNewUser,
        profileCompleted: result.profile.profileCompleted,
      };
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("projecthub_user_logged_out", "true");
    }
    try {
      const { signOut } = await import("next-auth/react");
      await signOut({ redirect: false });
    } catch { /* ignore */ }
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