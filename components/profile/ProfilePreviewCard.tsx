"use client";

import React from "react";
import Image from "next/image";
import {
  MoreVertical,
  Building,
  CreditCard,
  GraduationCap,
  Calendar,
  GitBranch,
  Pencil,
  Sparkles,
  Code2,
  User,
  Copy,
  Check,
} from "lucide-react";
import AnimatedLiveAvatar from "@/components/avatar/AnimatedLiveAvatar";
import { StudentProfile } from "@/lib/firebase/types";

interface ProfilePreviewCardProps {
  profile: StudentProfile;
  previewImage?: string;
}

export default function ProfilePreviewCard({
  profile,
  previewImage,
}: ProfilePreviewCardProps) {
  const avatarToDisplay = previewImage || profile.photoURL || "";
  const [copiedCode, setCopiedCode] = React.useState(false);

  const studentCodeToDisplay = profile.studentCode || "PH-2026-STU1";

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(studentCodeToDisplay);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header Note ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[#0F172A]">
            Profile Preview
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            This is how your profile will look to others.
          </p>
        </div>
        <button
          type="button"
          aria-label="Menu"
          className="text-slate-400 hover:text-slate-600 p-1"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* ── 1. Main Student Card (Matching Image 3) ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Cover Landscape Banner */}
        <div className="relative h-28 w-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
            alt="Mountain Banner"
            fill
            className="object-cover opacity-85"
          />
        </div>

        {/* Card Content with Overlapping Avatar */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar with Animated Live Instagram Ring */}
          <div className="relative -mt-10 mb-3 w-20 h-20">
            <AnimatedLiveAvatar
              src={avatarToDisplay}
              alt={profile.fullName || "Student Avatar"}
              size="xl"
              ringStyle={profile.avatarRingStyle || "instagram"}
              showLiveBadge={true}
              avatarPosition={profile.avatarPosition || "center 38%"}
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm border-2 border-white pointer-events-none">
              <Pencil className="w-3 h-3" />
            </div>
          </div>

          {/* Name & Role Badge */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              {profile.fullName || <span className="text-slate-400 italic font-normal">Full Name not set</span>}
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">
              Student
            </span>
          </div>

          {/* Prominent Profile Code Pill right under name for 1-click copy */}
          <div className="mb-2.5">
            <button
              type="button"
              onClick={handleCopyCode}
              title="Click to copy your Student Profile Code for team projects"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-700 text-[11px] font-mono font-bold transition-all shadow-2xs group"
            >
              <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-400 group-hover:scale-110 transition-transform" />
              <span>UID: {studentCodeToDisplay}</span>
              {copiedCode ? (
                <span className="text-[10px] text-emerald-600 font-sans font-bold flex items-center gap-0.5 ml-1">
                  <Check className="w-3 h-3 text-emerald-600" /> Copied!
                </span>
              ) : (
                <span className="text-[10px] text-indigo-500 font-sans font-medium flex items-center gap-0.5 ml-1 opacity-70 group-hover:opacity-100">
                  <Copy className="w-2.5 h-2.5" /> Copy
                </span>
              )}
            </button>
          </div>

          {/* Academic Subtitle */}
          <p className="text-[11px] text-slate-500 font-semibold mb-3">
            {[profile.year, profile.department || profile.branch, profile.college].filter(Boolean).length > 0 ? (
              [profile.year, profile.department || profile.branch, profile.college].filter(Boolean).join(" • ")
            ) : (
              <span className="text-slate-400 italic font-normal">Academic details not added yet</span>
            )}
          </p>

          {/* Bio */}
          <p className="text-xs text-slate-600 leading-relaxed font-normal mb-4">
            {profile.bio || (
              <span className="text-slate-400 italic">No bio added yet. Tell others what you love building.</span>
            )}
          </p>

          {/* Skills Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mb-6">
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100/60"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-medium border border-dashed border-slate-200">
                Skills will appear here...
              </span>
            )}
          </div>

          {/* Projects / Publications / Followers Stats */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 py-3 border-t border-slate-100 text-center">
            <div>
              <p className="text-base font-extrabold text-[#0F172A]">
                {profile.projectsCount || 0}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">Projects</p>
            </div>
            <div>
              <p className="text-base font-extrabold text-[#0F172A]">
                {profile.publicationsCount || 0}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">Publications</p>
            </div>
            <div>
              <p className="text-base font-extrabold text-[#0F172A]">
                {profile.followersCount || 0}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">Followers</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Quick Info Card (Matching Image 3) ── */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
            Quick Info
          </h4>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Unique Student Code */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 fill-purple-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Student UID Code</p>
                <p suppressHydrationWarning className="font-mono font-black text-xs text-[#4338CA] tracking-wider">
                  {studentCodeToDisplay}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              title="Copy Profile Code"
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200/80 flex items-center gap-1 transition-all"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-indigo-600" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* College */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Building className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">College</p>
              <p className={`font-bold leading-snug ${profile.college ? "text-slate-800" : "text-slate-400 italic"}`}>
                {profile.college || "Not set yet"}
              </p>
            </div>
          </div>

          {/* USN */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">USN</p>
              <p className={`font-bold ${profile.usn ? "text-slate-800" : "text-slate-400 italic"}`}>
                {profile.usn || "Not set yet"}
              </p>
            </div>
          </div>

          {/* Department / Branch */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Department / Branch</p>
              <p className={`font-bold ${profile.department || profile.branch ? "text-slate-800" : "text-slate-400 italic"}`}>
                {profile.department || profile.branch || "Not set yet"}
              </p>
            </div>
          </div>

          {/* Academic Year */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Academic Year</p>
              <p className={`font-bold ${profile.year ? "text-slate-800" : "text-slate-400 italic"}`}>
                {profile.year || "Not set yet"}
              </p>
            </div>
          </div>

          {/* Batch Year */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <GitBranch className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Batch</p>
              <p className={`font-bold ${profile.batch ? "text-slate-800" : "text-slate-400 italic"}`}>
                {profile.batch || "Not set yet"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Bottom Illustration Card (Exact from Screenshot 4: Student Sitting with Laptop) ── */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-orange-50/70 border border-indigo-100 p-6 relative overflow-hidden shadow-xs">
        <p className="text-sm font-handwriting italic text-indigo-800 font-bold mb-0.5">
          Great projects
        </p>
        <p className="text-sm font-handwriting italic text-indigo-800 font-bold mb-4">
          start with great people!
        </p>

        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-indigo-950">
                ProjectHub Network
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium max-w-[150px]">
              Collaborate across branches and showcase innovations.
            </p>
          </div>

          {/* Generated Student with Laptop Illustration Artwork (Matching Screenshot 4) */}
          <div className="relative w-32 h-28 sm:w-36 sm:h-28 shrink-0 rounded-2xl overflow-hidden shadow-md border border-indigo-200/60">
            <Image
              src="/api/assets/student_network_card_1791649739601.jpg"
              alt="Student with laptop network illustration"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
