"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Inbox,
  FolderGit2,
  Users,
  History,
  Settings,
  LogOut,
  RefreshCw,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useAdminData } from "./AdminDataContext";
import { Avatar } from "./ui";
import { isAwaitingReview } from "@/lib/admin/types";
import { timeAgo } from "@/lib/admin/client";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/review", label: "Review queue", icon: Inbox, badge: "review" as const },
  { href: "/admin/projects", label: "Projects", icon: FolderGit2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/activity", label: "Audit log", icon: History },
  { href: "/admin/settings", label: "Portal settings", icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // On login page, render children directly without the admin console shell or navigation
  if (pathname === "/admin/login" || pathname?.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  const { admin, projects, reload, loading, isRefreshing, lastLoadedAt, error } = useAdminData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [, forceTick] = useState(0);

  const reviewCount = projects.filter((p) => isAwaitingReview(p.status)).length;

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/admin/login" });
  };

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Icon className={`w-4 h-4 ${active ? "text-indigo-600" : "text-slate-400"}`} />
            <span className="flex-1">{item.label}</span>
            {item.badge === "review" && reviewCount > 0 && (
              <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center justify-center">
                {reviewCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
        <ShieldCheck className="w-5 h-5 text-indigo-300" />
      </span>
      <span>
        <span className="block text-[15px] font-black tracking-tight text-slate-900 leading-none">ProjectHub</span>
        <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600 mt-1">Host console</span>
      </span>
    </Link>
  );

  const identity = (
    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
      <div className="flex items-center gap-2.5">
        <Avatar src={admin.image} name={admin.name} size={34} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 truncate">{admin.name}</p>
          <p className="text-[11px] text-slate-500 truncate">{admin.email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors disabled:opacity-50"
      >
        <LogOut className="w-3.5 h-3.5" /> {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200/80 flex-col justify-between p-5 z-40">
        <div>
          <div className="mb-8">{brand}</div>
          {nav}
        </div>
        {identity}
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white p-5 flex flex-col justify-between">
            <div>
              <div className="mb-6 flex items-center justify-between">
                {brand}
                <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              {nav}
            </div>
            {identity}
          </aside>
        </div>
      )}

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="h-14 sm:h-16 bg-white/90 backdrop-blur border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <span className="lg:hidden">{brand}</span>
            <span className="hidden lg:inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className={`w-2 h-2 rounded-full ${isRefreshing ? "bg-amber-400 animate-pulse" : error ? "bg-rose-500" : "bg-emerald-500"}`} />
              {isRefreshing
                ? "Fetching fresh data from Firebase…"
                : error
                ? "Sync failed"
                : lastLoadedAt
                ? `Cached (synced ${timeAgo(new Date(lastLoadedAt).toISOString())})`
                : "Ready"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => reload(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all hover:border-slate-300 shadow-xs"
              title="Fetch fresh data from Firebase"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh from Firebase</span>
            </button>
            <Link
              href="/dashboard"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View site
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
