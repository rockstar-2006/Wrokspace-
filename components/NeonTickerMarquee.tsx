"use client";

import React from "react";
import { Sparkles, Terminal, Shield, Award, Zap } from "lucide-react";

export default function NeonTickerMarquee() {
  const tickerItems = [
    "INSPIRED BY INNOVATION",
    "BATCH OF 2026",
    "NO MORE REPEATED PROJECTS",
    "AUDITED GITHUB REPOSITORIES",
    "SIGNED APK RELEASES",
    "VERIFIED DEMO VIDEOS",
    "ZERO-BIAS JUDGING RUBRICS",
  ];

  return (
    <div className="w-full bg-lime py-5 overflow-hidden border-y-2 border-black select-none shadow-sm my-16">
      <div className="flex w-max animate-marquee">
        {/* First repetition */}
        <div className="flex items-center gap-8 px-4">
          {tickerItems.map((item, idx) => (
            <span key={idx} className="flex items-center gap-8">
              <span className="text-sm sm:text-base md:text-lg font-black tracking-wider text-charcoal uppercase">
                {item}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-charcoal" />
            </span>
          ))}
        </div>

        {/* Second repetition for infinite smooth loop */}
        <div className="flex items-center gap-8 px-4" aria-hidden="true">
          {tickerItems.map((item, idx) => (
            <span key={`dup-${idx}`} className="flex items-center gap-8">
              <span className="text-sm sm:text-base md:text-lg font-black tracking-wider text-charcoal uppercase">
                {item}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-charcoal" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
