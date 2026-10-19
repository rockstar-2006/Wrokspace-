# ProjectHub — Department Project Showcase & Competition Registry

A curated, production-grade registry for college engineering projects: Web Apps, Android APKs, AI Models, and Robotics.

Designed and animated according to the contemporary SaaS aesthetic reference (featuring Framer Motion spring physics, card fan-outs, bento grids, and high-contrast accents).

---

## ⚡ Quick Start

In your terminal in `d:\Workspace`:

```bash
# 1. Copy .env.example to .env.local and fill in the required credentials
# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the interactive experience.

Keep real credentials in `.env.local`; do not commit that file. `FREEIMAGE_API_KEY` is used only by the server-side image upload route.

---

## 🎨 Design & Animation Architecture (Mirrored from Video)

| Video Timestamp | Component | Interactive Behavior & Styling |
|---|---|---|
| **`0:00 - 0:03`** | `HeroSection.tsx` | **Interactive Fanning Card Deck**: 5 3D cards at `-14°` to `+14°` that dynamically spread, elevate (`scale: 1.08`), and straighten on hover with spring physics. |
| **`0:04 - 0:06`** | `ValuePropositionSection.tsx` | **Card Shuffling & Proposition**: Bold pitch paired with interactive stacked cards displaying real project architecture specs. |
| **`0:07 - 0:12`** | `CinematicFeaturedBanner.tsx` | **Coral Terracotta Banner (`#FF5238`)**: High-impact editorial showcase with creator portrait, batch badges, and department proof bar. |
| **`0:13 - 0:17`** | `UnfoldingCardDeckSection.tsx` | **Horizontal Unfolding Deck**: Smoothly fans out horizontally into 5 distinct cards on hover/click (`Audited Code`, `Staff Pick`, `APK Releases`, etc.). |
| **`0:18 - 0:20`** | `SegmentedVisionSection.tsx` | **Segmented Switch**: Interactive pill slider toggling between **Student Innovators** and **Judges & Faculty** with smooth layout transitions. |
| **`0:21 - 0:23`** | `CommunityArcSection.tsx` | **Curved Avatar Arc**: Arched circular ring of student builders surrounding the *"You will find yourself among us"* headline with popout reputation badges. |
| **`0:24 - 0:27`** | `BentoGridSection.tsx` | **Bento-Box Matrix**: Asymmetric cards for Repository Search, Dead-Link Health Daemon, Privacy-Preserving Recruiter Gateway, and Rubric Weights. |
| **`0:28 - 0:34`** | `ProjectDirectoryPreview.tsx` | **Categorized Project Directory**: Filter pills (`Web App`, `Android APK`, `AI/ML`, `Finalist`), real-time search, and verified GitHub/APK/Live links. |
| **`0:35 - 0:38`** | `NeonTickerMarquee.tsx` | **Electric Neon Lime (`#D4F62B`) Ticker**: Infinite horizontal scrolling ticker tape with high-contrast typography. |
| **Submission** | `SubmissionCallout.tsx` | **Student Submission Gateway**: Required checklist (repo, screenshots, 2-min demo video, consent) with Google SSO domain verification. |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript (strict type checking)
