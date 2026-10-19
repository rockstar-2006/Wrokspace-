"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsapUtils";

interface PageTransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransitionWrapper({
  children,
  className = "",
}: PageTransitionWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "transform,opacity",
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {children}
    </div>
  );
}
