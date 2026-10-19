import React from "react";

export default function ProjectCardSkeleton() {
  return (
    <div className="relative bg-white border border-slate-200/80 rounded-2xl p-0 overflow-hidden shadow-xs animate-pulse">
      {/* Media Vault Skeleton with Chamfer Cut */}
      <div
        className="h-48 bg-slate-200 relative overflow-hidden"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 100%)",
        }}
      >
        <div className="absolute top-3 left-3 w-16 h-5 rounded bg-slate-300" />
        <div className="absolute top-3 right-5 w-20 h-5 rounded-full bg-slate-300" />
      </div>

      {/* Meta Strip Skeleton */}
      <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="w-24 h-3 bg-slate-200 rounded" />
        <div className="w-16 h-3 bg-slate-200 rounded" />
      </div>

      {/* Body Skeleton */}
      <div className="p-5 pt-3.5 space-y-3">
        {/* Title */}
        <div className="w-3/4 h-5 bg-slate-200 rounded" />

        {/* Description Lines */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-slate-100 rounded" />
          <div className="w-5/6 h-3 bg-slate-100 rounded" />
        </div>

        {/* Tech Pills */}
        <div className="flex items-center gap-1.5 pt-1">
          <div className="w-14 h-5 bg-slate-200 rounded-md" />
          <div className="w-16 h-5 bg-slate-200 rounded-md" />
          <div className="w-12 h-5 bg-slate-200 rounded-md" />
        </div>

        {/* Footer Skeleton */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200" />
            <div className="w-20 h-3 bg-slate-200 rounded" />
          </div>
          <div className="w-16 h-4 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}
