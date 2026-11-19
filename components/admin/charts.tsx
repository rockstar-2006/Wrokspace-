"use client";

import React, { useState } from "react";

/** Single-series daily column chart with a hover tooltip. */
export function DailyBars({
  data,
  valueLabel = "submissions",
}: {
  data: Array<{ date: string; label: string; value: number }>;
  valueLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const ticks = [max, Math.round(max / 2), 0].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex flex-col justify-between h-40 text-[10px] font-semibold text-slate-400 tabular-nums text-right w-5 shrink-0">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="relative flex-1 h-40">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {ticks.map((t) => (
              <div key={t} className="border-t border-dashed border-slate-200" />
            ))}
          </div>
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d, i) => (
              <div
                key={d.date}
                className="flex-1 h-full flex items-end cursor-default"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div
                  className={`w-full rounded-t-[4px] transition-colors ${hover === i ? "bg-indigo-700" : "bg-indigo-500"}`}
                  style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 3 : 0 }}
                />
              </div>
            ))}
          </div>
          {hover !== null && (
            <div
              className="absolute -top-2 -translate-y-full px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap pointer-events-none z-10"
              style={{
                left: `${((hover + 0.5) / data.length) * 100}%`,
                transform: `translate(${hover > data.length * 0.7 ? "-100%" : hover < data.length * 0.3 ? "0%" : "-50%"}, -100%)`,
              }}
            >
              {data[hover].label}: <span className="font-black">{data[hover].value}</span> {valueLabel}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between pl-7 mt-1.5 text-[10px] font-semibold text-slate-400">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/** Labeled horizontal bars (magnitude). Each row is direct-labeled with name + value, so color is never the only cue. */
export function HBars({
  rows,
  colorFor,
  emptyText = "No data yet",
  onSelect,
}: {
  rows: Array<{ key: string; label: string; value: number }>;
  colorFor?: (key: string) => string;
  emptyText?: string;
  onSelect?: (key: string) => void;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0);
  if (!rows.length || total === 0) return <p className="text-sm text-slate-400 py-6 text-center">{emptyText}</p>;
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => {
        const pct = total ? Math.round((r.value / total) * 100) : 0;
        const Comp: any = onSelect ? "button" : "div";
        return (
          <li key={r.key}>
            <Comp
              {...(onSelect ? { type: "button", onClick: () => onSelect(r.key) } : {})}
              className={`w-full text-left group ${onSelect ? "cursor-pointer" : ""}`}
              title={`${r.label}: ${r.value} (${pct}%)`}
            >
              <div className="flex items-center justify-between text-xs mb-1 gap-2">
                <span className="font-semibold text-slate-700 truncate group-hover:text-slate-900">{r.label}</span>
                <span className="font-bold text-slate-900 tabular-nums shrink-0">
                  {r.value} <span className="font-semibold text-slate-400">· {pct}%</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${colorFor ? colorFor(r.key) : "bg-indigo-500"} group-hover:opacity-80`}
                  style={{ width: `${(r.value / max) * 100}%` }}
                />
              </div>
            </Comp>
          </li>
        );
      })}
    </ul>
  );
}
