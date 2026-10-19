export interface ArtCard {
  id: string;
  title: string;
  author: string;
  tag: string;
  accent: string;
  image: string;
  baseRotate: number;
  baseX: number;
  baseY: number;
  zIndex: number;
}

export const ORIGINAL_HERO_CARDS: ArtCard[] = [
  {
    id: "card-1",
    title: "Vector Mesh '26",
    author: "Zane Vance",
    tag: "Vector DB",
    accent: "#E63946",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=700&q=85",
    baseRotate: -12,
    baseX: -340,
    baseY: 26,
    zIndex: 10,
  },
  {
    id: "card-2",
    title: "Spatial Canvas 3D",
    author: "Elena Rostova",
    tag: "Three.js & WebGL",
    accent: "#3A86FF",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=85",
    baseRotate: -6,
    baseX: -170,
    baseY: 10,
    zIndex: 12,
  },
  {
    id: "card-3",
    title: "HyperScale Core",
    author: "Luca Morretti",
    tag: "Distributed Engine",
    accent: "#D62828",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=85",
    baseRotate: 0,
    baseX: 0,
    baseY: -4,
    zIndex: 25,
  },
  {
    id: "card-4",
    title: "Autonomous Agent Kit",
    author: "Samira Khan",
    tag: "AI Workflows",
    accent: "#0077B6",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=700&q=85",
    baseRotate: 6,
    baseX: 170,
    baseY: 10,
    zIndex: 12,
  },
  {
    id: "card-5",
    title: "Modern Micro-SaaS",
    author: "Darius Ward",
    tag: "Fullstack Framework",
    accent: "#2A9D8F",
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=700&q=85",
    baseRotate: 12,
    baseX: 340,
    baseY: 26,
    zIndex: 10,
  },
];

export const PARTNER_LOGOS = [
  { name: "Mercury", label: "MERCURY" },
  { name: "Remote", label: "remote" },
  { name: "Miro", label: "miro" },
  { name: "Databricks", label: "databricks" },
  { name: "Linear", label: "Linear" },
  { name: "Qonto", label: "Qonto" },
  { name: "Vercel", label: "▲ Vercel" },
  { name: "Supabase", label: "⚡ Supabase" },
];

export const TRUST_PARTNERS = PARTNER_LOGOS;

export const AVATAR_COMMUNITY = [
  { id: 1, name: "Priya N.", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80", role: "AI Vision Lead" },
  { id: 2, name: "Aarav S.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", role: "Fullstack Architect" },
  { id: 3, name: "Rhea S.", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80", role: "Creative WebGL Dev" },
  { id: 4, name: "Karan V.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", role: "Distributed Systems" },
  { id: 5, name: "Ananya R.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", role: "Cloud Infrastructure" },
  { id: 6, name: "Devansh P.", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80", role: "Mobile SDK Engineer" },
];

export const STUDENT_CREATORS = [
  {
    id: 1,
    name: "Priya N.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    role: "AI Vision Lead",
    batch: "Batch '26",
    project: "Neural Canvas AI",
    followers: "4.8k",
  },
  {
    id: 2,
    name: "Aarav S.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    role: "Fullstack Architect",
    batch: "Batch '25",
    project: "HyperScale Vector Store",
    followers: "3.2k",
  },
  {
    id: 3,
    name: "Rhea S.",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    role: "Creative WebGL Dev",
    batch: "Batch '26",
    project: "Fluid Motion Engine",
    followers: "5.1k",
  },
  {
    id: 4,
    name: "Karan V.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    role: "Distributed Systems",
    batch: "Batch '24",
    project: "Enterprise API Hub",
    followers: "2.9k",
  },
  {
    id: 5,
    name: "Ananya R.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    role: "Cloud Infrastructure",
    batch: "Batch '25",
    project: "Automated Code Auditing",
    followers: "6.4k",
  },
  {
    id: 6,
    name: "Devansh P.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    role: "Mobile SDK Engineer",
    batch: "Batch '26",
    project: "Micro-SaaS Boilerplate",
    followers: "3.7k",
  },
];

export const HERO_CARDS = [
  {
    id: "card-1",
    title: "Vector Mesh '26",
    label: "Vector DB",
    category: "Infrastructure",
    stars: "4.9",
    badge: "Verified Build",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=700&q=85",
    rot: -12,
    xOffset: -320,
    yOffset: 24,
  },
  {
    id: "card-2",
    title: "Spatial Canvas 3D",
    label: "WebGL",
    category: "Graphics & 3D",
    stars: "4.8",
    badge: "Verified Build",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=85",
    rot: -6,
    xOffset: -160,
    yOffset: 8,
  },
  {
    id: "card-3",
    title: "HyperScale Core",
    label: "AI Engine",
    category: "Systems & ML",
    stars: "5.0",
    badge: "Staff Pick",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=85",
    rot: 0,
    xOffset: 0,
    yOffset: -6,
  },
  {
    id: "card-4",
    title: "Autonomous Agent Kit",
    label: "Workflows",
    category: "Developer Tools",
    stars: "4.7",
    badge: "Verified Build",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=700&q=85",
    rot: 6,
    xOffset: 160,
    yOffset: 8,
  },
  {
    id: "card-5",
    title: "Modern Micro-SaaS",
    label: "Fullstack",
    category: "Web Applications",
    stars: "4.9",
    badge: "Verified Build",
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=700&q=85",
    rot: 12,
    xOffset: 320,
    yOffset: 24,
  },
];
