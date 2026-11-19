import { StudentProfile, Project, UserRole } from "../firebase/types";

export const generateStudentCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PH-2026-${random}`;
};

export const createEmptyStudentProfile = (
  uid: string = "",
  email: string = "",
  fullName: string = "",
  role: UserRole = "student"
): StudentProfile => ({
  uid,
  photoURL: "",
  fullName,
  email,
  phoneNumber: "",
  countryCode: "+91",
  dateOfBirth: "",
  college: "Shri Madhwa Vadiraja Institute of Technology & Management",
  usn: "",
  department: "",
  year: "",
  branch: "",
  gender: "",
  skills: [],
  bio: "",
  role,
  studentCode: "",
  projectsCount: 0,
  publicationsCount: 0,
  followersCount: 0,
  profileCompleted: false,
});

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  uid: "student-default-uid",
  photoURL:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  fullName: "Bhushan Bhaskar Poojary",
  email: "bhushan@example.com",
  phoneNumber: "98765 43210",
  countryCode: "+91",
  dateOfBirth: "2006-05-20",
  college: "Shri Madhwa Vadiraja Institute of Technology & Management",
  usn: "4MV23AI001",
  department: "Artificial Intelligence & Data Science",
  year: "4th Year",
  branch: "AI & DS",
  gender: "Male",
  skills: ["Python", "React", "JavaScript", "Firebase"],
  bio: "Aspiring AI/ML engineer with a passion for building real-world solutions.",
  role: "student",
  projectsCount: 1,
  publicationsCount: 0,
  followersCount: 5,
  profileCompleted: true,
};

// Exactly ONE clean demo project as baseline for showcase
export const FEATURED_PROJECTS: Project[] = [
  {
    id: "proj-demo-showcase",
    title: "Demo Project: Smart Campus IoT Hub",
    subtitle: "Real-Time Sensor Network & Energy Management System",
    description:
      "A flagship demonstration project showcasing distributed IoT edge nodes tracking campus environmental metrics, smart power consumption, and automated lighting controls with real-time analytics.",
    category: "Hardware",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    heroVideoImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
    ],
    tags: ["IoT", "Arduino", "ESP32", "Next.js", "Firebase", "MQTT"],
    teamSize: 3,
    projectType: "Hardware / Embedded",
    author: {
      name: "Campus Innovation Cell",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      role: "Department Showcase",
      college: "SMVITM, Udupi",
    },
    stars: 128,
    views: 940,
    liveUrl: "https://workspace-aed6b.firebaseapp.com",
    githubUrl: "https://github.com",
    featured: true,
    finalYearProject: false,
    publishedDate: "15 Jan 2025",
    problemStatement:
      "Colleges need real-time data visibility into energy usage and lab resource distribution to prevent wasted power and automate environmental adjustments.",
    solution:
      "Low-cost ESP32 sensor clusters streaming telemetry over MQTT to a centralized web dashboard with anomaly alerts and power savings recommendations.",
    teamMembers: [
      {
        name: "Campus Innovation Cell",
        role: "Lead Developers",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
];

export const COLLEGE_OPTIONS = [
  "Shri Madhwa Vadiraja Institute of Technology & Management",
];

export const DEPARTMENT_OPTIONS = [
  "Artificial Intelligence & Data Science",
  "Computer Science & Engineering",
  "Information Science & Engineering",
  "Electronics & Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
];

export const BATCH_OPTIONS = [
  "2026 Batch",
  "2025 Batch",
  "2024 Batch",
  "2023 Batch",
  "2022 Batch",
  "2021 Batch",
  "Earlier Batch",
];

export const YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Alumni / Graduate",
];

export const BRANCH_OPTIONS = [
  "AI & DS",
  "CSE",
  "ISE",
  "ECE",
  "MECH",
  "CIVIL",
];

export const POPULAR_SKILLS = [
  "Python",
  "React",
  "JavaScript",
  "TypeScript",
  "Next.js",
  "Node.js",
  "Firebase",
  "FastAPI",
  "Tailwind CSS",
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "OpenCV",
  "Flutter",
  "Android",
  "Docker",
  "AWS",
  "Figma",
  "UI/UX Design",
  "PostgreSQL",
  "MongoDB",
  "Git & GitHub",
  "IoT & Arduino",
];
