"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, SunMedium, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function Navbar() {
  const { user, profile } = useAuth();
  const isLoggedIn = Boolean(user?.uid);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full px-6 sm:px-12 py-6 flex items-center justify-between max-w-[1400px] mx-auto bg-transparent z-40 relative"
    >
      {/* Brand Logo (Folded origami icon + ProjectHub) */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <svg
          width="26"
          height="26"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          <path d="M14 2L2 14L14 18L14 2Z" fill="#38D9A9" />
          <path d="M14 18L26 14L14 2V18Z" fill="#20C997" opacity="0.8" />
          <path d="M14 18L2 14L14 26V18Z" fill="#12B886" opacity="0.9" />
          <path d="M14 26L26 14L14 18V26Z" fill="#0CA678" />
        </svg>
        <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#111215]">
          ProjectHub
        </span>
      </Link>

      {/* Center Nav Links */}
      <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#71747E]">
        <Link
          href={isLoggedIn ? "/dashboard" : "/login"}
          className="text-[#111215] font-bold hover:text-black transition-colors"
        >
          {isLoggedIn ? "Dashboard" : "Get Started"}
        </Link>
        <Link
          href="/showcase"
          className="hover:text-[#111215] transition-colors flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-red inline-block" />
          Showcase (Play Store)
        </Link>
        <Link
          href="/dashboard"
          className="hover:text-[#111215] transition-colors"
        >
          Projects
        </Link>
        <Link
          href="#contact"
          className="hover:text-[#111215] transition-colors"
        >
          Contact
        </Link>
        <Link
          href="#vision"
          className="hover:text-[#111215] transition-colors"
        >
          Solution
        </Link>
        <Link
          href={isLoggedIn ? "/dashboard/my-projects" : "/login"}
          className="hover:text-[#111215] transition-colors"
        >
          {isLoggedIn ? "My Projects" : "Registry"}
        </Link>
      </nav>

      {/* Right Icons: Profile + Login CTA */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm"
          >
            <span>Dashboard</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </Link>
        ) : (
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#121316] text-white text-xs font-bold hover:bg-black transition-all shadow-sm"
          >
            <span>Login</span>
            <Sparkles className="w-3 h-3 text-[#FF4A38]" />
          </Link>
        )}

        <Link
          href={isLoggedIn ? "/dashboard/profile" : "/login"}
          aria-label="User Profile"
          className="w-9 h-9 rounded-full border border-black/10 overflow-hidden flex items-center justify-center text-[#111215] hover:bg-black/5 transition-all shadow-sm relative"
        >
          {isLoggedIn && profile?.photoURL ? (
            <Image
              src={profile.photoURL}
              alt={profile.fullName || "Profile"}
              fill
              className="object-cover object-top"
            />
          ) : (
            <User className="w-4 h-4 text-[#111215]" />
          )}
        </Link>

        <button
          onClick={() => alert("Light theme is enabled by default.")}
          aria-label="Theme settings"
          className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center text-[#111215] hover:bg-black/5 transition-all shadow-sm"
        >
          <SunMedium className="w-4 h-4 text-[#111215]" />
        </button>
      </div>
    </motion.header>
  );
}

