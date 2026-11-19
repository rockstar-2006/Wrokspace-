"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { X, CheckCircle2, AlertTriangle, Loader2, Info } from "lucide-react";

/* ───────────────────────── Status badge ───────────────────────── */

const STATUS_STYLE: Record<string, { cls: string; dot: string }> = {
  Published: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  "Pending review": { cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  "Under Review": { cls: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  "Changes requested": { cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  Rejected: { cls: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  Archived: { cls: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
  Draft: { cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-300" },
  active: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  suspended: { cls: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
};

export function StatusBadge({ status, label }: { status?: string; label?: string }) {
  const s = STATUS_STYLE[status || "Draft"] || STATUS_STYLE.Draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-bold whitespace-nowrap ${s.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {label || (status === "active" ? "Active" : status === "suspended" ? "Suspended" : status || "Draft")}
    </span>
  );
}

export const STATUS_BAR_COLOR: Record<string, string> = {
  Published: "bg-emerald-500",
  "Pending review": "bg-amber-500",
  "Under Review": "bg-sky-500",
  "Changes requested": "bg-orange-500",
  Rejected: "bg-rose-500",
  Archived: "bg-slate-600",
  Draft: "bg-slate-400",
};

/* ───────────────────────── Layout bits ───────────────────────── */

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

type BtnVariant = "primary" | "secondary" | "danger" | "success" | "ghost" | "warning";
const BTN: Record<BtnVariant, string> = {
  primary: "bg-slate-900 text-white hover:bg-black border-slate-900",
  secondary: "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
  danger: "bg-rose-600 text-white hover:bg-rose-700 border-rose-600",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600",
  warning: "bg-orange-500 text-white hover:bg-orange-600 border-orange-500",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md"; loading?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm"
      } ${BTN[variant]} ${className}`}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function Avatar({ src, name, size = 32 }: { src?: string; name?: string; size?: number }) {
  const [broken, setBroken] = useState(false);
  const initials = (name || "?")
    .split(/[\s@._-]+/)
    .map((w) => w.replace(/[^A-Za-z0-9À-￿]/g, "")[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (src && !broken) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        onError={() => setBroken(true)}
        className="rounded-full object-cover bg-slate-100 shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0"
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36) }}
    >
      {initials}
    </span>
  );
}

export function Thumb({ src, alt, className = "w-12 h-12" }: { src?: string; alt?: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={`relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 shrink-0 ${className}`}>
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt || ""} className="w-full h-full object-cover" onError={() => setBroken(true)} />
      ) : null}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: any; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="py-14 px-6 text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <p className="font-bold text-slate-800">{title}</p>
      {text && <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="py-16 flex items-center justify-center gap-2 text-sm text-slate-500">
      <Loader2 className="w-4 h-4 animate-spin" /> {label}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="m-4 p-4 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-700 flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-bold">Couldn&apos;t load data</p>
        <p className="mt-0.5 break-words">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

/* ───────────────────────── Form controls ───────────────────────── */

export const inputCls =
  "w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400";

export function Select({
  value,
  onChange,
  options,
  className = "",
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/25 ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-emerald-500" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

/* ───────────────────────── Overlays ───────────────────────── */

export function Drawer({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <aside className={`relative w-full ${width} h-full bg-[#F8FAFC] shadow-2xl flex flex-col animate-[slideIn_.2s_ease-out]`}>
        <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
          <div className="font-black text-slate-900 truncate pr-4">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="px-5 pt-5">
          <h3 className="text-base font-black text-slate-900">{title}</h3>
        </div>
        <div className="px-5 py-4 text-sm text-slate-600">{children}</div>
        {footer && <div className="px-5 pb-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

/* ───────────────────────── Toasts ───────────────────────── */

type Toast = { id: number; kind: "success" | "error" | "info"; text: string };
const ToastCtx = createContext<(kind: Toast["kind"], text: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 7000 : 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => {
          const Icon = t.kind === "success" ? CheckCircle2 : t.kind === "error" ? AlertTriangle : Info;
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto max-w-sm w-full sm:w-auto flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold ${
                t.kind === "success"
                  ? "bg-white border-emerald-200 text-emerald-800"
                  : t.kind === "error"
                  ? "bg-white border-rose-200 text-rose-700"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="break-words">{t.text}</span>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
