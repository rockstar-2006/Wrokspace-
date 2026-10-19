import React from "react";

interface SpeechTagProps {
  text: string;
  color: string;
  className?: string;
}

export default function SpeechTag({ text, color, className = "" }: SpeechTagProps) {
  return (
    <div
      className={`relative px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold text-white shadow-md select-none inline-flex items-center justify-center transition-transform hover:scale-110 ${className}`}
      style={{ backgroundColor: color }}
    >
      <span>{text}</span>
      {/* Downward triangle indicator */}
      <span
        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-[5px]"
        style={{ borderTopColor: color }}
      />
    </div>
  );
}
