"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderGit2, Layers, User, PlusCircle } from "lucide-react";
import { gsap } from "@/lib/gsapUtils";

interface BottomNavProps {
  activeTab?: string;
}

export default function ModernBottomNav({ activeTab }: BottomNavProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.5)" }
      );
    }
  }, []);

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard" && activeTab !== "profile" && activeTab !== "my-projects",
    },
    {
      name: "Projects",
      href: "/dashboard#all",
      icon: FolderGit2,
      isActive: activeTab === "projects",
    },
    {
      name: "Submit",
      href: "/dashboard/add-project",
      icon: PlusCircle,
      isActive: pathname === "/dashboard/add-project",
      isHighlight: true,
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
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <nav
        ref={navRef}
        aria-label="Navigation Bar"
        className="pointer-events-auto flex items-center gap-1.5 sm:gap-3 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.18)] transition-all duration-300 hover:shadow-[0_16px_50px_-6px_rgba(67,56,202,0.22)]"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.isHighlight) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#4338CA] via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transform hover:scale-105 active:scale-95 transition-all mx-1"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all transform hover:scale-105 active:scale-95 ${
                item.isActive
                  ? "bg-[#EEF2FF] text-[#4338CA] shadow-2xs font-black"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform ${
                  item.isActive ? "text-[#4338CA] scale-110" : "text-slate-400"
                }`}
              />
              <span className={item.isActive ? "inline" : "hidden sm:inline"}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
