"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Bell, LogOut, User, Settings, Sparkles, Copy, Check } from "lucide-react";
import AnimatedLiveAvatar from "@/components/avatar/AnimatedLiveAvatar";
import { useAuth } from "@/lib/context/AuthContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function DashboardHeader({ onSearch }: HeaderProps) {
  const { profile, logout } = useAuth();
  const [searchVal, setSearchVal] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100/90 px-6 sm:px-10 flex items-center justify-between gap-4 sm:gap-8 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Brand Logo on Top Bar */}
      <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-sm flex items-center justify-center transform group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L2 14L14 18L14 2Z" fill="#818CF8" />
              <path d="M14 18L26 14L14 2V18Z" fill="#C084FC" opacity="0.9" />
              <path d="M14 18L2 14L14 26V18Z" fill="#6366F1" opacity="0.95" />
              <path d="M14 26L26 14L14 18V26Z" fill="#A855F7" />
            </svg>
          </div>
        </div>
        <span className="text-xl font-black tracking-tight text-[#0F172A] hidden sm:inline">
          Project Hub
        </span>
      </Link>

      {/* Search Bar (Exact match to uploaded design) */}
      <div className="flex-1 max-w-xl relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchVal}
          onChange={handleInputChange}
          placeholder="Search projects, technologies, or students..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F1F5F9]/80 border border-slate-200/60 text-xs sm:text-[13px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20 focus:border-[#4338CA] focus:bg-white transition-all font-medium"
        />
      </div>

      {/* Right Controls: Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => alert("No unread notifications at this time.")}
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-0.5 rounded-full hover:scale-105 transition-transform"
            aria-label="User Profile Menu"
          >
            <AnimatedLiveAvatar
              src={profile.photoURL}
              alt={profile.fullName || "User Avatar"}
              size="sm"
              ringStyle={profile.avatarRingStyle || "instagram"}
              showLiveBadge={false}
              avatarPosition={profile.avatarPosition || "center 38%"}
            />
          </button>

          {/* User Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="font-extrabold text-slate-900 truncate">
                  {profile.fullName || "Student Innovator"}
                </p>
                <p className="text-[11px] text-slate-500 truncate mb-2">
                  {profile.email || "student@college.edu"}
                </p>

                {/* 1-Click Student Profile Code Pill in Dropdown */}
                <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100/90 shadow-2xs">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
                    <span className="font-mono text-[11px] font-black text-indigo-950 truncate">
                      {profile.studentCode || "PH-2026-STU1"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        navigator.clipboard.writeText(profile.studentCode || "PH-2026-STU1");
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }
                    }}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-[10px] font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <Link
                href="/dashboard/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span>Landing Page</span>
              </Link>

              <div className="border-t border-slate-100 my-1" />

              <button
                type="button"
                onClick={async () => {
                  setShowDropdown(false);
                  await logout();
                  window.location.replace("/login");
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
