"use client";

import React, { useState, useEffect, useRef } from "react";

export type MascotTheme = "orange" | "cyan" | "violet" | "emerald" | "pink" | "midnight";
export type MascotMood = "curious" | "tracker" | "hacker" | "cool" | "cyber" | "kawaii";

interface InteractiveEyeMascotProps {
  theme?: MascotTheme;
  mood?: MascotMood;
  interactive?: boolean;
  className?: string;
  size?: number; // size in px, default 100
}

const THEME_COLORS: Record<MascotTheme, { body: string; shadow: string; highlight: string }> = {
  orange: { body: "#FF7A18", shadow: "#D95D00", highlight: "#FFA85C" }, // Exact match to user screenshot Image 2
  cyan: { body: "#06B6D4", shadow: "#0891B2", highlight: "#67E8F9" },
  violet: { body: "#8B5CF6", shadow: "#7C3AED", highlight: "#C4B5FD" },
  emerald: { body: "#10B981", shadow: "#059669", highlight: "#6EE7B7" },
  pink: { body: "#F43F5E", shadow: "#E11D48", highlight: "#FDA4AF" },
  midnight: { body: "#1E293B", shadow: "#0F172A", highlight: "#475569" },
};

export default function InteractiveEyeMascot({
  theme = "orange",
  mood = "curious",
  interactive = true,
  className = "",
  size = 120,
}: InteractiveEyeMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: -4, y: -7 }); // default looking up-left like Image 2
  const [isBlinking, setIsBlinking] = useState(false);

  const colors = THEME_COLORS[theme] || THEME_COLORS.orange;

  // Continuous Natural Blinking Loop every 3-4 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      timeoutId = setTimeout(() => {
        setIsBlinking(false);
        const nextInterval = 2500 + Math.random() * 2500;
        timeoutId = setTimeout(triggerBlink, nextInterval);
      }, 160);
    };

    const initialDelay = 1800 + Math.random() * 2000;
    timeoutId = setTimeout(triggerBlink, initialDelay);

    return () => clearTimeout(timeoutId);
  }, []);

  // Smooth Cursor Tracking or Autonomous Gaze
  useEffect(() => {
    if (!interactive) return;

    if (mood === "tracker") {
      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.hypot(deltaX, deltaY);
        const maxRadius = 7; // Max eye radius clamp

        if (distance === 0) {
          setPupilOffset({ x: 0, y: 0 });
        } else {
          const clamped = Math.min(distance / 25, maxRadius);
          const angle = Math.atan2(deltaY, deltaX);
          setPupilOffset({
            x: Math.cos(angle) * clamped,
            y: Math.sin(angle) * clamped,
          });
        }
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      return () => window.removeEventListener("mousemove", handleMouseMove);
    } else if (mood === "curious") {
      // Continuous curious gaze looking up-left like Image 2 with micro-twitches
      let intervalId: NodeJS.Timeout;
      const animateGaze = () => {
        // Slight subtle micro-movements around the upper quadrant
        const randomX = -5 + (Math.random() * 3 - 1.5);
        const randomY = -8 + (Math.random() * 2 - 1);
        setPupilOffset({ x: randomX, y: randomY });
      };

      intervalId = setInterval(animateGaze, 1800);
      return () => clearInterval(intervalId);
    }
  }, [interactive, mood]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible transition-transform duration-300 transform hover:scale-105"
      >
        {/* Continuous Breathing Body Group */}
        <g className="animate-mascot-breathe origin-bottom">
          {/* Subtle Ambient Floor Shadow */}
          <ellipse cx="100" cy="188" rx="84" ry="12" fill="rgba(0,0,0,0.18)" />

          {/* Dome Character Body (Exact match to Image 2) */}
          <path
            d="M 22 186 C 20 100, 48 30, 100 30 C 152 30, 180 100, 178 186 Z"
            fill={colors.body}
          />

          {/* Soft 3D Lighting Highlight on Top */}
          <ellipse
            cx="100"
            cy="42"
            rx="56"
            ry="10"
            fill={colors.highlight}
            opacity="0.35"
          />

          {/* Bottom Depth Shadow Accent */}
          <path
            d="M 22 180 C 40 186, 160 186, 178 180 C 178 186, 22 186, 22 186 Z"
            fill={colors.shadow}
            opacity="0.5"
          />

          {/* ── Optional Accessories by Mood ── */}
          {mood === "hacker" && (
            // Cyber Headphones
            <g>
              <path
                d="M 32 100 C 32 30, 168 30, 168 100"
                stroke="#1E293B"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <rect x="22" y="80" width="16" height="36" rx="8" fill="#0F172A" />
              <rect x="162" y="80" width="16" height="36" rx="8" fill="#0F172A" />
            </g>
          )}

          {mood === "cyber" && (
            // Antennas / Robot Node
            <g>
              <line x1="100" y1="30" x2="100" y2="12" stroke="#0F172A" strokeWidth="4" />
              <circle cx="100" cy="10" r="7" fill="#00F2FE" className="animate-pulse" />
            </g>
          )}

          {/* ── Two Huge Expressive Eyes (Exact match to Image 2) ── */}
          <g className={`transition-all duration-100 ${isBlinking ? "scale-y-0" : "scale-y-100"} origin-[100px_104px]`}>
            {/* Left Eye Sclera (White) */}
            <circle
              cx="74"
              cy="104"
              r="34"
              fill="#FFFFFF"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="2"
            />
            {/* Right Eye Sclera (White) */}
            <circle
              cx="126"
              cy="104"
              r="34"
              fill="#FFFFFF"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="2"
            />

            {/* Left Eye Pupil (Large Black Circle with shine) */}
            <g style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }} className="transition-transform duration-150 ease-out">
              <circle cx="74" cy="104" r="14.5" fill="#111827" />
              {/* Cute Eye Catchlight Reflection */}
              <circle cx="70" cy="100" r="4.5" fill="#FFFFFF" opacity="0.9" />
              <circle cx="77" cy="106" r="2" fill="#FFFFFF" opacity="0.7" />
            </g>

            {/* Right Eye Pupil (Large Black Circle with shine) */}
            <g style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }} className="transition-transform duration-150 ease-out">
              <circle cx="126" cy="104" r="14.5" fill="#111827" />
              {/* Cute Eye Catchlight Reflection */}
              <circle cx="122" cy="100" r="4.5" fill="#FFFFFF" opacity="0.9" />
              <circle cx="129" cy="106" r="2" fill="#FFFFFF" opacity="0.7" />
            </g>
          </g>

          {/* ── Mood Accents ── */}
          {mood === "kawaii" && (
            // Cute Blush Cheeks
            <g>
              <ellipse cx="44" cy="134" rx="10" ry="5" fill="#FF4D88" opacity="0.45" />
              <ellipse cx="156" cy="134" rx="10" ry="5" fill="#FF4D88" opacity="0.45" />
            </g>
          )}

          {mood === "cool" && (
            // Sunglasses
            <g className="animate-pulse-subtle">
              <rect x="42" y="92" width="50" height="26" rx="8" fill="#111827" />
              <rect x="108" y="92" width="50" height="26" rx="8" fill="#111827" />
              <line x1="92" y1="104" x2="108" y2="104" stroke="#111827" strokeWidth="6" />
              {/* Glass Glare */}
              <line x1="48" y1="96" x2="78" y2="114" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" />
              <line x1="114" y1="96" x2="144" y2="114" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" />
            </g>
          )}

          {/* Bottom Solid Stage Bar matching user's Image 2 screenshot */}
          <rect x="0" y="186" width="200" height="14" fill="#0F172A" />
        </g>
      </svg>
    </div>
  );
}
