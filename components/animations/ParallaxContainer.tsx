"use client";

import React, { useRef, useEffect } from "react";
import { initParallaxElements } from "@/lib/gsapUtils";

interface ParallaxContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function ParallaxContainer({
  children,
  className = "",
}: ParallaxContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cleanup = initParallaxElements(containerRef.current);
    return cleanup;
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
    </div>
  );
}
