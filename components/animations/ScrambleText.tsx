"use client";

import React, { useRef, useEffect } from "react";
import { animateScrambleText, ScrollTrigger } from "@/lib/gsapUtils";

interface ScrambleTextProps {
  children: string;
  className?: string;
  triggerOn?: "mount" | "hover" | "view";
  duration?: number;
  delay?: number;
  chars?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
}

export default function ScrambleText({
  children,
  className = "",
  triggerOn = "mount",
  duration = 0.9,
  delay = 0,
  chars = "!<>-_\\/[]{}—=+*^?#_0101",
  as: Component = "span",
}: ScrambleTextProps) {
  const elRef = useRef<HTMLElement>(null);
  const isScramblingRef = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const triggerScramble = () => {
    if (!elRef.current) return;
    if (tweenRef.current) {
      tweenRef.current.kill();
    }
    isScramblingRef.current = true;
    const tw = animateScrambleText(elRef.current, children, {
      duration,
      chars,
      onComplete: () => {
        isScramblingRef.current = false;
        tweenRef.current = null;
      },
    });
    if (tw) {
      tweenRef.current = tw;
    }
  };

  useEffect(() => {
    let scrollTriggerInstance: ScrollTrigger | null = null;
    let timeout: NodeJS.Timeout | null = null;

    if (triggerOn === "mount") {
      timeout = setTimeout(() => {
        triggerScramble();
      }, delay * 1000);
    } else if (triggerOn === "view" && elRef.current) {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: elRef.current,
        start: "top 85%",
        once: true,
        onEnter: () => {
          triggerScramble();
        },
      });
    }

    return () => {
      if (timeout) clearTimeout(timeout);
      if (scrollTriggerInstance) scrollTriggerInstance.kill();
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, [children, triggerOn, delay]);

  const handleMouseEnter = () => {
    if (triggerOn === "hover") {
      triggerScramble();
    }
  };

  return (
    <Component
      ref={elRef as any}
      className={`inline-block font-mono tracking-tight ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Component>
  );
}
