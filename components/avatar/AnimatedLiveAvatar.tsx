"use client";

import React from "react";
import { User } from "lucide-react";
import InteractiveEyeMascot, { MascotTheme, MascotMood } from "./InteractiveEyeMascot";
import AvatarAliveLayer, { AliveAnimationType } from "./AvatarAliveLayer";

export type AvatarRingStyle =
  | "instagram" // Crisp, non-rotating Instagram Sunset Story Gradient
  | "cyber" // Crisp Neon Cyan to Electric Blue to Violet Gradient
  | "emerald" // Crisp Emerald Mint Campus Innovator Gradient
  | "minimal" // Clean Sleek Slate Border
  | "none";

interface AnimatedLiveAvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  ringStyle?: AvatarRingStyle;
  aliveAnimation?: AliveAnimationType;
  showLiveBadge?: boolean;
  liveBadgeText?: string;
  avatarPosition?: string;
  className?: string;
  onClick?: () => void;
}

const SIZE_CONFIGS = {
  xs: { box: "w-7 h-7", ring: "p-[1.5px]", avatar: "w-6 h-6", px: 24, badge: "w-2 h-2 text-[8px]" },
  sm: { box: "w-9 h-9", ring: "p-[2px]", avatar: "w-8 h-8", px: 32, badge: "w-2.5 h-2.5 text-[8px]" },
  md: { box: "w-12 h-12", ring: "p-[2px]", avatar: "w-11 h-11", px: 44, badge: "w-3 h-3 text-[9px]" },
  lg: { box: "w-16 h-16", ring: "p-[2.5px]", avatar: "w-15 h-15", px: 60, badge: "w-3.5 h-3.5 text-[10px]" },
  xl: { box: "w-20 h-20", ring: "p-[2.5px]", avatar: "w-[72px] h-[72px]", px: 72, badge: "w-4 h-4 text-[10px]" },
  "2xl": { box: "w-28 h-28", ring: "p-[3px]", avatar: "w-26 h-26", px: 104, badge: "w-5 h-5 text-xs" },
};

// Crisp, Non-Rotating Professional Gradients (Zero Spinning)
const RING_GRADIENTS: Record<AvatarRingStyle, string> = {
  instagram: "bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] shadow-xs",
  cyber: "bg-gradient-to-tr from-[#00F2FE] via-[#4FACFE] to-[#8B5CF6] shadow-xs",
  emerald: "bg-gradient-to-tr from-[#10B981] via-[#06B6D4] to-[#3B82F6] shadow-xs",
  minimal: "bg-slate-200 border border-slate-300/60",
  none: "",
};

export default function AnimatedLiveAvatar({
  src,
  alt = "Student Avatar",
  size = "md",
  ringStyle = "instagram",
  aliveAnimation = "auto",
  showLiveBadge = false,
  liveBadgeText,
  avatarPosition = "center 38%",
  className = "",
  onClick,
}: AnimatedLiveAvatarProps) {
  const config = SIZE_CONFIGS[size];
  const ringGradient = RING_GRADIENTS[ringStyle];
  const isClickable = Boolean(onClick);

  // Check if avatar is interactive mascot format: mascot:theme:mood
  const isMascot = typeof src === "string" && src.startsWith("mascot:");
  let mascotTheme: MascotTheme = "orange";
  let mascotMood: MascotMood = "curious";

  if (isMascot && src) {
    const parts = src.split(":");
    if (parts[1]) mascotTheme = parts[1] as MascotTheme;
    if (parts[2]) mascotMood = parts[2] as MascotMood;
  }

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 select-none group ${
        isClickable ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* ── Outer Crisp Professional Story Ring (Static & Sharp, NO spinning) ── */}
      <div
        className={`rounded-full ${config.ring} ${ringGradient} ${
          ringStyle !== "none" ? "transition-all duration-300 group-hover:scale-105" : ""
        }`}
      >
        {/* Inner Clean White Gap Separator Ring */}
        <div className="rounded-full p-[2px] bg-white flex items-center justify-center">
          {/* Avatar Container with Subtle Alive Floating Micro-Physics */}
          <div
            className={`rounded-full overflow-hidden bg-slate-100 relative flex items-center justify-center ${config.avatar} shadow-2xs animate-float-aura`}
          >
            {isMascot ? (
              // Continuous Animated Interactive Mascot (Image 2 match with live eyes & blinking)
              <InteractiveEyeMascot
                theme={mascotTheme}
                mood={mascotMood}
                size={config.px}
                interactive={true}
              />
            ) : src ? (
              // Vector or Image Avatar with Live Eye Blinking Overlay
              <>
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ objectPosition: avatarPosition }}
                  loading="lazy"
                />

                {/* Natural Eye Blinking & Shades Sheen Overlay for Every Avatar */}
                <AvatarAliveLayer avatarUrl={src} type={aliveAnimation} />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black">
                <User className="w-1/2 h-1/2 text-white/90" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Clean Live Status Badge ── */}
      {showLiveBadge && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white shadow-xs flex items-center justify-center z-10 ${
            liveBadgeText
              ? "px-1.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase tracking-wider text-[8px]"
              : `${config.badge} bg-emerald-500 ring-2 ring-emerald-300/40 animate-pulse`
          }`}
        >
          {liveBadgeText || null}
        </span>
      )}
    </div>
  );
}
