"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Camera,
  Pencil,
  Mail,
  Lock,
  Phone,
  Calendar,
  GraduationCap,
  Building,
  User,
  Check,
  Plus,
  X,
  Sparkles,
  Copy,
} from "lucide-react";
import gsap from "gsap";
import ModernBottomNav from "@/components/dashboard/ModernBottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProfilePreviewCard from "@/components/profile/ProfilePreviewCard";
import AnimatedLiveAvatar, { AvatarRingStyle } from "@/components/avatar/AnimatedLiveAvatar";
import AvatarStudioModal from "@/components/avatar/AvatarStudioModal";
import SplitTextHeading from "@/components/animations/SplitTextHeading";
import ScrambleText from "@/components/animations/ScrambleText";
import TypewriterText from "@/components/animations/TypewriterText";
import PageTransitionWrapper from "@/components/animations/PageTransitionWrapper";
import ParallaxContainer from "@/components/animations/ParallaxContainer";
import { ScrollTrigger } from "@/lib/gsapUtils";
import { useAuth } from "@/lib/context/AuthContext";
import { StudentProfile } from "@/lib/firebase/types";
import {
  COLLEGE_OPTIONS,
  DEPARTMENT_OPTIONS,
  YEAR_OPTIONS,
  BRANCH_OPTIONS,
  BATCH_OPTIONS,
  POPULAR_SKILLS,
} from "@/lib/data/mockData";
import { compressAndUploadImage } from "@/lib/utils/imageCompressor";
import { FirestoreService } from "@/lib/firebase/firestoreService";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { profile, updateProfile, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);

  // Wizard Step State (1: Identity & Personal, 2: Academic & Skills)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form State initialized with user profile (safely ensuring skills is an array)
  const [formData, setFormData] = useState<StudentProfile>(() => ({
    ...profile,
    skills: Array.isArray(profile?.skills) ? profile.skills : [],
  }));
  const [newSkill, setNewSkill] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<string | undefined>(
    profile.photoURL
  );
  const [avatarPosition, setAvatarPosition] = useState<string>(
    profile.avatarPosition || "center 38%"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [copiedCodeBanner, setCopiedCodeBanner] = useState(false);
  const [isAvatarStudioOpen, setIsAvatarStudioOpen] = useState(false);
  const [avatarRingStyle, setAvatarRingStyle] = useState<AvatarRingStyle>(
    (profile.avatarRingStyle as AvatarRingStyle) || "instagram"
  );

  const handleSelectAvatarFromStudio = async (
    avatarUrl: string,
    ring: AvatarRingStyle,
    alive?: any
  ) => {
    setPreviewPhoto(avatarUrl);
    setAvatarRingStyle(ring);
    setFormData((prev) => {
      const updated = {
        ...prev,
        photoURL: avatarUrl,
        avatarRingStyle: ring,
      };
      const activeUid = user?.uid || profile?.uid;
      if (activeUid) FirestoreService.saveDraft(activeUid, updated);
      return updated;
    });

    // Instantly persist avatar & ring style so Dashboard Header and session reflect it immediately
    try {
      await updateProfile({
        photoURL: avatarUrl,
        avatarRingStyle: ring,
      });
    } catch (e) {
      console.error("Failed to auto-sync avatar to profile:", e);
    }
  };

  const displayStudentCode = isMounted
    ? (formData.studentCode || profile.studentCode || "PH-2026-STU1")
    : (profile.studentCode || "PH-2026-STU1");

  const handleCopyStudentCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(displayStudentCode);
      setCopiedCodeBanner(true);
      setTimeout(() => setCopiedCodeBanner(false), 2200);
    }
  };

  // ScrollTrigger scrubbed reading progress bar
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

  // Animate step transitions with GSAP
  const goToStep = (step: 1 | 2) => {
    // Save draft when transitioning between steps
    const activeUid = user?.uid || profile?.uid;
    if (activeUid && formData) {
      FirestoreService.saveDraft(activeUid, formData);
    }

    if (stepContainerRef.current) {
      gsap.to(stepContainerRef.current, {
        opacity: 0,
        x: step === 2 ? -24 : 24,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          setCurrentStep(step);
          gsap.fromTo(
            stepContainerRef.current,
            { opacity: 0, x: step === 2 ? 24 : -24 },
            { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
          );
        },
      });
    } else {
      setCurrentStep(step);
    }
  };

  // Calculate profile completion percentage precisely based on all filled details
  const completionPercentage = React.useMemo(() => {
    let score = 0;
    const skillsList = Array.isArray(formData.skills) ? formData.skills : [];
    const requiredChecklist = [
      Boolean(previewPhoto || formData.photoURL), // Profile picture
      Boolean(formData.fullName?.trim()), // Full Name
      Boolean(formData.email?.trim()), // Email
      Boolean(formData.phoneNumber?.trim()), // Phone
      Boolean(formData.dateOfBirth?.trim()), // Date of Birth
      Boolean(formData.college?.trim()), // College
      Boolean(formData.usn?.trim()), // USN
      Boolean(formData.department?.trim() || formData.branch?.trim()), // Department / Branch
      Boolean(formData.batch?.trim()), // Batch Year
      Boolean(formData.year?.trim()), // Academic Year
      Boolean(skillsList.length > 0), // Skills
      Boolean(formData.bio?.trim()), // Bio / About
    ];

    score = requiredChecklist.filter(Boolean).length;
    const totalFields = requiredChecklist.length;
    return Math.round((score / totalFields) * 100);
  }, [formData, previewPhoto]);

  // Synchronize when profile loads & recover any unsaved draft so refreshing NEVER resets
  useEffect(() => {
    setIsMounted(true);
    const activeUid = user?.uid || profile?.uid;
    const draft = activeUid ? FirestoreService.getDraft(activeUid) : null;

    const base = profile ? { ...profile } : {};
    const merged = { ...base, ...(draft || {}) };

    if (!Array.isArray(merged.skills)) {
      merged.skills = [];
    }

    if (merged.email === "student.google@projecthub.edu") merged.email = "";
    if (merged.fullName === "Student User") merged.fullName = "";
    if (merged.photoURL?.includes("unsplash.com/photo-1535713875002")) merged.photoURL = "";
    if (merged.avatarPosition) setAvatarPosition(merged.avatarPosition);
    if (merged.avatarRingStyle) setAvatarRingStyle(merged.avatarRingStyle as AvatarRingStyle);

    setFormData(merged as StudentProfile);
    setPreviewPhoto(merged.photoURL || "");
  }, [profile, user?.uid]);

  // Auto-save draft on every keystroke/change so refreshing will never lose progress
  useEffect(() => {
    if (!isMounted) return;
    const activeUid = user?.uid || profile?.uid;
    if (activeUid && formData) {
      FirestoreService.saveDraft(activeUid, formData);
    }
  }, [formData, isMounted, user?.uid, profile?.uid]);

  // Handle Photo File Pick with Firebase Storage Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const photoUrl = await compressAndUploadImage(file, 400, 400, 0.8, "avatars");
        setPreviewPhoto(photoUrl);
        setFormData((prev) => {
          const updated = { ...prev, photoURL: photoUrl };
          const activeUid = user?.uid || profile?.uid;
          if (activeUid) FirestoreService.saveDraft(activeUid, updated);
          return updated;
        });
      } catch (err) {
        console.error("Failed to upload avatar to Firebase Storage:", err);
      }
    }
  };

  // Add a skill
  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const skillTrimmed = newSkill.trim();
    const currentSkills = Array.isArray(formData.skills) ? formData.skills : [];
    if (skillTrimmed && !currentSkills.includes(skillTrimmed)) {
      setFormData((prev) => {
        const prevSkills = Array.isArray(prev.skills) ? prev.skills : [];
        const updated = {
          ...prev,
          skills: [...prevSkills, skillTrimmed],
        };
        const activeUid = user?.uid || profile?.uid;
        if (activeUid) FirestoreService.saveDraft(activeUid, updated);
        return updated;
      });
      setNewSkill("");
    }
  };

  // Remove a skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => {
      const prevSkills = Array.isArray(prev.skills) ? prev.skills : [];
      const updated = {
        ...prev,
        skills: prevSkills.filter((s) => s !== skillToRemove),
      };
      const activeUid = user?.uid || profile?.uid;
      if (activeUid) FirestoreService.saveDraft(activeUid, updated);
      return updated;
    });
  };

  // Handle Form Submit (Finalize to Firestore and Persistent Session)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const success = await updateProfile(formData);
      if (success) {
        const activeUid = user?.uid || profile?.uid;
        if (activeUid) {
          FirestoreService.clearDraft(activeUid);
        }
        setSaveSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save profile. Please check your network and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FBFBFE] pb-24 selection:bg-[#4338CA] selection:text-white overflow-x-hidden">
      {/* ── Top ScrollTrigger Scrubbed Reading Progress Bar ── */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-200/50 pointer-events-none">
        <div
          ref={scrollProgressRef}
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-400 w-0 transition-all duration-75"
        />
      </div>

      {/* Top Header Bar */}
      <DashboardHeader />

      {/* Modern Floating Bottom Nav */}
      <ModernBottomNav activeTab="profile" />

      {/* Main Content Area with Parallax & PageTransition */}
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
          <main className="p-6 sm:p-10 max-w-[1340px] mx-auto w-full relative z-10">
            {/* Back to Dashboard Link */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            {/* ── Top Hero Banner (Exact match to Screenshot 4 with dynamic Step) ── */}
            <div className="relative w-full rounded-3xl bg-gradient-to-r from-white via-indigo-50/40 to-blue-50/70 border border-slate-200/70 p-8 sm:p-10 shadow-xs overflow-hidden mb-8">
              {/* Seamless Right Illustration Shapes matching Screenshot 4 with Parallax Speed */}
              <div
                data-speed="0.3"
                className="absolute right-0 top-0 bottom-0 w-[420px] pointer-events-none overflow-hidden hidden md:block select-none will-change-transform"
              >
                <div className="relative w-full h-full">
                  {/* Hand-drawn slogan text */}
                  <div className="absolute top-7 right-52 z-20 text-center">
                    <span className="text-sm font-handwriting italic text-indigo-500 font-bold block transform -rotate-6">
                      Your profile
                    </span>
                    <span className="text-sm font-handwriting italic text-indigo-500 font-bold block transform -rotate-3">
                      matters!
                    </span>
                    <div className="w-8 h-1 bg-indigo-300/40 rounded-full mx-auto mt-0.5" />
                  </div>

                  {/* Floating Soft 3D Pastel Shapes matching Screenshot 4 */}
                  <div className="absolute top-10 right-32 w-11 h-14 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-300 shadow-md transform rotate-12" />
                  <div className="absolute top-6 right-16 w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 shadow-sm" />
                  <div className="absolute -bottom-2 right-12 w-28 h-28 rounded-3xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 shadow-lg transform -rotate-6 opacity-90" />
                  <div className="absolute bottom-10 right-40 w-12 h-12 rounded-2xl bg-indigo-600 shadow-md transform rotate-45" />
                </div>
              </div>

              <div className="relative z-10 flex flex-col justify-between max-w-xl">
                <div className="flex flex-wrap items-center gap-2.5 mb-3">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                    Step {currentStep} of 2
                  </span>
                  
                  {/* Unique Student Code Badge with 1-Click Copy */}
                  <button
                    type="button"
                    onClick={handleCopyStudentCode}
                    title="Click to copy your unique Student Profile Code"
                    className="px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100/90 text-purple-700 border border-purple-200 text-[10px] font-mono font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer group active:scale-95"
                  >
                    <Sparkles className="w-3 h-3 fill-purple-500 text-purple-500 group-hover:scale-110 transition-transform" />
                    <span suppressHydrationWarning>
                      UID:{" "}
                      <ScrambleText triggerOn="mount">
                        {displayStudentCode}
                      </ScrambleText>
                    </span>
                    {copiedCodeBanner ? (
                      <span className="text-[10px] text-emerald-600 font-sans font-bold flex items-center gap-0.5 ml-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Copied!
                      </span>
                    ) : (
                      <span className="text-[10px] text-purple-400 group-hover:text-purple-700 font-sans font-medium flex items-center gap-0.5 ml-0.5 opacity-80">
                        <Copy className="w-2.5 h-2.5" /> Copy
                      </span>
                    )}
                  </button>

                  {/* Completion Percentage Badge */}
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-[10px] font-bold shadow-2xs">
                    ● Profile {completionPercentage}% Completed
                  </span>
                </div>

                <div className="mb-1.5">
                  <SplitTextHeading
                    as="h1"
                    className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#0F172A] tracking-tight"
                  >
                    Complete Your Profile
                  </SplitTextHeading>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-lg mb-4">
                  {currentStep === 1
                    ? "Step 1: Fill in your personal details and profile picture."
                    : "Step 2: Add your academic credentials, branch, and skills."}
                </p>

                {/* Clean Sleek Progress Bar with Percentage Indicator */}
                <div className="max-w-md w-full pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-600 font-extrabold">
                      <Sparkles className="w-3.5 h-3.5 fill-indigo-500" />
                      <span>Profile Setup</span>
                    </span>
                    <span className="text-slate-900 font-black text-xs bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden p-[1px] border border-slate-200/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 transition-all duration-700 ease-out shadow-xs"
                      style={{ width: `${Math.max(completionPercentage, 5)}%` }}
                    />
                  </div>

                  {/* Interactive Profile Guidance Tip with Typewriter Effect */}
                  <div className="mt-5 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-700 font-semibold shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Profile Tip:</span>
                    <TypewriterText
                      words={[
                        "Complete profiles receive 3x more peer engagement.",
                        "Verify your student USN to unlock automated credentials.",
                        "Highlight core tech competencies to match with project teams.",
                      ]}
                      className="text-indigo-900 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Success Toast */}
            {saveSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully! Redirecting to Dashboard...</span>
              </div>
            )}

          {/* ── Main Two-Column Layout (Matching Image 3) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm space-y-8">
              <form onSubmit={handleSave} className="space-y-8">
                <div ref={stepContainerRef}>
                  {/* ══════════ STEP 1: Personal Details & Picture ══════════ */}
                  {currentStep === 1 && (
                    <div className="space-y-8">
                      {/* ── Prominent Student Profile Code Callout ── */}
                      <div className="rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-blue-50/80 border border-indigo-100 p-4 sm:p-5 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                                Your Profile Code
                              </span>
                              <span className="text-[11px] text-slate-500 font-bold">
                                For Team Projects
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                              Share this unique code with classmates so they can instantly add you to group project submissions.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              suppressHydrationWarning
                              className="font-mono text-sm font-black text-indigo-950 tracking-wider bg-white px-3.5 py-2 rounded-xl border border-indigo-200/90 shadow-2xs select-all"
                            >
                              {displayStudentCode}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyStudentCode}
                              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                            >
                              {copiedCodeBanner ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ── Section 1: Profile Avatar & Identity ── */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-sm font-extrabold text-[#0F172A]">
                              Profile Avatar & Identity
                            </h3>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs">
                            1,000+ Styles
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mb-4">
                          Pick a high-level illustrated identity or upload your personal photo.
                        </p>

                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-slate-50 border border-indigo-100/80 flex flex-col sm:flex-row items-center gap-6">
                          {/* Live Animated Avatar Preview */}
                          <div className="flex flex-col items-center gap-2 shrink-0">
                            <div
                              onClick={() => setIsAvatarStudioOpen(true)}
                              className="cursor-pointer group relative"
                              title="Click to open Avatar Studio"
                            >
                              <AnimatedLiveAvatar
                                src={previewPhoto}
                                alt="Your Avatar"
                                size="xl"
                                ringStyle={avatarRingStyle}
                                showLiveBadge={true}
                                liveBadgeText="LIVE"
                                avatarPosition={avatarPosition}
                              />
                              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center border-2 border-white shadow-xs group-hover:scale-110 transition-transform">
                                <Pencil className="w-3 h-3" />
                              </div>
                            </div>

                            {/* Framing adjustment if using personal uploaded photo */}
                            {previewPhoto && !previewPhoto.includes("dicebear.com") && (
                              <div className="flex items-center gap-1 pt-1">
                                {[
                                  { label: "Headshot", value: "center 22%" },
                                  { label: "Centered", value: "center 38%" },
                                  { label: "Lower", value: "center 55%" },
                                ].map((pos) => (
                                  <button
                                    key={pos.value}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAvatarPosition(pos.value);
                                      setFormData((prev) => {
                                        const updated = { ...prev, avatarPosition: pos.value };
                                        const activeUid = user?.uid || profile?.uid;
                                        if (activeUid) FirestoreService.saveDraft(activeUid, updated);
                                        return updated;
                                      });
                                    }}
                                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                                      avatarPosition === pos.value
                                        ? "bg-indigo-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    }`}
                                  >
                                    {pos.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Dual Action Chooser: Avatar Studio vs Photo Upload */}
                          <div className="flex-1 space-y-3 text-center sm:text-left">
                            <div>
                              <p className="text-xs font-black text-slate-900 leading-snug">
                                Express your builder identity
                              </p>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                Choose from Google/Meta 3D characters, Anime Innovators, Instagram Lorelei portraits, Cyber AI bots, and Minimalist Notion builders.
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                              {/* Open Avatar Studio (Primary CTA) */}
                              <button
                                type="button"
                                onClick={() => setIsAvatarStudioOpen(true)}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black shadow-md shadow-indigo-500/20 flex items-center gap-2 transform hover:scale-[1.02] active:scale-95 transition-all"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Open Avatar Studio</span>
                              </button>

                              {/* Upload Custom Camera Photo (Secondary CTA) */}
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all"
                              >
                                <Camera className="w-3.5 h-3.5 text-slate-500" />
                                <span>Upload Photo</span>
                              </button>

                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoUpload}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                <div className="border-t border-slate-100" />

                {/* ── Section 2: Basic Information ── */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-[#0F172A]">
                      Basic Information
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mb-4">
                    Your personal details
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formData.countryCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              countryCode: e.target.value,
                            })
                          }
                          className="w-20 px-2 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-bold"
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                        </select>
                        <input
                          type="text"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dateOfBirth: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Step 1 Actions: Continue to Step 2 */}
                  <div className="pt-6 mt-8 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href="/dashboard"
                      className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-bold transition-colors"
                    >
                      Skip for now
                    </Link>

                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="px-8 py-3 rounded-2xl bg-[#4338CA] hover:bg-indigo-700 text-white text-xs sm:text-sm font-black shadow-md shadow-indigo-600/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
                    >
                      <span>Next: Academic &amp; Skills →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ STEP 2: Academic & Skills ══════════ */}
            {currentStep === 2 && (
              <div className="space-y-8">
                {/* ── Section 3: Education Information ── */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-[#0F172A]">
                      Education Information
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mb-4">
                    Your college and academic details
                  </p>

                  <div className="space-y-4">
                    {/* College & USN Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          College / Institution <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.college}
                          onChange={(e) =>
                            setFormData({ ...formData, college: e.target.value })
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium truncate"
                        >
                          <option value="">Select College / Institution</option>
                          {COLLEGE_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          USN / Roll Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 4MV23AI001"
                          value={formData.usn}
                          onChange={(e) =>
                            setFormData({ ...formData, usn: e.target.value })
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Department / Branch & Batch Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Department / Branch */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Department / Branch <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.department || formData.branch}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({
                              ...formData,
                              department: val,
                              branch: val,
                            });
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium truncate"
                        >
                          <option value="">Select Department / Branch</option>
                          {DEPARTMENT_OPTIONS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Batch Year */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Batch Year <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.batch || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, batch: e.target.value })
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                        >
                          <option value="">Select Batch Year</option>
                          {BATCH_OPTIONS.map((batch) => (
                            <option key={batch} value={batch}>
                              {batch}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Academic Year Row */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Current Academic Year <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: e.target.value })
                        }
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                      >
                        <option value="">Select Academic Year</option>
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                {/* ── Section 4: Additional Details ── */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-[#0F172A]">
                      Additional Details
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mb-4">
                    Help others know more about you
                  </p>

                  <div className="space-y-4">
                    {/* Gender Radio Pills */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Gender
                      </label>
                      <div className="flex items-center gap-6 text-xs text-slate-700 font-semibold">
                        {(["Male", "Female", "Other"] as const).map((g) => (
                          <label
                            key={g}
                            className="flex items-center gap-2 cursor-pointer select-none"
                          >
                            <input
                              type="radio"
                              name="gender"
                              value={g}
                              checked={formData.gender === g}
                              onChange={() =>
                                setFormData({ ...formData, gender: g })
                              }
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Skills Tag Input & All Available Skills Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Skills & Technologies (Optional)
                        </label>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {(formData.skills || []).length} selected
                        </span>
                      </div>

                      {/* Selected Skills Chips Bar */}
                      <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center gap-2 mb-3 min-h-[46px]">
                        {(formData.skills || []).map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 shadow-2xs"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-blue-400 hover:text-blue-800 font-bold"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}

                        {/* Custom Skill Input */}
                        <div className="flex-1 min-w-[150px] flex items-center gap-1.5">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={handleAddSkill}
                            placeholder="Type custom skill..."
                            className="w-full py-1 px-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                          />
                          {newSkill.trim() && (
                            <button
                              type="button"
                              onClick={handleAddSkill}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 transition-colors shrink-0"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>

                      {/* All Available / Suggested Skills Palette (One-Click Selection) */}
                      <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                          ✦ Click to Add / Remove Popular Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_SKILLS.map((item) => {
                            const isSelected = (formData.skills || []).includes(item);
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    handleRemoveSkill(item);
                                  } else {
                                    setFormData((prev) => ({
                                      ...prev,
                                      skills: [...(prev.skills || []), item],
                                    }));
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                  isSelected
                                    ? "bg-blue-600 text-white shadow-xs"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600"
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Plus className="w-3 h-3 text-slate-400" />
                                )}
                                <span>{item}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bio Textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Bio / About Me (Optional)
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formData.bio.length}/300
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={300}
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        placeholder="Tell us a bit about yourself, your interests, or what you're passionate about..."
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-normal"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2 Form Bottom Actions: Back + Save & Continue */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ← Back to Step 1
                  </button>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      className="px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors"
                    >
                      Skip
                    </Link>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-9 py-3 rounded-2xl bg-gradient-to-r from-[#FF5A36] to-[#FF7A50] hover:from-[#E84E2A] hover:to-[#FF683C] text-white text-xs sm:text-sm font-black shadow-lg shadow-orange-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                      <span>{isSaving ? "Saving Profile..." : "Save & Continue →"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

            {/* Right Column: Live Profile Preview (5 cols) */}
            <div className="lg:col-span-5 sticky top-28">
              <ProfilePreviewCard
                profile={formData}
                previewImage={previewPhoto}
              />
            </div>
          </div>
        </main>
      </PageTransitionWrapper>
    </ParallaxContainer>

    {/* ── Instagram-Style 1,000+ Avatar Studio Modal ── */}
    <AvatarStudioModal
      isOpen={isAvatarStudioOpen}
      onClose={() => setIsAvatarStudioOpen(false)}
      currentAvatarUrl={previewPhoto}
      onSelectAvatar={handleSelectAvatarFromStudio}
      onSwitchToPhotoUpload={() => fileInputRef.current?.click()}
    />
  </div>
);
}
