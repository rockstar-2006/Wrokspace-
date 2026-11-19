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

## 🛡️ Host / Admin Console (`/admin`)

Sign in at **`/admin/login`** with a Google account listed in `ADMIN_EMAILS` (comma separated, in `.env.local`).
Access is checked by middleware, the server layout, and again inside every `/api/admin/*` route.

| Page | What the Host can do |
|---|---|
| **Overview** | KPIs, submissions per day (30d), pipeline by status, category/department breakdown, oldest pending, account health, recent admin activity |
| **Review queue** | Oldest-first queue with SLA flags, submission checklist, link-health check, canned feedback, Approve / Request changes / Reject / Archive |
| **Projects** | Every project in any status: search, filters, sort, bulk approve/reject/archive/feature/delete, edit listing, review history, CSV export |
| **Users** | Every account: search & filters, profile + owned projects, change role, suspend/reactivate (blocks sign-in), delete (optionally with projects), CSV export |
| **Audit log** | Who did what, when, why, with before → after values; filter + CSV export |
| **Portal settings** | Open/close submissions, dashboard announcement banner, allowed sign-in email domains, review SLA hours |

Reviewer feedback appears on the student's **My Projects** page, and “Changes requested” projects can be resubmitted.

## 🔒 Firestore lock-down (security rules + Admin SDK)

`firestore.rules` restricts the browser to:
- **users** – read/edit only your own `users/{uid}`; can't change `role`, `accountStatus`, or suspension fields; can't delete.
- **projects** – anyone can read `Published`; owners read/create/edit/delete their own; students can only set `Draft` or `Pending review`; `featured` and the review fields are Host-only.
- **auditLogs**, **settings**, and anything else – no client access.

The Host console and trusted routes use the **Firebase Admin SDK** (which bypasses rules). Students sign in with real Firebase Auth (Google, or email/USN + password). A pre-lockdown profile (`email_…`, `usn_…`, `google_…` ids) is moved to the student's real account the first time they sign in (`/api/account/claim-legacy`, recorded in the audit log).

**Go-live order (do it in this order):**
1. Firebase Console → **Authentication → Sign-in method** → enable **Email/Password** (Google is already on).
2. Firebase Console → **Project settings → Service accounts → Generate new private key**. Save the JSON in the project folder (the `*-firebase-adminsdk-*.json` name is git-ignored) and set `FIREBASE_SERVICE_ACCOUNT_PATH=<file name>` in `.env.local`. Restart `npm run dev`.
3. Open `/admin` and confirm projects and users load.
4. Test locally (emulators only, needs Java): `npm run test:rules` for the security rules, and `npm run test:claim` for the account upgrade and teammate lookup routes.
   If the app is also hosted (e.g. Vercel), deploy this code and add `FIREBASE_SERVICE_ACCOUNT_KEY` there **before** step 5. Otherwise the live site will break when the rules switch on.
5. Deploy the rules: `npx firebase login`, then `npm run deploy:rules`. You can also paste `firestore.rules` into Console → Firestore → Rules → Publish.

Students who used email/USN login need to choose a password the next time they sign in. Register-number accounts can't receive reset emails, so if one of them forgets their password, delete the account in the Host console and they can sign up again.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript (strict type checking)
