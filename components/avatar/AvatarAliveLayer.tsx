"use client";

import React, { useState, useEffect } from "react";

export type AliveAnimationType = "blink" | "shades-glare" | "cyber-pulse" | "auto" | "none";

interface AvatarAliveLayerProps {
  avatarUrl?: string;
  type?: AliveAnimationType;
  className?: string;
}

export default function AvatarAliveLayer({
  avatarUrl = "",
  type = "auto",
  className = "",
}: AvatarAliveLayerProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Auto-detect mode based on avatar style or handle
  const isGlasses =
    avatarUrl.toLowerCase().includes("architect") ||
    avatarUrl.toLowerCase().includes("shades") ||
    avatarUrl.toLowerCase().includes("cool");

  const effectiveType: AliveAnimationType =
    type === "auto" ? (isGlasses ? "shades-glare" : "blink") : type;

  // Natural Random Blinking Timing Loop (every 2.8s to 4s)
  useEffect(() => {
    if (effectiveType !== "blink") return;

    let timeoutId: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      timeoutId = setTimeout(() => {
        setIsBlinking(false);
        const nextTime = 2600 + Math.random() * 2000;
        timeoutId = setTimeout(triggerBlink, nextTime);
      }, 140); // 140ms eyelid blink duration (natural human saccade)
    };

    const initialDelay = 1500 + Math.random() * 1500;
    timeoutId = setTimeout(triggerBlink, initialDelay);

    return () => clearTimeout(timeoutId);
  }, [effectiveType]);

  if (effectiveType === "none") return null;

  return (
    <div className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}>
      {/* ── 1. Natural Eyelid Blink Overlay (for regular eyes) ── */}
      {effectiveType === "blink" && isBlinking && (
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full animate-in fade-in duration-75"
        >
          {/* Left Eyelid Blink Arc */}
          <path
            d="M 37 45.5 Q 43.5 49 50 45.5"
            stroke="#1E293B"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />
          {/* Right Eyelid Blink Arc */}
          <path
            d="M 53 45.5 Q 59.5 49 66 45.5"
            stroke="#1E293B"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />
        </svg>
      )}

      {/* ── 2. Sunglasses / Glasses Light Glare Sheen (for Architect / Cool characters) ── */}
      {effectiveType === "shades-glare" && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {/* Diagonal Glass Sheen Sweep */}
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/35 to-transparent transform -rotate-45 animate-shades-sheen" />
        </div>
      )}

      {/* ── 3. Cyber Optic Pulse (for Bottts / Robotics avatars) ── */}
      {effectiveType === "cyber-pulse" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-1 bg-cyan-400/80 rounded-full blur-[2px] animate-pulse" />
        </div>
      )}
    </div>
  );
}
