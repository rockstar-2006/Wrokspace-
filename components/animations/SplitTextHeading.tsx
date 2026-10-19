"use client";

import React, { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsapUtils";

interface SplitTextHeadingProps {
  children: string;
  className?: string;
  type?: "words" | "chars";
  stagger?: number;
  duration?: number;
  delay?: number;
  triggerOnScroll?: boolean;
  startTrigger?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

export default function SplitTextHeading({
  children,
  className = "",
  type = "words",
  stagger = 0.04,
  duration = 0.85,
  delay = 0,
  triggerOnScroll = true,
  startTrigger = "top 90%",
  as: Component = "h2",
}: SplitTextHeadingProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (typeof window === "undefined" || !el) return;

    const targets = el.querySelectorAll(".split-reveal-item");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          yPercent: 110,
          opacity: 0,
          rotateX: 30,
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
          scrollTrigger: triggerOnScroll
            ? {
                trigger: el,
                start: startTrigger,
                toggleActions: "play none none reverse",
              }
            : undefined,
        }
      );
    }, el);

    return () => ctx.revert();
  }, [children, type, stagger, duration, delay, triggerOnScroll, startTrigger]);

  const words = children.split(" ");

  const content = words.map((word, wordIdx) => {
    if (type === "chars") {
      return (
        <span
          key={wordIdx}
          className="inline-block whitespace-nowrap overflow-hidden mr-[0.25em] align-top"
        >
          {Array.from(word).map((char, charIdx) => (
            <span
              key={charIdx}
              className="split-reveal-item inline-block will-change-transform"
            >
              {char}
            </span>
          ))}
        </span>
      );
    }

    return (
      <span
        key={wordIdx}
        className="inline-block overflow-hidden mr-[0.26em] align-top"
      >
        <span className="split-reveal-item inline-block will-change-transform">
          {word}
        </span>
      </span>
    );
  });

  return (
    <Component
      ref={containerRef as any}
      className={`relative inline-block ${className}`}
      style={{ perspective: "1000px" }}
    >
      {content}
    </Component>
  );
}
