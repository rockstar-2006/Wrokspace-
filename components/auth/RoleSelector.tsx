"use client";

import React from "react";
import { UserRole } from "@/lib/firebase/types";
import { User, Shield } from "lucide-react";

interface RoleSelectorProps {
  activeRole: UserRole;
  onChange: (role: UserRole) => void;
}

export default function RoleSelector({
  activeRole,
  onChange,
}: RoleSelectorProps) {
  return (
    <div className="w-full p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60 flex items-center gap-1 select-none">
      {/* Student Tab */}
      <button
        type="button"
        onClick={() => onChange("student")}
        className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
          activeRole === "student"
            ? "bg-white text-blue-600 shadow-sm border border-slate-100"
            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
        }`}
      >
        <User className={`w-3.5 h-3.5 ${activeRole === "student" ? "text-blue-600" : "text-slate-400"}`} />
        <span>Student</span>
      </button>

      {/* User Tab (As requested: instead of Administrator, mention User) */}
      <button
        type="button"
        onClick={() => onChange("user")}
        className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
          activeRole === "user"
            ? "bg-white text-blue-600 shadow-sm border border-slate-100"
            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
        }`}
      >
        <Shield className={`w-3.5 h-3.5 ${activeRole === "user" ? "text-blue-600" : "text-slate-400"}`} />
        <span>User</span>
      </button>
    </div>
  );
}
