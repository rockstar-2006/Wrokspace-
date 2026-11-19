"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Project } from "@/lib/firebase/types";
import type { PortalSettings } from "@/lib/admin/types";
import { normalizeSettings } from "@/lib/admin/types";
import { adminApi, AdminUser } from "@/lib/admin/client";

export interface AdminIdentityClient {
  email: string;
  name: string;
  image?: string;
}

interface AdminData {
  admin: AdminIdentityClient;
  projects: Project[];
  users: AdminUser[];
  settings: PortalSettings;
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastLoadedAt: number | null;
  reload: (force?: boolean) => Promise<void>;
  upsertProject: (p: Project) => void;
  removeProjects: (ids: string[]) => void;
  upsertUser: (u: AdminUser) => void;
  removeUser: (uid: string) => void;
  setSettings: (s: PortalSettings) => void;
}

const Ctx = createContext<AdminData | null>(null);

const CACHE_KEY = "projecthub_admin_cache_v2";

interface CachedPayload {
  projects: Project[];
  users: AdminUser[];
  settings: PortalSettings;
  timestamp: number;
}

function readCache(): CachedPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.projects) && Array.isArray(parsed.users)) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(data: CachedPayload) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("[admin-cache] write error:", e);
  }
}

/**
 * Caches admin registry in memory and sessionStorage.
 * Re-uses cached data across page transitions; only makes network calls when the
 * user explicitly clicks the "Refresh" button or on initial first-time load.
 */
export function AdminDataProvider({ admin, children }: { admin: AdminIdentityClient; children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [settings, setSettingsState] = useState<PortalSettings>(normalizeSettings(null));
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<number | null>(null);

  const reload = useCallback(async (force = true) => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin/login")) {
      setLoading(false);
      return;
    }

    if (force) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [p, u, s] = await Promise.all([adminApi.projects(), adminApi.users(), adminApi.settings()]);
      const now = Date.now();
      setProjects(p.projects);
      setUsers(u.users);
      setSettingsState(s.settings);
      setLastLoadedAt(now);
      writeCache({ projects: p.projects, users: u.users, settings: s.settings, timestamp: now });
    } catch (e: any) {
      setError(e?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load: check cache first so we do NOT fetch again and again on every visit
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin/login")) {
      setLoading(false);
      return;
    }

    const cached = readCache();
    if (cached) {
      setProjects(cached.projects);
      setUsers(cached.users);
      setSettingsState(cached.settings);
      setLastLoadedAt(cached.timestamp);
      setLoading(false);
    } else {
      // First time without cache: fetch once
      reload(false);
    }
  }, [reload]);

  const upsertProject = useCallback((p: Project) => {
    setProjects((list) => {
      const i = list.findIndex((x) => x.id === p.id);
      const next = i === -1 ? [p, ...list] : list.map((x) => (x.id === p.id ? p : x));
      setUsers((uList) => {
        setSettingsState((currSettings) => {
          writeCache({ projects: next, users: uList, settings: currSettings, timestamp: Date.now() });
          return currSettings;
        });
        return uList;
      });
      return next;
    });
  }, []);

  const removeProjects = useCallback((ids: string[]) => {
    setProjects((list) => {
      const next = list.filter((p) => !ids.includes(p.id));
      setUsers((uList) => {
        setSettingsState((currSettings) => {
          writeCache({ projects: next, users: uList, settings: currSettings, timestamp: Date.now() });
          return currSettings;
        });
        return uList;
      });
      return next;
    });
  }, []);

  const upsertUser = useCallback((u: AdminUser) => {
    setUsers((list) => {
      const i = list.findIndex((x) => x.uid === u.uid);
      const next = i === -1 ? [u, ...list] : list.map((x) => (x.uid === u.uid ? { ...x, ...u } : x));
      setProjects((pList) => {
        setSettingsState((currSettings) => {
          writeCache({ projects: pList, users: next, settings: currSettings, timestamp: Date.now() });
          return currSettings;
        });
        return pList;
      });
      return next;
    });
  }, []);

  const removeUser = useCallback((uid: string) => {
    setUsers((list) => {
      const next = list.filter((u) => u.uid !== uid);
      setProjects((pList) => {
        setSettingsState((currSettings) => {
          writeCache({ projects: pList, users: next, settings: currSettings, timestamp: Date.now() });
          return currSettings;
        });
        return pList;
      });
      return next;
    });
  }, []);

  const setSettings = useCallback((s: PortalSettings) => {
    setSettingsState(s);
    setProjects((pList) => {
      setUsers((uList) => {
        writeCache({ projects: pList, users: uList, settings: s, timestamp: Date.now() });
        return uList;
      });
      return pList;
    });
  }, []);

  const value = useMemo<AdminData>(
    () => ({
      admin,
      projects,
      users,
      settings,
      loading,
      isRefreshing,
      error,
      lastLoadedAt,
      reload,
      upsertProject,
      removeProjects,
      upsertUser,
      removeUser,
      setSettings,
    }),
    [admin, projects, users, settings, loading, isRefreshing, error, lastLoadedAt, reload, upsertProject, removeProjects, upsertUser, removeUser, setSettings]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminData(): AdminData {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminData must be used inside AdminDataProvider");
  return v;
}
