"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroToMarketplaceStage from "@/components/scroll-stages/HeroToMarketplaceStage";
import GatewayExpandStage from "@/components/scroll-stages/GatewayExpandStage";
import LogoMarqueeUnstackStage from "@/components/scroll-stages/LogoMarqueeUnstackStage";
import FeatureCardsTabSwitcherSection from "@/components/FeatureCardsTabSwitcherSection";
import AvatarSphereGridSection from "@/components/AvatarSphereGridSection";
import BentoBoxFeatureSection from "@/components/BentoBoxFeatureSection";
import MarketplaceCarouselProfileSection from "@/components/MarketplaceCarouselProfileSection";
import PricingTickerSection from "@/components/PricingTickerSection";
import Footer from "@/components/Footer";

export default function Home() {
  // Clear any old hash (like #projects) from browser history on load and ensure top position
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F5F5] text-[#111215] flex flex-col overflow-x-hidden selection:bg-[#FF4A38] selection:text-white">
      {/* 0. Top Navigation Bar (Transparent, origami logo, exact icons) */}
      <Navbar />

      {/* 1 & 2. Unified Scroll Choreography: Hero Fanning Cards Collapse & Morph into Marketplace Showcase */}
      <HeroToMarketplaceStage />

      {/* 3. "Gateway" Full-Width Banner Expansion (84% -> 100vw scroll-driven expand with parallax portrait) */}
      <GatewayExpandStage />

      {/* 4. Logo Marquee & 3D Card Unstack (Continuous marquee + 3D cards flip & unstack vertically down) */}
      <LogoMarqueeUnstackStage />

      {/* 5. Multi-Card Grid & Tab Toggle (Sticky left headline + 2x2 grid with Personal/Business toggle) */}
      <FeatureCardsTabSwitcherSection />

      {/* 6. Parallax Avatar Sphere (Radial burst & multi-layered 3D depth scaling outward on scroll) */}
      <AvatarSphereGridSection />

      {/* 7. Bento Box Grid Reveal (Pop-in staggered animation + interactive cursor/scroll 3D eye tilt) */}
      <BentoBoxFeatureSection />

      {/* 8. Category Carousel & Foreground Profile Zoom (Category carousel + background dim & Dixie Woodward zoom) */}
      <MarketplaceCarouselProfileSection />

      {/* 9. Membership Tiers, Scrolling Neon Ticker & Dual Builder/Recruiter Banners */}
      <PricingTickerSection />

      {/* 10. Footer */}
      <Footer />
    </main>
  );
}
