"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-black/10 pt-16 pb-12 px-6 sm:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-black/10">
          {/* Col 1: Brand */}
          <div className="md:col-span-6 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2.5">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L2 14L14 18L14 2Z" fill="#38D9A9" />
                <path d="M14 18L26 14L14 2V18Z" fill="#20C997" opacity="0.8" />
                <path d="M14 18L2 14L14 26V18Z" fill="#12B886" opacity="0.9" />
                <path d="M14 26L26 14L14 18V26Z" fill="#0CA678" />
              </svg>
              <span className="font-extrabold text-xl tracking-tight text-[#111215]">
                ProjectHub
              </span>
            </Link>

            <p className="mt-4 text-xs sm:text-sm text-[#71747E] leading-relaxed max-w-md">
              A place to display your masterpiece. Curated project showcase, developer portfolio registry, and collaboration marketplace.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111215] mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#71747E] font-medium">
              <li>
                <a href="#explore" className="hover:text-black transition-colors">
                  Showcase Registry
                </a>
              </li>
              <li>
                <a href="#featured" className="hover:text-black transition-colors">
                  Gateway Innovators
                </a>
              </li>
              <li>
                <a href="#vision" className="hover:text-black transition-colors">
                  Ecosystem &amp; Vision
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-black transition-colors">
                  Membership &amp; Tiers
                </a>
              </li>
              <li>
                <a href="#directory" className="hover:text-black transition-colors">
                  All Projects
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Department info */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111215] mb-4">
              Governance
            </h4>
            <p className="text-xs text-[#71747E] leading-relaxed mb-4">
              Google OAuth SSO restricted to college domain. Zero proprietary hosting lock-in.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Free Tier Architecture • Production Ready</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E929E]">
          <p>© 2026 College Department of Computer Science. All rights reserved.</p>
          <p>Inspired by Pallet Ross • Crafted with Plus Jakarta Sans &amp; Framer Motion</p>
        </div>
      </div>
    </footer>
  );
}
