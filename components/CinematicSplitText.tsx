"use client";

import React, { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsapUtils";

interface CinematicSplitTextProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  type?: "words" | "chars";
  stagger?: number;
  duration?: number;
  delay?: number;
  startTrigger?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

export default function CinematicSplitText({
  children,
  className = "",
  style = {},
  type = "words",
  stagger = 0.035,
  duration = 0.9,
  delay = 0,
  startTrigger = "top 88%",
  tag = "h2",
}: CinematicSplitTextProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (typeof window === "undefined" || !el) return;

    const splitItems = el.querySelectorAll(".cinematic-split-item");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        splitItems,
        {
          yPercent: 105,
          opacity: 0,
          rotateX: 35,
          transformOrigin: "50% 100%",
        },
        {
          yPercent: 0,
          opacity: 1,
          rotateX: 0,
          duration,
          stagger,
          delay,
          ease: "power3.out",
          force3D: true,
          scrollTrigger: {
            trigger: el,
            start: startTrigger,
            toggleActions: "play none none reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [children, type, stagger, duration, delay, startTrigger]);

  const words = children.split(" ");

  const content = words.map((word, wordIdx) => {
    if (type === "chars") {
      return (
        <span
          key={wordIdx}
          className="inline-block whitespace-nowrap overflow-hidden mr-[0.28em] align-top"
        >
          {Array.from(word).map((char, charIdx) => (
            <span
              key={charIdx}
              className="cinematic-split-item inline-block will-change-transform"
            >
              {char}
            </span>
          ))}
        </span>
      );
    }

    // Default: words split
    return (
      <span
        key={wordIdx}
        className="inline-block overflow-hidden mr-[0.28em] align-top"
      >
        <span className="cinematic-split-item inline-block will-change-transform">
          {word}
        </span>
      </span>
    );
  });

  return React.createElement(
    tag,
    {
      ref: containerRef,
      className: `relative inline-block ${className}`,
      style: { perspective: "1000px", ...style },
    },
    content
  );
}
