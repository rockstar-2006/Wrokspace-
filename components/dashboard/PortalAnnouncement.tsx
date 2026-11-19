"use client";

import React, { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";

type Announcement = { text: string; tone: "info" | "warning" | "success" } | null;

/** Banner controlled by the Host from Admin → Portal settings. Dismissal is remembered per message. */
export default function PortalAnnouncement() {
  const [a, setA] = useState<Announcement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const ann: Announcement = j?.announcement || null;
        if (!ann) return;
        try {
          if (sessionStorage.getItem("projecthub_announcement_dismissed") === ann.text) setHidden(true);
        } catch { /* ignore */ }
        setA(ann);
      })
      .catch(() => {});
  }, []);

  if (!a || hidden) return null;
  const tone =
    a.tone === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-900"
      : a.tone === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
      : "bg-indigo-50 border-indigo-200 text-indigo-900";

  return (
    <div role="status" className={`mb-6 flex items-start gap-3 px-4 py-3 rounded-2xl border ${tone}`}>
      <Megaphone className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-sm font-semibold flex-1 break-words">{a.text}</p>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem("projecthub_announcement_dismissed", a.text);
          } catch { /* ignore */ }
        }}
        className="p-1 rounded-lg opacity-60 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
