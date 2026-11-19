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
  error: string | null;
  lastLoadedAt: number | null;
  reload: () => Promise<void>;
  upsertProject: (p: Project) => void;
  removeProjects: (ids: string[]) => void;
  upsertUser: (u: AdminUser) => void;
  removeUser: (uid: string) => void;
  setSettings: (s: PortalSettings) => void;
}

const Ctx = createContext<AdminData | null>(null);

/** Loads the whole registry once for the admin session; pages share it and patch it locally after mutations. */
export function AdminDataProvider({ admin, children }: { admin: AdminIdentityClient; children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<PortalSettings>(normalizeSettings(null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<number | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, u, s] = await Promise.all([adminApi.projects(), adminApi.users(), adminApi.settings()]);
      setProjects(p.projects);
      setUsers(u.users);
      setSettings(s.settings);
      setLastLoadedAt(Date.now());
    } catch (e: any) {
      setError(e?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo<AdminData>(
    () => ({
      admin,
      projects,
      users,
      settings,
      loading,
      error,
      lastLoadedAt,
      reload,
      upsertProject: (p) =>
        setProjects((list) => {
          const i = list.findIndex((x) => x.id === p.id);
          if (i === -1) return [p, ...list];
          const next = list.slice();
          next[i] = p;
          return next;
        }),
      removeProjects: (ids) => setProjects((list) => list.filter((p) => !ids.includes(p.id))),
      upsertUser: (u) =>
        setUsers((list) => {
          const i = list.findIndex((x) => x.uid === u.uid);
          if (i === -1) return [u, ...list];
          const next = list.slice();
          next[i] = { ...next[i], ...u };
          return next;
        }),
      removeUser: (uid) => setUsers((list) => list.filter((u) => u.uid !== uid)),
      setSettings,
    }),
    [admin, projects, users, settings, loading, error, lastLoadedAt, reload]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminData(): AdminData {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminData must be used inside AdminDataProvider");
  return v;
}
