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
  bio: "Aspiring AI/ML engineer with a passion for building real-world solutions. Love exploring new technologies, creating projects and learning something new every day.",
  role: "student",
  projectsCount: 3,
  publicationsCount: 2,
  followersCount: 5,
  profileCompleted: true,
};

export const FEATURED_PROJECTS: Project[] = [
  {
    id: "proj-journeybuddy",
    title: "JourneyBuddy AI",
    subtitle: "AI Travel Assistant",
    description:
      "An intelligent travel assistant that generates personalized travel itineraries, recommends places, and helps users plan their trips with ease using AI.",
    category: "Web Apps",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    heroVideoImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=300&q=80",
    ],
    tags: ["React", "FastAPI", "Firebase", "Google Maps"],
    teamSize: 3,
    projectType: "Web App",
    author: {
      name: "Bhushan Poojary",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      role: "Full-Stack Developer",
      college: "SMVITM, Udupi",
    },
    stars: 342,
    views: 1820,
    liveUrl: "https://journeybuddy.ai",
    githubUrl: "https://github.com/projecthub/journeybuddy",
    apkDownloadUrl: "https://projecthub.edu/downloads/journeybuddy.apk",
    featured: true,
    finalYearProject: true,
    publishedDate: "12 Mar 2025",
    problemStatement:
      "Travel planning can be time-consuming and overwhelming, with too much information scattered across multiple platforms.",
    solution:
      "An AI-powered assistant that brings everything together — planning, recommendations, and real-time updates.",
    teamMembers: [
      {
        name: "Bhushan Poojary",
        role: "Developer",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Pratik Shetty",
        role: "Developer",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "Sanjana Rao",
        role: "UI/UX Designer",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: "proj-mindshift",
    title: "MindShift AI",
    subtitle: "Mental Health Assistant",
    description:
      "AI-powered mental health companion with sentiment analysis and voice input. Built to detect cognitive fatigue and recommend mindfulness pauses.",
    category: "Mobile Apps",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    tags: ["Android", "TensorFlow", "ML Kit"],
    teamSize: 4,
    projectType: "Mobile App",
    author: {
      name: "Ananya Hegde",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      role: "ML Researcher",
      college: "SMVITM, Udupi",
    },
    stars: 512,
    views: 2430,
    liveUrl: "https://mindshift-ai.demo",
    githubUrl: "https://github.com/projecthub/mindshift-ai",
    featured: true,
    publishedDate: "18 Feb 2025",
  },
  {
    id: "proj-cropmate",
    title: "CropMate",
    subtitle: "Smart Agriculture",
    description:
      "Soil and crop analysis using NPK/pH sensors and ML model. Predicts yield fluctuations and automates drip irrigation telemetry.",
    category: "AI / ML",
    status: "Under Review",
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80",
    tags: ["Python", "Firebase", "TFLite"],
    teamSize: 4,
    projectType: "Mobile App",
    author: {
      name: "Rohan Kamath",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      role: "IoT & Embedded Engineer",
      college: "SMVITM, Udupi",
    },
    stars: 289,
    views: 1490,
    liveUrl: "https://cropmate-agri.demo",
    githubUrl: "https://github.com/projecthub/cropmate",
    featured: true,
    publishedDate: "05 Jan 2025",
  },
  {
    id: "proj-guardian",
    title: "Guardian AI",
    subtitle: "CCTV Surveillance",
    description:
      "Real-time threat detection using YOLOv8 and deep learning models. Detects unauthorized perimeter breaches with sub-second alert latency.",
    category: "Hardware",
    status: "Under Review",
    image:
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80",
    tags: ["Python", "OpenCV", "YOLOv8"],
    teamSize: 4,
    projectType: "Web App",
    author: {
      name: "Karthik Shenoy",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      role: "Computer Vision Lead",
      college: "SMVITM, Udupi",
    },
    stars: 198,
    views: 980,
    liveUrl: "https://guardian-vision.demo",
    githubUrl: "https://github.com/projecthub/guardian-ai",
    featured: true,
    publishedDate: "24 Jan 2025",
  },
  {
    id: "proj-aavarta",
    title: "AAVARTA",
    subtitle: "Disaster Management",
    description:
      "Rapid geospatial disaster mapping and emergency volunteer dispatch mesh with offline map caching.",
    category: "Web Apps",
    status: "Draft",
    image:
      "https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=800&q=80",
    tags: ["Next.js", "Node.js", "Mapbox"],
    teamSize: 3,
    projectType: "Web App",
    author: {
      name: "Bhushan Poojary",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      role: "Core Developer",
      college: "SMVITM, Udupi",
    },
    stars: 84,
    views: 420,
    publishedDate: "1 week ago",
  },
  {
    id: "proj-mauri",
    title: "Mauri - Sign Language Avatar",
    subtitle: "Accessibility & Assistive Tech",
    description:
      "Real-time 3D expressive avatar translating speech and audio into regional Indian sign language gestures.",
    category: "AI / ML",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    tags: ["Android", "Three.js", "MediaPipe"],
    teamSize: 3,
    projectType: "Mobile App",
    author: {
      name: "Divya Acharya",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      role: "Graphics Engineer",
      college: "SMVITM, Udupi",
    },
    stars: 640,
    views: 3100,
    publishedDate: "14 Feb 2025",
  },
  {
    id: "proj-ambucare",
    title: "AmbuCare+",
    subtitle: "Emergency Fleet Routing",
    description:
      "Dynamic green corridor traffic signal synchronization for ambulances with automated hospital ICU bed reservation.",
    category: "Web Apps",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=800&q=80",
    tags: ["React", "FastAPI", "WebSockets"],
    teamSize: 4,
    projectType: "Web App",
    author: {
      name: "Suhas Bhat",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      role: "Systems Architect",
      college: "SMVITM, Udupi",
    },
    stars: 430,
    views: 2200,
    publishedDate: "28 Feb 2025",
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
