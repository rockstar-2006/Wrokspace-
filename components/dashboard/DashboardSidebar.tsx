"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderGit2, Layers, User, Box, ArrowRight } from "lucide-react";

interface SidebarProps {
  activeTab?: string;
}

export default function DashboardSidebar({ activeTab }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard" || activeTab === "home",
    },
    {
      name: "Projects",
      href: "/dashboard",
      icon: FolderGit2,
      isActive: activeTab === "projects",
    },
    {
      name: "My Projects",
      href: "/dashboard/my-projects",
      icon: Layers,
      isActive: pathname.startsWith("/dashboard/my-projects") || activeTab === "my-projects",
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
      isActive: pathname.includes("/profile") || activeTab === "profile",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 shrink-0 min-h-screen">
      <div>
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 mb-10 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L2 14L14 18L14 2Z" fill="#818CF8" />
                <path d="M14 18L26 14L14 2V18Z" fill="#C084FC" opacity="0.9" />
                <path d="M14 18L2 14L14 26V18Z" fill="#6366F1" opacity="0.95" />
                <path d="M14 26L26 14L14 18V26Z" fill="#A855F7" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-black tracking-tight text-[#0F172A]">
            Project Hub
          </span>
        </Link>

        {/* Navigation Items (Matching uploaded screenshot) */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-[13px] font-bold transition-all ${
                  item.isActive
                    ? "bg-[#EEF2FF] text-[#4338CA]"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    item.isActive ? "text-[#4338CA]" : "text-[#94A3B8]"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo Card (Exact from Screenshot 4: Build. Share. Grow.) */}
      <div className="mt-8 p-5 rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-purple-50/90 border border-blue-100/70 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-[130px]">
          <h4 className="text-sm font-black text-indigo-950 leading-tight">
            Build.
          </h4>
          <h4 className="text-sm font-black text-blue-600 leading-tight">
            Share.
          </h4>
          <h4 className="text-sm font-black text-purple-600 leading-tight mb-2">
            Grow.
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium mb-3">
            Your projects, your story — all in one place.
          </p>
          <Link
            href="/dashboard/profile"
            className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/25 transition-all transform hover:scale-105"
            title="Update Profile"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Generated 3D Composition Graphic (Matching Screenshot 4) */}
        <div className="absolute -bottom-1 -right-2 w-24 h-24 pointer-events-none opacity-90">
          <Image
            src="/api/assets/sidebar_build_share_grow_1791649763078.jpg"
            alt="Build Share Grow 3D illustration"
            fill
            className="object-cover mix-blend-multiply"
          />
        </div>
      </div>
    </aside>
  );
}
