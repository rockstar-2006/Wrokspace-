"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsapUtils";
import CinematicSplitText from "@/components/CinematicSplitText";

export default function PricingTickerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tiersGridRef = useRef<HTMLDivElement>(null);
  const splitCardsRef = useRef<HTMLDivElement>(null);
  const loopMarqueeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const kineticRollRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── GSAP ScrollTrigger & Continuous Text Loop Animations ─────────── */
  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const headerEl = headerRef.current;
      if (headerEl) {
        gsap.fromTo(
          headerEl.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            stagger: 0.1,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: headerEl,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      const tiersGridEl = tiersGridRef.current;
      if (tiersGridEl) {
        gsap.fromTo(
          tiersGridEl.children,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.1,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: tiersGridEl,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      const splitCardsEl = splitCardsRef.current;
      if (splitCardsEl) {
        gsap.fromTo(
          splitCardsEl.children,
          { scale: 0.95, y: 30, opacity: 0 },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 0.95,
            stagger: 0.12,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: splitCardsEl,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Continuous GSAP text animation loop 1: Smooth horizontal infinite marquee ticker inside each card
      loopMarqueeRefs.current.forEach((el, index) => {
        if (!el) return;
        gsap.to(el, {
          xPercent: -50,
          ease: "none",
          duration: 9 + index * 1.5,
          repeat: -1,
        });
      });

      // Continuous GSAP text animation loop 2: Smooth vertical kinetic phrase cycle inside each card
      kineticRollRefs.current.forEach((el) => {
        if (!el) return;
        const items = el.querySelectorAll(".kinetic-phrase-item");
        if (items.length <= 1) return;
        const total = items.length;
        const itemHeight = 24; // 24px line height

        const tl = gsap.timeline({ repeat: -1 });
        for (let i = 1; i < total; i++) {
          tl.to(el, {
            y: -itemHeight * i,
            duration: 0.65,
            ease: "power3.inOut",
            delay: 1.8,
          });
        }
        tl.to(el, {
          y: 0,
          duration: 0.65,
          ease: "power3.inOut",
          delay: 1.8,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const tiers = [
    {
      title: "Student Starter",
      status: "COMING SOON",
      cohort: "Cohort '26 Access",
      tickerItems: ["COMING SOON", "FREE REGISTRY", "GITHUB SYNC", "PORTFOLIO PASS", "COMING SOON"],
      kineticPhrases: [
        "● IN ACTIVE PREPARATION",
        "★ 100% FREE FOR STUDENTS",
        "⚡ ZERO HOSTING LOCK-IN",
        "🚀 FALL 2026 ROLLOUT",
      ],
      desc: "For student innovators publishing their first capstone or hackathon project with verified GitHub sync and portfolio profile.",
    },
    {
      title: "Verified Fellow",
      status: "COMING SOON",
      cohort: "Priority Fellow Cohort",
      tickerItems: ["COMING SOON", "FELLOWSHIP BADGE", "RECRUITER RADAR", "DOCKER SANDBOX", "COMING SOON"],
      kineticPhrases: [
        "● IN ACTIVE PREPARATION",
        "★ PRIORITY RECRUITER INBOX",
        "⚡ FACULTY PEER ENDORSED",
        "🚀 EXCLUSIVE FELLOW PASS",
      ],
      desc: "Our flagship tier. Verified innovation badge, priority recruiter inbox routing, live Docker sandbox preview, and faculty endorsement.",
      featured: true,
    },
    {
      title: "Campus Lab & Squad",
      status: "COMING SOON",
      cohort: "Department Beta Batch",
      tickerItems: ["COMING SOON", "LAB COLLABORATION", "TEAM REPO STAGING", "CAMPUS DOMAIN", "COMING SOON"],
      kineticPhrases: [
        "● IN ACTIVE PREPARATION",
        "★ MULTI-DEV SQUAD STAGING",
        "⚡ UNLIMITED SUBDOMAINS",
        "🚀 CAMPUS-WIDE ROLLOUT",
      ],
      desc: "For multi-disciplinary project squads. Up to 10 collaborators, private staging environments, and custom campus subdomains.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="pt-6 md:pt-10 pb-12 w-full overflow-hidden"
    >
      {/* 1. Pricing / Membership Cards */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 mb-14">
        <div ref={headerRef} className="text-left mb-8">
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#71747E] block mb-2 will-change-transform">
            EVALUATION &amp; MEMBERSHIP TIERS
          </span>
          <CinematicSplitText
            tag="h2"
            type="words"
            duration={1.05}
            stagger={0.04}
            className="text-4xl sm:text-6xl md:text-[68px] font-extrabold tracking-[-0.04em] text-[#111215]"
          >
            ProjectHub Membership.
          </CinematicSplitText>
        </div>

        <div
          ref={tiersGridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          {tiers.map((tier, idx) => {
            const isFeatured = idx === 1;

            return (
              <div
                key={idx}
                className={`rounded-3xl p-8 sm:p-10 cursor-pointer transition-all flex flex-col justify-between will-change-transform ${
                  isFeatured
                    ? "bg-[#FF4A38] text-white shadow-2xl scale-105 z-10"
                    : "bg-white border border-black/10 art-card-shadow text-[#111215] hover:border-black/25"
                }`}
              >
                <div>
                  {/* Top Meta Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isFeatured ? "text-white/80" : "text-[#8E929E]"
                      }`}
                    >
                      {tier.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isFeatured && (
                        <span className="px-2.5 py-0.5 rounded-full bg-white text-[#FF4A38] text-[10px] font-black uppercase">
                          MOST POPULAR
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isFeatured
                            ? "bg-black/20 text-white border border-white/30"
                            : "bg-[#111215]/5 text-[#111215] border border-black/10"
                        }`}
                      >
                        COMING SOON
                      </span>
                    </div>
                  </div>

                  {/* Prominent Coming Soon Heading (Replaces Price Figures) */}
                  <div className="mt-4 mb-3">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isFeatured ? "bg-white" : "bg-[#FF4A38]"
                        } animate-ping`}
                      />
                      <h3 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
                        Coming Soon
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-semibold tracking-wide ${
                        isFeatured ? "text-white/80" : "text-[#71747E]"
                      }`}
                    >
                      {tier.cohort}
                    </span>
                  </div>

                  {/* Continuous GSAP Text Animation Loop 1: Horizontal infinite scrolling marquee */}
                  <div
                    className={`mt-4 mb-3 overflow-hidden rounded-xl py-2 px-3 border select-none ${
                      isFeatured
                        ? "bg-black/20 border-white/20 text-white"
                        : "bg-neutral-100/80 border-black/5 text-[#111215]"
                    }`}
                  >
                    <div
                      ref={(el) => {
                        loopMarqueeRefs.current[idx] = el;
                      }}
                      className="flex items-center gap-4 whitespace-nowrap w-max text-[11px] font-black uppercase tracking-wider will-change-transform"
                    >
                      {[
                        ...tier.tickerItems,
                        ...tier.tickerItems,
                        ...tier.tickerItems,
                      ].map((item, tIdx) => (
                        <span key={tIdx} className="flex items-center gap-3">
                          <span>{item}</span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isFeatured ? "bg-white/70" : "bg-[#FF4A38]"
                            }`}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Continuous GSAP Text Animation Loop 2: Vertical cycling kinetic phrases */}
                  <div className="h-6 overflow-hidden relative mb-2">
                    <div
                      ref={(el) => {
                        kineticRollRefs.current[idx] = el;
                      }}
                      className="flex flex-col will-change-transform"
                    >
                      {tier.kineticPhrases.map((phrase, pIdx) => (
                        <div
                          key={pIdx}
                          className={`kinetic-phrase-item h-6 flex items-center text-[10px] font-mono font-bold tracking-wider ${
                            isFeatured ? "text-yellow-200" : "text-emerald-700"
                          }`}
                        >
                          {phrase}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tier Description */}
                  <p
                    className={`mt-4 text-xs sm:text-sm leading-relaxed ${
                      isFeatured ? "text-white/90" : "text-[#71747E]"
                    }`}
                  >
                    {tier.desc}
                  </p>
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-8 pt-6 border-t border-black/10">
                  <button
                    onClick={() =>
                      alert(
                        `${tier.title} is coming soon! Pre-registrations will open shortly.`
                      )
                    }
                    className={`w-full py-3.5 rounded-full text-xs font-bold transition-all shadow-md hover:scale-105 flex items-center justify-center gap-2 ${
                      isFeatured
                        ? "bg-white text-[#111215] hover:bg-[#D7FA00]"
                        : "bg-[#121316] text-white hover:bg-black"
                    }`}
                  >
                    <span>Coming Soon</span>
                    <span className="opacity-60">•</span>
                    <span>Join Waitlist</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Scrolling Ticker: Neon-Yellow Band with ProjectHub Messages */}
      <div className="w-full bg-[#D7FA00] py-5 overflow-hidden border-y-2 border-black select-none my-8">
        <div className="flex items-center w-max animate-marquee">
          {[
            "Student Innovators Can Launch",
            "Verified Capstone Code",
            "Next-Gen Project Hub",
            "Meet Tech Recruiters",
            "Campus Project Registry",
            "Student Innovators Can Launch",
            "Verified Capstone Code",
            "Next-Gen Project Hub",
            "Meet Tech Recruiters",
            "Campus Project Registry",
          ].map((msg, i) => (
            <div key={i} className="flex items-center gap-10 mx-6">
              <span className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#111215]">
                {msg}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#111215]" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Bottom Dual Cards */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 mt-10">
        <div ref={splitCardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-white border border-black/10 p-8 sm:p-12 art-card-shadow flex flex-col justify-between will-change-transform">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#71747E] block mb-2">
                FOR DEVELOPERS &amp; DESIGNERS
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#111215]">
                Build in public. <br />
                Get verified by peers.
              </h3>
              <p className="mt-4 text-xs sm:text-sm text-[#71747E] max-w-md">
                Connect your GitHub or Figma workflows, generate immersive live previews, and collect endorsement badges from industry leaders.
              </p>
            </div>
            <div className="mt-8">
              <button className="px-6 py-3 rounded-full bg-[#121316] text-white text-xs font-bold hover:bg-black transition-all">
                Create Free Profile
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-[#121316] text-white p-8 sm:p-12 art-card-shadow flex flex-col justify-between will-change-transform">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D7FA00] block mb-2">
                FOR TEAMS &amp; RECRUITERS
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Source top talent. <br />
                Acquire verified code.
              </h3>
              <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-md">
                Review verified repository commits, benchmarked build health, and interactive portfolios to match with high-impact engineers.
              </p>
            </div>
            <div className="mt-8">
              <button className="px-6 py-3 rounded-full bg-white text-[#111215] text-xs font-bold hover:bg-neutral-100 transition-all">
                Explore Talent Pool
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
