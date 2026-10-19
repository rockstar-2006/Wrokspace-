# ProjectHub — Firebase Architecture & Authentication System

## 1. Overview
This module implements a company-level, enterprise architecture connecting **ProjectHub** with **Firebase Auth** and **Firestore** (`workspace-aed6b`).

---

## 2. File Organization
```
lib/
├── firebase/
│   ├── config.ts         # Firebase credentials & Identity Toolkit REST endpoints
│   ├── types.ts          # Strongly typed models: AuthUser, StudentProfile, Project
│   ├── authService.ts    # Authentication & Profile management services
│   ├── index.ts          # Barrel export for unified imports
│   └── README.md         # Architecture documentation
├── context/
│   └── AuthContext.tsx   # React Context Provider managing auth session & live profile state
├── data/
│   └── mockData.ts       # Curated default student profiles and featured projects
components/
├── auth/
│   ├── RoleSelector.tsx      # Tab switcher for Student / User login roles
│   └── ProjectShowcase3D.tsx # 3D perspective floating mockups with GSAP motion
├── dashboard/
│   ├── DashboardSidebar.tsx  # Left sidebar with active state and platform promo card
│   ├── DashboardHeader.tsx   # Search bar, notifications, and user profile avatar
│   ├── WelcomeBanner3D.tsx   # Welcome hero banner with 3D code window and category pills
│   ├── ProjectCard.tsx       # Live status badges, tech stack tags, and team telemetry
│   └── ProjectDetailsModal.tsx # Full-featured interactive modal with source code links
├── profile/
│   └── ProfilePreviewCard.tsx # Real-time interactive student card and quick info preview
app/
├── login/page.tsx            # Login Page (Image 1 design)
├── dashboard/page.tsx        # Student Dashboard (Image 2 design)
└── dashboard/profile/page.tsx# Complete Your Profile (Image 3 design)
```

---

## 3. Role-Based Login
- **Student**: Default student login. Grants access to student dashboard and capstone showcase.
- **User**: General stakeholder / guest access. Can explore projects, follow students, and review repositories.
- **Admin**: Configured at backend level for department heads and faculty evaluators.

---

## 4. Complete Your Profile Flow
1. **Profile Picture**: Uploads photo with local FileReader preview and storage.
2. **Basic Information**: Full name, college email, country code + phone number, date of birth.
3. **Education Information**: College, USN / Roll number, Department, Academic Year, and Branch.
4. **Additional Details**: Gender selection, dynamic interactive skills chips (add/remove), and bio counter.
5. **Live Interactive Preview**: Updates in real-time as the student inputs information.
