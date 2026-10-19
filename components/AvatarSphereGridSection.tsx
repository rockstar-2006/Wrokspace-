"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { gsap, ScrollTrigger, Draggable } from "@/lib/gsapUtils";
import CinematicSplitText from "@/components/CinematicSplitText";
import { AVATAR_COMMUNITY } from "@/lib/data";

interface AvatarItemProps {
  coord: { x: number; y: number; speed: number };
  member: (typeof AVATAR_COMMUNITY)[number];
  radialExpansion: MotionValue<number>;
  avatarScale: MotionValue<number>;
  avatarOpacity: MotionValue<number>;
}

function AvatarItem({
  coord,
  member,
  radialExpansion,
  avatarScale,
  avatarOpacity,
}: AvatarItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const x = useTransform(radialExpansion, (v) => coord.x * v * coord.speed);
  const y = useTransform(radialExpansion, (v) => coord.y * v * coord.speed);

  /* ── Interactive Physics: Draggable Avatars with Elastic Snap ────────── */
  useEffect(() => {
    if (!itemRef.current) return;
    const d = Draggable.create(itemRef.current, {
      type: "x,y",
      edgeResistance: 0.65,
      cursor: "grab",
      activeCursor: "grabbing",
      onDrag: function () {
        gsap.to(this.target, {
          scale: 1.25,
          duration: 0.1,
          overwrite: "auto",
        });
      },
      onDragEnd: function () {
        gsap.to(this.target, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: "elastic.out(1, 0.4)",
        });
      },
    });

    return () => {
      d[0]?.kill();
    };
  }, []);

  return (
    <motion.div
      style={{
        x,
        y,
        scale: avatarScale,
        opacity: avatarOpacity,
      }}
      className="absolute select-none z-10"
    >
      <div
        ref={itemRef}
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden p-0.5 bg-white border border-black/10 art-card-shadow hover:border-[#FF4A38] hover:ring-4 hover:ring-[#FF4A38]/30 transition-all cursor-grab active:cursor-grabbing"
      >
        <div className="relative w-full h-full rounded-full overflow-hidden">
          <Image
            src={member.avatar}
            alt={member.name}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function AvatarSphereGridSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textCenterRef = useRef<HTMLDivElement>(null);

  /* ── GSAP ScrollTrigger Text Animation ───────────────────────────── */
  useEffect(() => {
    const textCenter = textCenterRef.current;
    if (typeof window === "undefined" || !textCenter) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        textCenter.querySelectorAll("p"),
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: textCenter,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, textCenterRef);

    return () => ctx.revert();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.6,
  });

  const radialExpansion = useTransform(smoothProgress, [0.15, 0.6], [0.2, 1]);
  const avatarScale = useTransform(smoothProgress, [0.15, 0.6], [0.2, 1]);
  const avatarOpacity = useTransform(smoothProgress, [0.12, 0.35], [0, 1]);

  const sphereCoordinates = [
    { x: -320, y: -160, speed: 1.1 },
    { x: -160, y: -220, speed: 0.9 },
    { x: 160, y: -210, speed: 1.05 },
    { x: 340, y: -150, speed: 1.15 },
    { x: -380, y: 0, speed: 0.95 },
    { x: 390, y: 10, speed: 1.0 },
    { x: -330, y: 160, speed: 1.1 },
    { x: -150, y: 220, speed: 0.85 },
    { x: 150, y: 210, speed: 1.0 },
    { x: 330, y: 170, speed: 1.2 },
    { x: -240, y: -80, speed: 0.95 },
    { x: 250, y: -70, speed: 1.05 },
    { x: -250, y: 80, speed: 1.1 },
    { x: 240, y: 90, speed: 0.9 },
  ];

  return (
    <section
      ref={containerRef}
      className="py-10 md:py-16 px-6 sm:px-12 max-w-[1440px] mx-auto w-full text-center relative overflow-hidden"
    >
      {/* Sphere Grid Container */}
      <div className="relative min-h-[460px] flex items-center justify-center">
        {/* Central Headline with GSAP CinematicSplitText Reveal */}
        <div ref={textCenterRef} className="relative z-20 max-w-2xl mx-auto px-4">
          <CinematicSplitText
            tag="h2"
            type="words"
            duration={1.1}
            stagger={0.04}
            className="text-5xl sm:text-7xl md:text-[80px] font-extrabold tracking-[-0.04em] text-[#111215] leading-[1.02]"
          >
            You will find yourself among student innovators.
          </CinematicSplitText>

          <p className="mt-4 text-xs sm:text-sm text-[#71747E] font-medium max-w-md mx-auto will-change-transform">
            From hackathon champions to AI research fellows. Join 4,800+ student developers across 120+ university chapters building on ProjectHub.
          </p>
        </div>

        {/* Floating Radial Avatar Sphere: each avatar draggable with physics recoil */}
        {sphereCoordinates.map((coord, idx) => {
          const member = AVATAR_COMMUNITY[idx % AVATAR_COMMUNITY.length];
          return (
            <AvatarItem
              key={idx}
              coord={coord}
              member={member}
              radialExpansion={radialExpansion}
              avatarScale={avatarScale}
              avatarOpacity={avatarOpacity}
            />
          );
        })}
      </div>
    </section>
  );
}
