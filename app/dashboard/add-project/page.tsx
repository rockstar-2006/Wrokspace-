"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  Code2,
  Globe,
  Smartphone,
  Monitor,
  Brain,
  Cpu,
  Settings,
  Calendar,
  Lightbulb,
  Upload,
  X,
  Plus,
  Trash2,
  Github,
  Video,
  FileText,
  Users,
  Rocket,
  Star,
  BookOpen,
  Search,
  Bell,
} from "lucide-react";
import { gsap, ScrollTrigger, Flip } from "@/lib/gsapUtils";
import ModernBottomNav from "@/components/dashboard/ModernBottomNav";
import ProjectCard from "@/components/dashboard/ProjectCard";
import SplitTextHeading from "@/components/animations/SplitTextHeading";
import ScrambleText from "@/components/animations/ScrambleText";
import TypewriterText from "@/components/animations/TypewriterText";
import PageTransitionWrapper from "@/components/animations/PageTransitionWrapper";
import ParallaxContainer from "@/components/animations/ParallaxContainer";
import { useAuth } from "@/lib/context/AuthContext";
import { AuthService } from "@/lib/firebase/authService";
import { FirestoreService } from "@/lib/firebase/firestoreService";
import { compressAndUploadImage } from "@/lib/utils/imageCompressor";
import {
  Project,
  ProjectCategory,
  ProjectStatus,
  ProjectTeamMember,
  StudentProfile,
} from "@/lib/firebase/types";

// Domains / Categories
const DOMAIN_OPTIONS = [
  "Healthcare & Medical",
  "Agriculture & Rural Tech",
  "Education & E-Learning",
  "FinTech & Decentralized Finance",
  "Cybersecurity & Privacy",
  "IoT & Smart Infrastructure",
  "Environmental & Green Tech",
  "Artificial Intelligence & Machine Learning",
  "Social Good & Community",
  "E-Commerce & Logistics",
  "Gaming & Entertainment",
  "Others",
];

// Project Types matching the 6 interactive buttons
const PROJECT_TYPES = [
  { id: "Web Application", label: "Web Application", icon: Globe },
  { id: "Mobile App", label: "Mobile App", icon: Smartphone },
  { id: "Desktop App", label: "Desktop App", icon: Monitor },
  { id: "AI / ML", label: "AI / ML", icon: Brain },
  { id: "Hardware", label: "Hardware", icon: Cpu },
  { id: "Others", label: "Others", icon: Settings },
];

const DEPARTMENT_CHOICES = [
  "Artificial Intelligence & Data Science",
  "Computer Science & Engineering",
  "Information Science & Engineering",
  "Electronics & Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Others",
];

const BRANCH_CHOICES = [
  "AI & DS",
  "CSE",
  "ISE",
  "ECE",
  "ME",
  "Civil",
  "Others",
];

const POPULAR_TECHS = [
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "TensorFlow",
  "PyTorch",
  "Flutter",
  "Node.js",
  "Firebase",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "Arduino",
  "ESP32",
  "Tailwind CSS",
  "FastAPI",
  "OpenCV",
  "GraphQL",
];

export default function AddNewProjectPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const projectTypesRef = useRef<HTMLDivElement>(null);

  // Stepper State: 1 to 5
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Top Page ScrollTrigger Scrubbed Reading Progress Bar
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (scrollProgressRef.current) {
            scrollProgressRef.current.style.width = `${self.progress * 100}%`;
          }
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // ════════ Step 1: Basic Details ════════
  const [title, setTitle] = useState("");
  const [projectType, setProjectType] = useState("Web Application");
  const [customProjectType, setCustomProjectType] = useState("");
  const [domain, setDomain] = useState("Healthcare & Medical");
  const [customDomain, setCustomDomain] = useState("");
  const [briefDescription, setBriefDescription] = useState("");
  const [college, setCollege] = useState(
    profile.college || "Shri Madhwa Vadiraja Institute of Technology & Management"
  );
  const [department, setDepartment] = useState(
    profile.department || "Artificial Intelligence & Data Science"
  );
  const [customDepartment, setCustomDepartment] = useState("");
  const [usn, setUsn] = useState(profile.usn || "");
  const [year, setYear] = useState(profile.year || "4th Year");
  const [branch, setBranch] = useState(profile.branch || "AI & DS");
  const [customBranch, setCustomBranch] = useState("");
  const [projectDuration, setProjectDuration] = useState("Aug 2025 - Dec 2025");
  const [projectStatus, setProjectStatus] = useState<"Ongoing" | "Completed" | "Under Review">(
    "Completed"
  );
  const [coverImage, setCoverImage] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // ════════ Step 2: Project Overview ════════
  const [problemStatement, setProblemStatement] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([
    "Real-time data synchronization",
    "Smart AI prediction model",
    "Responsive modern student interface",
  ]);
  const [newFeature, setNewFeature] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([
    "React",
    "Next.js",
    "Firebase",
  ]);
  const [customTechInput, setCustomTechInput] = useState("");
  const [challengesFaced, setChallengesFaced] = useState("");
  const [futureEnhancements, setFutureEnhancements] = useState("");
  const [projectOutcomes, setProjectOutcomes] = useState("");

  // ════════ Step 3: Media & Links ════════
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [apkDownloadUrl, setApkDownloadUrl] = useState("");
  const [presentationPdfUrl, setPresentationPdfUrl] = useState("");
  const [projectReportPdfUrl, setProjectReportPdfUrl] = useState("");

  // ════════ Step 4: Team & Guide ════════
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<ProjectTeamMember[]>([]);
  const [facultyGuide, setFacultyGuide] = useState("");
  const [facultyDepartment, setFacultyDepartment] = useState(
    profile.department || "Artificial Intelligence & Data Science"
  );
  const [profileCodeInput, setProfileCodeInput] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [foundStudent, setFoundStudent] = useState<StudentProfile | null>(null);

  // ════════ Step 5: Review & Submit ════════
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<ProjectStatus | null>(null);

  // ════════ Edit Mode State ════════
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [existingProject, setExistingProject] = useState<Project | null>(null);
  const [isLoadingProjectData, setIsLoadingProjectData] = useState(false);

  // Auto-init logged-in student as Team Leader on mount (only for new projects)
  useEffect(() => {
    if (editingProjectId) return;
    if (profile.fullName && teamMembers.length === 0) {
      setTeamMembers([
        {
          name: profile.fullName,
          role: "Team Leader / Project Lead",
          avatar: profile.photoURL || "",
          studentCode: profile.studentCode,
          usn: profile.usn,
          department: profile.department,
          college: profile.college,
          isLeader: true,
        },
      ]);
    }
    if (profile.college) setCollege(profile.college);
    if (profile.department) {
      setDepartment(profile.department);
      setFacultyDepartment(profile.department);
    }
    if (profile.usn) setUsn(profile.usn);
    if (profile.year) setYear(profile.year);
    if (profile.branch) setBranch(profile.branch);
  }, [profile, editingProjectId]);

  // Load project for edit or draft from storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit") || params.get("id");

    if (editId) {
      setEditingProjectId(editId);
      setIsLoadingProjectData(true);

      const loadExistingProject = async () => {
        try {
          const proj = await FirestoreService.getProjectById(editId, user?.uid || profile?.uid);
          if (proj) {
            setExistingProject(proj);
            if (proj.title) setTitle(proj.title);

            // Project Type mapping
            if (proj.projectType) {
              const matchedType = PROJECT_TYPES.find((pt) => pt.id === proj.projectType);
              if (matchedType) {
                setProjectType(proj.projectType);
              } else {
                setProjectType("Others");
                setCustomProjectType(proj.projectType);
              }
            }

            // Domain mapping
            if (proj.subtitle) {
              if (DOMAIN_OPTIONS.includes(proj.subtitle)) {
                setDomain(proj.subtitle);
              } else {
                setDomain("Others");
                setCustomDomain(proj.subtitle);
              }
            }

            if (proj.description) setDetailedDescription(proj.description);
            if (proj.objectives || proj.description) {
              setBriefDescription(proj.objectives || proj.description);
            }
            if (proj.problemStatement) setProblemStatement(proj.problemStatement);
            if (proj.solution) setProposedSolution(proj.solution);
            if (proj.outcomes) setProjectOutcomes(proj.outcomes);
            if (proj.challenges) setChallengesFaced(proj.challenges);
            if (proj.futureEnhancements) setFutureEnhancements(proj.futureEnhancements);

            // Tech Stack (clean split of legacy comma-separated values & deduplicate)
            if (proj.tags && Array.isArray(proj.tags)) {
              const cleanedTags = proj.tags
                .flatMap((t: string) => (typeof t === "string" ? t.split(/[,;\n]+/) : []))
                .map((t: string) => t.trim())
                .filter(Boolean);
              const unique = Array.from(new Set(cleanedTags));
              if (unique.length > 0) {
                setSelectedTechs(unique);
              }
            }

            if (proj.features && Array.isArray(proj.features) && proj.features.length > 0) {
              setFeatures(proj.features);
            }

            if (proj.image) setCoverImage(proj.image);
            if (proj.galleryImages && Array.isArray(proj.galleryImages)) {
              setScreenshots(proj.galleryImages);
            }

            if (proj.githubUrl) setGithubUrl(proj.githubUrl);
            if (proj.liveUrl) setLiveUrl(proj.liveUrl);
            if (proj.videoUrl) setDemoVideoUrl(proj.videoUrl);
            if (proj.apkDownloadUrl) setApkDownloadUrl(proj.apkDownloadUrl);
            if (proj.presentationPdfUrl) setPresentationPdfUrl(proj.presentationPdfUrl);

            if (proj.teamName) setTeamName(proj.teamName);
            if (proj.teamMembers && Array.isArray(proj.teamMembers) && proj.teamMembers.length > 0) {
              setTeamMembers(proj.teamMembers);
            }
            if (proj.facultyGuide) setFacultyGuide(proj.facultyGuide);
            if (proj.facultyDepartment) setFacultyDepartment(proj.facultyDepartment);

            if (proj.academicYear) setYear(proj.academicYear);
            if (proj.batch) setProjectDuration(proj.batch);
            if (proj.author?.college) setCollege(proj.author.college);

            setPolicyAccepted(true);
          }
        } catch (err) {
          console.error("Failed to load project details for editing:", err);
        } finally {
          setIsLoadingProjectData(false);
        }
      };

      loadExistingProject();
      return;
    }

    // Normal draft loading for brand new projects
    try {
      const draftKey = user?.uid
        ? `projecthub_add_project_draft_${user.uid}`
        : "projecthub_add_project_draft";
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.title) setTitle(d.title);
        if (d.projectType) setProjectType(d.projectType);
        if (d.customProjectType) setCustomProjectType(d.customProjectType);
        if (d.domain) setDomain(d.domain);
        if (d.customDomain) setCustomDomain(d.customDomain);
        if (d.briefDescription) setBriefDescription(d.briefDescription);
        if (d.problemStatement) setProblemStatement(d.problemStatement);
        if (d.proposedSolution) setProposedSolution(d.proposedSolution);
        if (d.selectedTechs && Array.isArray(d.selectedTechs)) setSelectedTechs(d.selectedTechs);
        if (d.features && Array.isArray(d.features)) setFeatures(d.features);
        if (d.githubUrl) setGithubUrl(d.githubUrl);
        if (d.liveUrl) setLiveUrl(d.liveUrl);
        if (d.coverImage) setCoverImage(d.coverImage);
      }
    } catch {}
  }, [user?.uid, profile?.uid]);

  // Auto-save draft on every edit (ONLY when creating new project, never in edit mode)
  useEffect(() => {
    if (typeof window === "undefined" || !title || editingProjectId) return;
    try {
      const draftKey = user?.uid
        ? `projecthub_add_project_draft_${user.uid}`
        : "projecthub_add_project_draft";
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          title,
          projectType,
          customProjectType,
          domain,
          customDomain,
          briefDescription,
          problemStatement,
          proposedSolution,
          selectedTechs,
          features,
          githubUrl,
          liveUrl,
          coverImage,
        })
      );
    } catch {}
  }, [
    title,
    projectType,
    customProjectType,
    domain,
    customDomain,
    briefDescription,
    problemStatement,
    proposedSolution,
    selectedTechs,
    features,
    githubUrl,
    liveUrl,
    coverImage,
    user?.uid,
    editingProjectId,
  ]);

  // GSAP animated step completion and card transition
  const goToStep = (step: 1 | 2 | 3 | 4 | 5) => {
    setErrorMessage(null);

    // If progressing forward, animate the completed step badge with pop/halo
    if (step > currentStep) {
      const circleEl = document.getElementById(`step-indicator-${currentStep}`);
      if (circleEl) {
        gsap.timeline()
          .to(circleEl, { scale: 1.35, rotate: 8, duration: 0.18, ease: "back.out(2)" })
          .to(circleEl, { scale: 1, rotate: 0, duration: 0.22, ease: "power2.out" });
      }
    }

    if (formCardRef.current) {
      gsap.to(formCardRef.current, {
        opacity: 0,
        y: step > currentStep ? -14 : 14,
        scale: 0.99,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setCurrentStep(step);
          window.scrollTo({ top: 100, behavior: "smooth" });
          gsap.fromTo(
            formCardRef.current,
            { opacity: 0, y: step > currentStep ? 16 : -16, scale: 0.99 },
            { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "power2.out" }
          );
        },
      });
    } else {
      setCurrentStep(step);
      window.scrollTo({ top: 100, behavior: "smooth" });
    }
  };

  // Cover image upload with canvas compression to lightweight URL (< 50KB)
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingCover(true);
      try {
        const compressedUrl = await compressAndUploadImage(file, 900, 600, 0.75, "projects/covers");
        setCoverImage(compressedUrl);
      } catch (err) {
        console.error("Cover upload error:", err);
      } finally {
        setIsUploadingCover(false);
      }
    }
  };

  // Flip layout morphing when toggling project type
  const handleSelectProjectType = (typeId: string) => {
    if (typeId === projectType) return;
    if (typeof window !== "undefined" && projectTypesRef.current) {
      const state = Flip.getState(projectTypesRef.current.children);
      setProjectType(typeId);
      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 0.35,
          ease: "power2.out",
          scale: true,
        });
      });
    } else {
      setProjectType(typeId);
    }
  };

  // Screenshot upload with canvas compression to lightweight URL
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingScreenshot(true);
      try {
        const compressedUrl = await compressAndUploadImage(file, 1000, 750, 0.75, "projects/screenshots");
        setScreenshots((prev) => [...prev, compressedUrl]);
      } catch (err) {
        console.error("Screenshot upload error:", err);
      } finally {
        setIsUploadingScreenshot(false);
      }
    }
  };

  // Add Feature
  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  // Toggle Tech chip
  const toggleTech = (tech: string) => {
    const exists = selectedTechs.some((t) => t.toLowerCase() === tech.toLowerCase());
    if (exists) {
      setSelectedTechs(selectedTechs.filter((t) => t.toLowerCase() !== tech.toLowerCase()));
    } else {
      setSelectedTechs([...selectedTechs, tech]);
    }
  };

  // Remove specific Tech chip
  const removeTech = (techToRemove: string) => {
    setSelectedTechs(selectedTechs.filter((t) => t.toLowerCase() !== techToRemove.toLowerCase()));
  };

  // Add Custom Tech with multi-delimiter splitting (comma, semicolon, newline) and deduplication
  const handleAddCustomTech = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter") return;
    if (e) e.preventDefault();
    if (!customTechInput.trim()) return;

    const parts = customTechInput
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const existingLower = new Set(selectedTechs.map((t) => t.toLowerCase()));
    const toAdd: string[] = [];

    parts.forEach((part) => {
      if (!existingLower.has(part.toLowerCase())) {
        existingLower.add(part.toLowerCase());
        toAdd.push(part);
      }
    });

    if (toAdd.length > 0) {
      setSelectedTechs([...selectedTechs, ...toAdd]);
    }
    setCustomTechInput("");
  };

  // Student Profile Code Lookup
  const handleLookupStudent = () => {
    setLookupError(null);
    setFoundStudent(null);
    const code = profileCodeInput.trim().toUpperCase();
    if (!code) {
      setLookupError("Please enter a valid Student Profile Code (e.g. PH-2026-XXXX)");
      return;
    }

    const matched = AuthService.findStudentByCode(code);
    if (matched) {
      setFoundStudent(matched);
    } else {
      setLookupError(`No registered student found with profile code "${code}".`);
    }
  };

  // Add Found Student to Team
  const handleAddFoundStudent = () => {
    if (!foundStudent) return;
    const isAlreadyMember = teamMembers.some(
      (m) =>
        (m.studentCode && m.studentCode.toUpperCase() === foundStudent.studentCode?.toUpperCase()) ||
        m.name.toLowerCase() === foundStudent.fullName.toLowerCase()
    );

    if (isAlreadyMember) {
      setLookupError("This student is already added to the team.");
      return;
    }

    setTeamMembers([
      ...teamMembers,
      {
        name: foundStudent.fullName,
        role: "Team Contributor",
        avatar: foundStudent.photoURL || "",
        studentCode: foundStudent.studentCode,
        usn: foundStudent.usn,
        department: foundStudent.department,
        college: foundStudent.college,
        isLeader: false,
      },
    ]);
    setFoundStudent(null);
    setProfileCodeInput("");
    setLookupError(null);
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!title.trim()) {
      setErrorMessage("Please enter a project title.");
      return false;
    }
    if (projectType === "Others" && !customProjectType.trim()) {
      setErrorMessage("Please specify your custom project type.");
      return false;
    }
    if (domain === "Others" && !customDomain.trim()) {
      setErrorMessage("Please specify your custom domain / category.");
      return false;
    }
    if (!briefDescription.trim()) {
      setErrorMessage("Please enter a brief description (2-3 lines).");
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!problemStatement.trim()) {
      setErrorMessage("Please provide a problem statement.");
      return false;
    }
    if (!proposedSolution.trim()) {
      setErrorMessage("Please provide the proposed solution.");
      return false;
    }
    if (selectedTechs.length === 0) {
      setErrorMessage("Please select or add at least one technology used.");
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    if (projectType === "Web Application" && !liveUrl.trim() && !githubUrl.trim()) {
      setErrorMessage("Please provide either a GitHub repository or a live website link for web applications.");
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  // Submit Handler (Works for both New Submission and Edit/Update Mode)
  const handleSaveProject = async (status: ProjectStatus = "Pending review") => {
    if (status === "Pending review" && !policyAccepted) {
      setErrorMessage("Please accept the publishing and content authorization policy before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const projectId = editingProjectId || existingProject?.id || `proj-${Date.now().toString(36)}`;
      const slug = existingProject?.slug || title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const effectiveProjectType =
        projectType === "Others" && customProjectType.trim()
          ? customProjectType.trim()
          : projectType;

      const effectiveDomain =
        domain === "Others" && customDomain.trim()
          ? customDomain.trim()
          : domain;

      const effectiveDepartment =
        department === "Others" && customDepartment.trim()
          ? customDepartment.trim()
          : department;

      const effectiveBranch =
        branch === "Others" && customBranch.trim()
          ? customBranch.trim()
          : branch;

      // Map domain to standard ProjectCategory
      let categoryMapped: ProjectCategory = "Others";
      if (effectiveProjectType.toLowerCase().includes("web")) categoryMapped = "Web Apps";
      else if (effectiveProjectType.toLowerCase().includes("mobile") || effectiveProjectType.toLowerCase().includes("app")) categoryMapped = "Mobile Apps";
      else if (effectiveProjectType.toLowerCase().includes("ai") || effectiveProjectType.toLowerCase().includes("ml")) categoryMapped = "AI / ML";
      else if (effectiveProjectType.toLowerCase().includes("hardware")) categoryMapped = "Hardware";

      // If in edit mode and status is not explicitly changing, preserve existing status
      const resolvedStatus = status;

      const projectPayload: Project = {
        id: projectId,
        title: title.trim(),
        subtitle: effectiveDomain || effectiveProjectType,
        description: detailedDescription.trim() || briefDescription.trim(),
        category: categoryMapped,
        projectType: effectiveProjectType,
        status: resolvedStatus,
        image: coverImage || existingProject?.image || "/assets/add-project/hero-isometric.jpg",
        tags: selectedTechs.length > 0 ? selectedTechs : ["Tech"],
        teamSize: Math.max(teamMembers.length, 1),
        ownerId: user?.uid || profile.uid || existingProject?.ownerId || "anonymous",
        ownerCode: profile.studentCode || existingProject?.ownerCode || "",
        author: {
          name: profile.fullName || existingProject?.author?.name || "Student Creator",
          avatar: profile.photoURL || existingProject?.author?.avatar || "",
          role: "Lead Creator",
          college: college || profile.college || existingProject?.author?.college || "Shri Madhwa Vadiraja Institute of Technology & Management",
          studentCode: profile.studentCode || existingProject?.author?.studentCode,
        },
        problemStatement: problemStatement.trim(),
        solution: proposedSolution.trim(),
        features,
        objectives: briefDescription.trim(),
        outcomes: projectOutcomes.trim(),
        challenges: challengesFaced.trim(),
        futureEnhancements: futureEnhancements.trim(),
        academicYear: year || existingProject?.academicYear || "2025-2026",
        batch: projectDuration || existingProject?.batch || "Aug 2025 - Dec 2025",
        githubUrl: githubUrl.trim(),
        liveUrl: liveUrl.trim(),
        apkDownloadUrl: apkDownloadUrl.trim(),
        videoUrl: demoVideoUrl.trim(),
        presentationPdfUrl: presentationPdfUrl.trim(),
        galleryImages: screenshots.length > 0 ? screenshots : (existingProject?.galleryImages || []),
        teamName: teamName.trim() || existingProject?.teamName || `${title.split(" ")[0]} Team`,
        teamMembers,
        facultyGuide: facultyGuide.trim(),
        facultyDepartment: effectiveDepartment,
        stars: existingProject?.stars || 0,
        views: existingProject?.views || 1,
        slug,
        createdAt: existingProject?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Save to isolated user projects key (filter out previous version to avoid duplicates)
      const userProjectsKey = user?.uid
        ? `projecthub_projects_${user.uid}`
        : "projecthub_user_projects";

      const currentIsolated = localStorage.getItem(userProjectsKey);
      let isolatedList: Project[] = currentIsolated ? JSON.parse(currentIsolated) : [];
      isolatedList = isolatedList.filter((p) => p.id !== projectId);
      isolatedList.unshift(projectPayload);
      localStorage.setItem(userProjectsKey, JSON.stringify(isolatedList));

      // 2. Save to global registry
      const currentGlobal = localStorage.getItem("projecthub_user_projects");
      let globalList: Project[] = currentGlobal ? JSON.parse(currentGlobal) : [];
      globalList = globalList.filter((p) => p.id !== projectId);
      globalList.unshift(projectPayload);
      localStorage.setItem("projecthub_user_projects", JSON.stringify(globalList));

      // 3. Clear draft ONLY if it was a new project submission
      if (!editingProjectId) {
        const draftKey = user?.uid
          ? `projecthub_add_project_draft_${user.uid}`
          : "projecthub_add_project_draft";
        localStorage.removeItem(draftKey);
      }

      // 4. Persist to Firestore database
      await FirestoreService.saveProject(projectPayload);

      setSubmissionSuccess(status);
      setTimeout(() => {
        router.push("/dashboard/my-projects");
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save project. Please check connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = ((currentStep - 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 selection:bg-[#4338CA] selection:text-white flex flex-col">
      {/* ════════════ Top Header Navigation Bar ════════════ */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4338CA] to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-[#0F172A]">
              Project Hub
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg items-center relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects, technologies, or students..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Right Profile & Alerts */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 border-2 border-white" />
            </button>

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs overflow-hidden border border-slate-200">
                {profile.photoURL ? (
                  <Image
                    src={profile.photoURL}
                    alt={profile.fullName || "User"}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span>{profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "U"}</span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Top ScrollTrigger Scrubbed Reading Progress Line ── */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-200/50 pointer-events-none">
        <div
          ref={scrollProgressRef}
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-400 w-0 transition-all duration-75"
        />
      </div>

      {/* Floating Bottom Navigation Bar (No Left Sidebar!) */}
      <ModernBottomNav activeTab="submit" />

      {/* ════════════ Main Center Workspace with Parallax & PageTransition ════════════ */}
      <ParallaxContainer className="w-full">
        {/* Ambient Depth Blobs */}
        <div
          data-speed="-0.2"
          className="absolute top-10 right-20 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none"
        />
        <div
          data-speed="0.3"
          className="absolute top-96 left-10 w-96 h-96 bg-purple-100/25 rounded-full blur-3xl pointer-events-none"
        />

        <PageTransitionWrapper>
          <main className="max-w-[1360px] mx-auto px-4 sm:px-8 w-full flex-1 pt-6 relative z-10">
            {/* Back Link & Edit Status Banner */}
            <div className="flex items-center justify-between mb-3">
              <Link
                href="/dashboard/my-projects"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to My Projects</span>
              </Link>

              {editingProjectId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Editing Mode: {existingProject?.status || "Draft"}
                </span>
              )}
            </div>

            {/* ── Page Hero Header (With 3D Isometric Illustration) ── */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-[10px] font-bold tracking-tight mb-2 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <ScrambleText triggerOn="mount">
                    {editingProjectId ? "PROJECT UPDATE SUITE" : "STUDENT SUBMISSION WIZARD"}
                  </ScrambleText>
                </div>

                <SplitTextHeading
                  as="h1"
                  className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]"
                >
                  {editingProjectId ? "Edit Project" : "Add New Project"}
                </SplitTextHeading>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  {editingProjectId
                    ? "Modify your project overview, manage technologies, and update assets."
                    : "Share your creativity, build your portfolio and inspire others."}
                </p>
              </div>

              {/* Hand-drawn slogan & 3D Isometric floating card graphic with Parallax Speed */}
              <div className="relative flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="font-serif italic text-xs font-bold text-indigo-600 block transform -rotate-3">
                    {editingProjectId ? "Keep it updated!" : "Your ideas matter!"}
                  </span>
                  <span className="text-indigo-400 text-sm">⤵</span>
                </div>
                <div
                  data-speed="0.25"
                  className="relative w-36 h-24 sm:w-44 sm:h-28 rounded-2xl overflow-hidden shadow-md border border-slate-200/60 bg-white will-change-transform"
                >
                  <Image
                    src="/assets/add-project/hero-isometric.jpg"
                    alt="3D Project Hero"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Interactive AI Wizard Guidance Ticker with Typewriter Effect */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse shrink-0" />
                <span>AI Wizard Guidance:</span>
                <TypewriterText
                  words={[
                    "Add detailed problem statements to rank higher in departmental evaluation.",
                    "Include live demo links or GitHub repos to enable instant peer testing.",
                    "Highlight all your core libraries and frameworks in the tech stack.",
                    "Tag core tech competencies for recruiter portfolio discovery.",
                  ]}
                  className="text-indigo-600 font-bold"
                />
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                {editingProjectId && (
                  <span className="text-indigo-600 font-bold">(Click any step to jump)</span>
                )}
                <span>Step {currentStep} of 5</span>
              </div>
            </div>

            {/* ── 5-Step Stepper Bar with Animated Progress Line ── */}
            <div className="relative mb-6 px-2 sm:px-8">
              <div className="flex items-center justify-between relative z-10">
                {[
                  { step: 1, label: "Basic Details" },
                  { step: 2, label: "Project Overview" },
                  { step: 3, label: "Media & Links" },
                  { step: 4, label: "Team & Guide" },
                  { step: 5, label: "Review & Submit" },
                ].map((item) => {
                  const isActive = currentStep === item.step;
                  const isPassed = currentStep > item.step;

                  return (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => {
                        if (editingProjectId || item.step < currentStep) goToStep(item.step as any);
                      }}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                    >
                      <div
                        id={`step-indicator-${item.step}`}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 ring-4 ring-indigo-100 scale-105"
                            : isPassed
                            ? "bg-emerald-500 text-white shadow-2xs"
                            : "bg-white text-slate-400 border border-slate-200"
                        }`}
                      >
                        {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : item.step}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-bold text-center tracking-tight truncate max-w-[80px] sm:max-w-none ${
                          isActive
                            ? "text-[#4338CA]"
                            : isPassed
                            ? "text-slate-700"
                            : "text-slate-400"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Stepper Base Line */}
              <div className="absolute top-4 sm:top-4.5 left-10 right-10 h-[2.5px] bg-slate-200/80 -z-0" />
              {/* Animated Active Progress Fill Line */}
              <div
                className="absolute top-4 sm:top-4.5 left-10 h-[2.5px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 -z-0 transition-all duration-500 ease-out"
                style={{ width: `calc(${progressPercent}% * 0.88)` }}
              />
            </div>

            {/* Interactive Typewriter Guidance Callout */}
            <div className="mb-8 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-700 font-semibold shadow-2xs">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 animate-pulse" />
              <span>AI Wizard Tip:</span>
              <TypewriterText
                words={[
                  "Craft a crisp title and concise elevator pitch for evaluators.",
                  "Articulate specific problem statements and your innovative solution in Step 2.",
                  "Add a live demo URL or repo link in Step 3 to boost your credibility score.",
                  "Tag team contributors via verified USN codes to award academic credits.",
                ]}
                className="text-indigo-900 font-bold"
              />
            </div>

        {/* ── Error Banner if any ── */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between animate-shake">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Submission Success Banner ── */}
        {submissionSuccess && (
          <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Project successfully {submissionSuccess === "Draft" ? "saved as Draft" : "submitted for approval"}! Redirecting to dashboard...
            </span>
          </div>
        )}

        {/* ════════ Two-Column Grid: Form Left (8 cols) & Sidebar Right (4 cols) ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Form Container (8 Cols) ── */}
          <div className="lg:col-span-8">
            <div
              ref={formCardRef}
              className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 sm:p-8 relative min-h-[420px]"
            >
              {isLoadingProjectData ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-sm font-bold text-slate-800">Loading project details...</p>
                  <p className="text-xs text-slate-500 font-medium">
                    Fetching project specifications and tech stack...
                  </p>
                </div>
              ) : (
                <>
                  {/* ════════════ STEP 1: BASIC DETAILS ════════════ */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                      1
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        Basic Details
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Start with the essential information about your project.
                      </p>
                    </div>
                  </div>

                  {/* Row 1: Title & Project Type */}
                  <div className="space-y-4">
                    {/* Project Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Project Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your project title"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    {/* Project Type Buttons (6 Options) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Project Type <span className="text-rose-500">*</span>
                      </label>
                      <div ref={projectTypesRef} className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {PROJECT_TYPES.map((type) => {
                          const Icon = type.icon;
                          const isSelected = projectType === type.id;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => handleSelectProjectType(type.id)}
                              className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                                isSelected
                                  ? "bg-indigo-50/80 border-indigo-500 text-indigo-700 shadow-2xs"
                                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                              <span className="truncate">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Dynamic Custom Input when "Others" is chosen */}
                      {projectType === "Others" && (
                        <div className="mt-3 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 animate-fadeIn">
                          <label className="block text-xs font-bold text-indigo-900 mb-1">
                            Specify Custom Project Type <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={customProjectType}
                            onChange={(e) => setCustomProjectType(e.target.value)}
                            placeholder="e.g. IoT Drone, Robotics Arm, AR/VR Experience, Cyber Simulator..."
                            className="w-full px-3.5 py-2 rounded-xl border border-indigo-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Domain / Category & Brief Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Domain / Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        {DOMAIN_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>

                      {/* Dynamic Custom Input when Domain is "Others" */}
                      {domain === "Others" && (
                        <div className="mt-2.5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80 animate-fadeIn">
                          <label className="block text-xs font-bold text-indigo-900 mb-1">
                            Specify Custom Domain / Category <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            placeholder="e.g. Marine Robotics, Quantum Computing, Space Tech..."
                            className="w-full px-3.5 py-2 rounded-xl border border-indigo-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Brief Description <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {briefDescription.length}/200
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={200}
                        value={briefDescription}
                        onChange={(e) => setBriefDescription(e.target.value)}
                        placeholder="Write a short summary of your project (2–3 lines)."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 3: College & Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        College / Institution <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value="Shri Madhwa Vadiraja Institute of Technology & Management"
                        readOnly
                        disabled
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-slate-50 font-bold cursor-not-allowed select-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Department <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:border-indigo-500"
                      >
                        {DEPARTMENT_CHOICES.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>

                      {department === "Others" && (
                        <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 animate-fadeIn">
                          <input
                            type="text"
                            value={customDepartment}
                            onChange={(e) => setCustomDepartment(e.target.value)}
                            placeholder="Specify Department name..."
                            className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 4: USN, Year & Branch (3 Columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        USN / Roll Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={usn}
                        onChange={(e) => setUsn(e.target.value.toUpperCase())}
                        placeholder="Enter your USN / Roll number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Year <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Branch <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-500"
                      >
                        {BRANCH_CHOICES.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>

                      {branch === "Others" && (
                        <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 animate-fadeIn">
                          <input
                            type="text"
                            value={customBranch}
                            onChange={(e) => setCustomBranch(e.target.value)}
                            placeholder="Specify Branch name..."
                            className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 5: Project Duration & Project Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Project Duration <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          value={projectDuration}
                          onChange={(e) => setProjectDuration(e.target.value)}
                          placeholder="Start date - End date"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Project Status <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["Ongoing", "Completed", "Under Review"] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setProjectStatus(st)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                              projectStatus === st
                                ? "bg-indigo-600 text-white shadow-2xs"
                                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cover Image Upload (Auto-compressed to URL) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Project Thumbnail / Cover Image <span className="text-rose-500">*</span>
                    </label>
                    <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-xl bg-slate-200 overflow-hidden relative shrink-0">
                          {coverImage ? (
                            <Image
                              src={coverImage}
                              alt="Cover Preview"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Code2 className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {coverImage ? "Cover image ready" : "Upload high-quality project thumbnail"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Auto-compressed to ultra-light URL to protect Firestore limits.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleCoverUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploadingCover}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
                        >
                          {isUploadingCover ? "Compressing..." : "Choose Image"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Tip Callout (Exact Match to Reference Screenshot) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 via-blue-50/40 to-indigo-50/60 border border-amber-200/60 flex items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-tight">
                          Good projects solve real problems.
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">
                          Tell us what your project is about, what makes it special, and the impact it creates.
                        </p>
                      </div>
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep1()) goToStep(2);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 shrink-0 transition-all transform hover:scale-[1.02]"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ════════════ STEP 2: PROJECT OVERVIEW ════════════ */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                      2
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        Project Overview
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Explain the core problem, your proposed solution, and technologies used.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Problem Statement <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      placeholder="What specific issue or challenge does your project aim to solve?"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Proposed Solution <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={proposedSolution}
                      onChange={(e) => setProposedSolution(e.target.value)}
                      placeholder="Explain how your system or architecture solves this problem."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* Technologies Used (Searchable Palette + Multi-Select + Highlighted Badge Panel) */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-indigo-600" />
                        <span>Technologies & Tools Used</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      {selectedTechs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedTechs([])}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Active Tech Stack Highlight Panel */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-blue-50/70 border-2 border-indigo-200/90 shadow-2xs">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Active Tech Stack</span>
                          <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                            {selectedTechs.length}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Click (×) to remove any technology
                        </span>
                      </div>

                      {selectedTechs.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {selectedTechs.map((tech) => (
                            <span
                              key={tech}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-900 text-xs font-bold shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>{tech}</span>
                              <button
                                type="button"
                                onClick={() => removeTech(tech)}
                                className="p-0.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                                title={`Remove ${tech}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center border border-dashed border-indigo-200 rounded-xl bg-white/70">
                          <p className="text-xs text-slate-500 font-medium">
                            No technologies added yet. Pick from popular suggestions below or type custom tech tags.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Popular Tech Suggestions Palette */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Quick Add Popular Technologies:
                      </span>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {POPULAR_TECHS.map((tech) => {
                          const isSelected = selectedTechs.some(
                            (t) => t.toLowerCase() === tech.toLowerCase()
                          );
                          return (
                            <button
                              key={tech}
                              type="button"
                              onClick={() => toggleTech(tech)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-600 text-white shadow-2xs ring-2 ring-indigo-200"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60"
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-white" />
                              ) : (
                                <Plus className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span>{tech}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Tech Input with Comma Splitting */}
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customTechInput}
                          onChange={(e) => setCustomTechInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomTech();
                            }
                          }}
                          placeholder="Type tech stack (e.g. Pandas, NumPy, Chart.js, Express) and press Add or Enter"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomTech()}
                          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-2xs shrink-0 cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Tech</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                        💡 Tip: You can type multiple technologies separated by commas (e.g. <span className="font-mono text-indigo-600">pandas, numpy, chart.js</span>) and click Add.
                      </p>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Key Features
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add key feature..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                        >
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Step 2 Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep2()) goToStep(3);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                    >
                      <span>Next: Media & Links</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ════════════ STEP 3: MEDIA & LINKS ════════════ */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                      3
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        Media & Links
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Add screenshots, demo video URL, GitHub repository, and live links.
                      </p>
                    </div>
                  </div>

                  {/* Screenshots */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700">
                        Project Screenshots
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {screenshots.length} uploaded (At least 2 recommended)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      {screenshots.map((src, i) => (
                        <div key={i} className="relative h-20 rounded-xl overflow-hidden border border-slate-200 group">
                          <Image src={src} alt="Screenshot" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => setScreenshots(screenshots.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      <input
                        type="file"
                        ref={screenshotInputRef}
                        onChange={handleScreenshotUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingScreenshot}
                        onClick={() => screenshotInputRef.current?.click()}
                        className="h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 flex flex-col items-center justify-center text-slate-500 text-xs font-bold gap-1 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUploadingScreenshot ? "Saving..." : "+ Add Screenshot"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        GitHub Repository URL {projectType === "Web Application" && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username/project"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Live Website URL (If deployed)
                      </label>
                      <input
                        type="url"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        placeholder="https://myproject.vercel.app"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Demo Video URL (YouTube, Loom, Drive)
                      </label>
                      <input
                        type="url"
                        value={demoVideoUrl}
                        onChange={(e) => setDemoVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        APK / Application Download URL
                      </label>
                      <input
                        type="url"
                        value={apkDownloadUrl}
                        onChange={(e) => setApkDownloadUrl(e.target.value)}
                        placeholder="https://drive.google.com/apk-download"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep3()) goToStep(4);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                    >
                      <span>Next: Team & Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ════════════ STEP 4: TEAM & GUIDE ════════════ */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                      4
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        Team & Guide
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Add team members with verified Student Profile Codes (PH-2026-XXXX) and mentor details.
                      </p>
                    </div>
                  </div>

                  {/* Team Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Team Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Apex Innovators"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Student Profile Code Lookup Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <label className="block text-xs font-black text-indigo-950">
                          Add Team Member by Student Profile Code
                        </label>
                        <p className="text-[11px] text-indigo-800/80 mt-0.5">
                          Enter any student&apos;s unique UID code to look up their verified profile.
                        </p>
                      </div>

                      {/* Your own student code */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <span className="text-slate-400 text-[10px]">Your Code:</span>
                        <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-200 shadow-2xs">
                          {profile?.studentCode || "PH-2026-STU1"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={profileCodeInput}
                        onChange={(e) => setProfileCodeInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleLookupStudent();
                          }
                        }}
                        placeholder="e.g. PH-2026-DEMO or suffix"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-white text-xs font-mono font-bold text-indigo-950 uppercase placeholder-indigo-300 focus:outline-none focus:border-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={handleLookupStudent}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-2xs shrink-0"
                      >
                        Find Student
                      </button>
                    </div>

                    {/* Quick 1-Click Peer Demo Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className="text-[10px] text-indigo-700/80 font-bold">Quick add test classmate:</span>
                      {[
                        { code: "PH-2026-DEMO", name: "Pratik Shetty" },
                        { code: "PH-2026-ROBO", name: "Sanjana Rao" },
                        { code: "PH-2026-IOT1", name: "Arjun Hegde" },
                      ].map((sample) => (
                        <button
                          key={sample.code}
                          type="button"
                          onClick={() => {
                            setProfileCodeInput(sample.code);
                            setLookupError(null);
                            const matched = AuthService.findStudentByCode(sample.code);
                            if (matched) setFoundStudent(matched);
                          }}
                          className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-100/70 border border-indigo-200 text-indigo-800 text-[10px] font-mono font-bold transition-all shadow-2xs"
                        >
                          + {sample.code} ({sample.name})
                        </button>
                      ))}
                    </div>

                    {lookupError && (
                      <p className="text-xs font-bold text-rose-600 mt-2">{lookupError}</p>
                    )}

                    {/* Found Student Card */}
                    {foundStudent && (
                      <div className="mt-3 p-3.5 rounded-xl bg-white border border-indigo-200 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                            {foundStudent.fullName ? foundStudent.fullName.charAt(0) : "S"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{foundStudent.fullName}</p>
                            <p className="text-[10px] text-slate-500">
                              {foundStudent.studentCode} • {foundStudent.usn || "Student"} • {foundStudent.department}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddFoundStudent}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          + Add to Team
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Current Team Members List */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Current Team Members ({teamMembers.length})
                    </label>
                    <div className="space-y-2">
                      {teamMembers.map((member, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-slate-900">{member.name}</p>
                                {member.isLeader && (
                                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase">
                                    Leader
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {member.studentCode || member.usn || "Registered Student"}
                              </p>
                            </div>
                          </div>

                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Faculty Guide Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Faculty Guide / Mentor Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={facultyGuide}
                        onChange={(e) => setFacultyGuide(e.target.value)}
                        placeholder="e.g. Dr. Raghavendra Rao"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Guide Department
                      </label>
                      <input
                        type="text"
                        value={facultyDepartment}
                        onChange={(e) => setFacultyDepartment(e.target.value)}
                        placeholder="Department of AI & DS"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(5)}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                    >
                      <span>Next: Review & Submit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ════════════ STEP 5: REVIEW & SUBMIT ════════════ */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                      5
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        Review & Submit Project
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Confirm project details, accept authorization policy, and submit for department review.
                      </p>
                    </div>
                  </div>

                  {/* Live Card Preview Box */}
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-3">
                      Public Showcase Card Preview
                    </p>
                    <div className="max-w-sm mx-auto">
                      <ProjectCard
                        project={{
                          id: "preview",
                          title: title || "Untitled Project",
                          subtitle: (domain === "Others" ? customDomain : domain) || (projectType === "Others" ? customProjectType : projectType),
                          description: briefDescription || "Project overview will appear here...",
                          category: ((domain === "Others" ? customDomain : domain) || (projectType === "Others" ? customProjectType : projectType) || "Web Apps") as any,
                          projectType: projectType === "Others" ? customProjectType || "Custom" : projectType,
                          status: "Pending review",
                          image: coverImage || "/assets/add-project/hero-isometric.jpg",
                          tags: selectedTechs.length > 0 ? selectedTechs : ["Tech"],
                          teamSize: Math.max(teamMembers.length, 1),
                          academicYear: year,
                          author: {
                            name: profile.fullName || "Student Creator",
                            avatar: profile.photoURL || "",
                            role: "Lead Creator",
                            college: college || "Engineering College",
                            studentCode: profile.studentCode,
                          },
                        }}
                        isInteractive={false}
                      />
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="policyCheck"
                      checked={policyAccepted}
                      onChange={(e) => setPolicyAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="policyCheck" className="text-xs text-slate-700 font-medium leading-relaxed cursor-pointer">
                      I confirm that all team members have consented to this submission, the source code and files are authentic academic work, and I agree to the department showcase and review policy.
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => goToStep(4)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                    >
                      ← Back to Team
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSaveProject("Draft")}
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        {editingProjectId ? "Save Changes as Draft" : "Save as Draft"}
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          handleSaveProject(
                            existingProject?.status === "Published"
                              ? "Published"
                              : "Pending review"
                          )
                        }
                        className="flex-1 sm:flex-initial px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] cursor-pointer"
                      >
                        {isSubmitting ? (
                          <span>Saving to Firestore...</span>
                        ) : (
                          <>
                            <span>
                              {editingProjectId
                                ? existingProject?.status === "Published"
                                  ? "Update Published Project"
                                  : "Update & Submit for Review"
                                : "Submit for Approval"}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          </div>

          {/* ════════ Right Sidebar (4 Cols) ════════ */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            {/* Card 1: "Make it stand out!" (With Translucent 3D Gallery Illustration) */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-50/60 via-purple-50/50 to-pink-50/40 border border-purple-100/80 p-6 shadow-2xs overflow-hidden relative">
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950 mb-1">
                <span>⭐</span>
                <span>Make it stand out!</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                A well-documented project gets more visibility and helps others learn from your work.
              </p>

              {/* Hand-drawn arrow pointing to 3D image cards */}
              <div className="relative w-full h-36 rounded-2xl overflow-hidden shadow-sm bg-white/50 border border-purple-200/50">
                <Image
                  src="/assets/add-project/standout-gallery.jpg"
                  alt="Make project stand out"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Card 2: "What you'll need to provide" (Numbered 1-6 Checklist) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-[#0F172A] tracking-tight">
                What you&apos;ll need to provide
              </h4>
              <ul className="space-y-3.5">
                {[
                  {
                    num: 1,
                    color: "bg-emerald-500",
                    title: "Project Title & Type",
                    desc: "Give your project a clear and meaningful title. Select the right type (Web, Mobile, AI/ML, etc.).",
                  },
                  {
                    num: 2,
                    color: "bg-purple-500",
                    title: "Project Details",
                    desc: "Add domain, department, year, branch, USN and a short description of your project.",
                  },
                  {
                    num: 3,
                    color: "bg-blue-500",
                    title: "Media Files",
                    desc: "Upload screenshots, demo video, or project images to showcase your work.",
                  },
                  {
                    num: 4,
                    color: "bg-amber-500",
                    title: "Links & Resources",
                    desc: "Share GitHub repo, live website, app download link, or any other relevant resources.",
                  },
                  {
                    num: 5,
                    color: "bg-orange-500",
                    title: "Team & Guide",
                    desc: "Mention team members and your project guide/mentor.",
                  },
                  {
                    num: 6,
                    color: "bg-indigo-600",
                    title: "Additional Information",
                    desc: "Add features, technologies used, problem statement, and impact/achievements (optional).",
                  },
                ].map((item) => (
                  <li key={item.num} className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full ${item.color} text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-2xs`}
                    >
                      {item.num}
                    </div>
                    <div>
                      <h6 className="text-xs font-black text-slate-800 leading-tight">
                        {item.title}
                      </h6>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 3: "Pro Tip" */}
            <div className="rounded-3xl bg-gradient-to-r from-rose-50/70 to-purple-50/70 border border-rose-100 p-5 flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Rocket className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-slate-900">Pro Tip</h5>
                  <span className="text-slate-400 text-xs">↗</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1">
                  Keep your description clear, add visuals, and provide working links. It helps others understand and appreciate your work better!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════ Bottom Horizontal Cards: "More Details You'll Add in Next Steps" ════════════ */}
        <div className="mt-12 pt-8 border-t border-slate-200/70">
          <h4 className="text-sm font-black text-[#0F172A] tracking-tight mb-4">
            More Details You&apos;ll Add in Next Steps
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              {
                title: "Project Overview",
                desc: "Problem statement, solution, key features, and impact. (Step 2)",
                icon: BookOpen,
                iconColor: "text-rose-500 bg-rose-50 border-rose-100",
                step: 2,
              },
              {
                title: "Media & Links",
                desc: "Images, demo video, GitHub, live site, APK, etc. (Step 3)",
                icon: Upload,
                iconColor: "text-amber-500 bg-amber-50 border-amber-100",
                step: 3,
              },
              {
                title: "Team & Guide",
                desc: "Team members, roles, guide/mentor details. (Step 4)",
                icon: Users,
                iconColor: "text-blue-500 bg-blue-50 border-blue-100",
                step: 4,
              },
              {
                title: "Tech Stack",
                desc: "Technologies, frameworks, tools and libraries used. (Step 2)",
                icon: Code2,
                iconColor: "text-indigo-500 bg-indigo-50 border-indigo-100",
                step: 2,
              },
              {
                title: "Additional Details",
                desc: "Challenges, future scope, references, and more. (Step 2)",
                icon: FileText,
                iconColor: "text-teal-500 bg-teal-50 border-teal-100",
                step: 2,
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => goToStep(card.step as any)}
                  className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-3 ${card.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h6 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {card.title}
                    </h6>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1 font-medium">
                      {card.desc}
                    </p>
                  </div>
                  <div className="pt-3 text-right">
                    <span className="text-xs text-slate-300 group-hover:text-indigo-600 transition-colors">
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      </PageTransitionWrapper>
    </ParallaxContainer>
  </div>
);
}
