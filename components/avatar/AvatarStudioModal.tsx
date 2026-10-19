"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Dices,
  Check,
  Palette,
  ShieldCheck,
  Zap,
  Cpu,
  Feather,
  Smile,
  Flame,
  Eye,
} from "lucide-react";
import AnimatedLiveAvatar, { AvatarRingStyle } from "./AnimatedLiveAvatar";
import InteractiveEyeMascot, { MascotTheme, MascotMood } from "./InteractiveEyeMascot";
import { AliveAnimationType } from "./AvatarAliveLayer";

export interface AvatarStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  onSelectAvatar: (avatarUrl: string, ringStyle: AvatarRingStyle, aliveAnimation?: AliveAnimationType) => void;
  onSwitchToPhotoUpload?: () => void;
}

// 7 Curated High-Pride Illustration Styles including Live Interactive Mascot (Image 2)
const AVATAR_COLLECTIONS = [
  {
    id: "mascot",
    name: "Live Eye Mascot",
    subtitle: "Continuous Blinking & Cursor Eye-Tracking",
    icon: Eye,
    badge: "Continuous Live",
    seeds: [
      "orange:curious", "orange:tracker", "orange:hacker", "orange:cool",
      "cyan:curious", "cyan:tracker", "cyan:cyber", "cyan:hacker",
      "violet:curious", "violet:tracker", "violet:kawaii", "violet:cool",
      "emerald:curious", "emerald:tracker", "emerald:hacker",
      "pink:curious", "pink:kawaii", "midnight:cool"
    ],
  },
  {
    id: "avataaars",
    name: "Tech Champions",
    subtitle: "Google & Meta 3D Cartoon Vibe",
    icon: Zap,
    badge: "Most Popular",
    seeds: [
      "Felix", "Avery", "Jordan", "Alex", "Taylor", "Morgan",
      "Chris", "Sam", "Pat", "Riley", "Cameron", "Dakota",
      "Skyler", "Rowan", "Quinn", "Parker", "Logan", "Harper"
    ],
  },
  {
    id: "adventurer",
    name: "Anime Innovators",
    subtitle: "High-energy RPG Protagonists",
    icon: Flame,
    badge: "Trending",
    seeds: [
      "ShadowCoder", "Valkyrie", "Astra", "Kaizen", "Ryu", "Akira",
      "Kira", "Ren", "Sora", "Zenith", "Phoenix", "Nova",
      "Blade", "Echo", "Kuro", "Shiro", "Hikari", "Tatsu"
    ],
  },
  {
    id: "lorelei",
    name: "Instagram Aesthetic",
    subtitle: "High-Fashion Vector Portraits",
    icon: Feather,
    badge: "Stylized",
    seeds: [
      "Zoe", "Chloe", "Maya", "Elena", "Lucas", "Noah",
      "Leo", "Liam", "Ava", "Mia", "Sophia", "Isabella",
      "Oliver", "Elijah", "James", "Benjamin", "Lucas", "Henry"
    ],
  },
  {
    id: "bottts",
    name: "Cyber AI & Bots",
    subtitle: "Robotics & Machine Intelligence",
    icon: Cpu,
    badge: "Tech Elite",
    seeds: [
      "CyberCore", "RoboNexus", "Quantum01", "ByteMaster", "NeuralNet", "MatrixAI",
      "KernelDev", "DaemonX", "TensorBot", "Optimus", "Circuit", "Synthetix",
      "GigaBot", "NanoTech", "Voxel", "BitStream", "SubZero", "Hyperion"
    ],
  },
  {
    id: "notionists",
    name: "Minimalist Builders",
    subtitle: "Clean Notion & Architectural Lines",
    icon: Sparkles,
    badge: "Minimal",
    seeds: [
      "Architect", "Designer", "Builder", "Thinker", "Planner", "Creator",
      "Scholar", "Founder", "Maker", "Author", "Strategist", "Engineer",
      "Artist", "Visionary", "Lead", "Dev", "Founder2", "Scout"
    ],
  },
  {
    id: "fun-emoji",
    name: "3D VIP Icons",
    subtitle: "Playful Expressive Emoji Characters",
    icon: Smile,
    badge: "Vibrant",
    seeds: [
      "StarGazer", "Winner", "RocketHero", "CodeBoss", "Champion", "SuperStar",
      "Genius", "TopGun", "Alpha", "Maverick", "ProGamer", "Ace",
      "Wizard", "Legend", "Mastermind", "Guru", "Iconic", "Supreme"
    ],
  },
];

// Curated Background Color Palettes
const BACKGROUND_PALETTES = [
  { label: "Soft Sky", hex: "b6e3f4", ring: "cyber" as AvatarRingStyle },
  { label: "Lilac Dream", hex: "c0aede", ring: "instagram" as AvatarRingStyle },
  { label: "Pastel Indigo", hex: "d1d4f9", ring: "emerald" as AvatarRingStyle },
  { label: "Blush Pink", hex: "ffd5dc", ring: "instagram" as AvatarRingStyle },
  { label: "Warm Peach", hex: "ffdfbf", ring: "instagram" as AvatarRingStyle },
  { label: "Midnight Slate", hex: "1e293b", ring: "cyber" as AvatarRingStyle },
];

export default function AvatarStudioModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSelectAvatar,
  onSwitchToPhotoUpload,
}: AvatarStudioModalProps) {
  const [selectedStyleId, setSelectedStyleId] = useState<string>("mascot");
  const [selectedSeed, setSelectedSeed] = useState<string>("orange:curious");
  const [selectedBgHex, setSelectedBgHex] = useState<string>("d1d4f9");
  const [customHandle, setCustomHandle] = useState<string>("");
  const [ringStyle, setRingStyle] = useState<AvatarRingStyle>("instagram");
  const [aliveAnimation, setAliveAnimation] = useState<AliveAnimationType>("auto");

  // Current active collection
  const activeCollection = useMemo(() => {
    return AVATAR_COLLECTIONS.find((c) => c.id === selectedStyleId) || AVATAR_COLLECTIONS[0];
  }, [selectedStyleId]);

  // Construct active avatar URL or mascot identifier
  const activeAvatarUrl = useMemo(() => {
    if (selectedStyleId === "mascot") {
      const parts = selectedSeed.split(":");
      const theme = parts[0] || "orange";
      const mood = parts[1] || "curious";
      return `mascot:${theme}:${mood}`;
    }

    const seed = customHandle.trim() || selectedSeed;
    return `https://api.dicebear.com/9.x/${selectedStyleId}/svg?seed=${encodeURIComponent(
      seed
    )}&backgroundColor=${selectedBgHex}`;
  }, [selectedStyleId, selectedSeed, customHandle, selectedBgHex]);

  if (!isOpen) return null;

  // Shuffle / Roll Random Dice
  const handleRollDice = () => {
    if (selectedStyleId === "mascot") {
      const themes: MascotTheme[] = ["orange", "cyan", "violet", "emerald", "pink", "midnight"];
      const moods: MascotMood[] = ["curious", "tracker", "hacker", "cool", "cyber", "kawaii"];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      setSelectedSeed(`${randomTheme}:${randomMood}`);
    } else {
      const randomSeed = `${activeCollection.id}_${Math.random().toString(36).substring(2, 8)}`;
      setSelectedSeed(randomSeed);
      setCustomHandle("");
    }
  };

  // Select Avatar & Apply
  const handleApply = () => {
    onSelectAvatar(activeAvatarUrl, ringStyle, aliveAnimation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[94vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Avatar Studio
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs">
                  Live Blinking Avatars
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Natural eye blinking & crisp Instagram-grade professional framing.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Modal Body (Split: Preview on Left, Selection Grid on Right) ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Preview Card (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl bg-gradient-to-b from-indigo-50/70 via-white to-purple-50/50 border border-indigo-100/90 p-6 flex flex-col items-center text-center shadow-xs relative overflow-hidden">
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-indigo-200/60 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-950">
                  {activeCollection.name}
                </span>
              </div>

              {/* Live Animated Avatar Preview with Crisp Non-Rotating Ring */}
              <div className="my-5">
                <AnimatedLiveAvatar
                  src={activeAvatarUrl}
                  alt="Avatar Preview"
                  size="2xl"
                  ringStyle={ringStyle}
                  aliveAnimation={aliveAnimation}
                  showLiveBadge={true}
                  liveBadgeText="LIVE"
                />
              </div>

              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {selectedStyleId === "mascot"
                  ? `${selectedSeed.split(":")[0].toUpperCase()} MASCOT`
                  : customHandle.trim() || selectedSeed}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {activeCollection.subtitle}
              </p>

              {/* ── Live Character Animation Effect ── */}
              <div className="mt-5 w-full pt-4 border-t border-indigo-100/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Character Eye & Alive Animation
                </p>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {[
                    { id: "auto", label: "✨ Auto (Smart)" },
                    { id: "blink", label: "👁️ Natural Blink" },
                    { id: "shades-glare", label: "🕶️ Shades Glare" },
                  ].map((anim) => (
                    <button
                      key={anim.id}
                      type="button"
                      onClick={() => setAliveAnimation(anim.id as AliveAnimationType)}
                      className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                        aliveAnimation === anim.id
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {anim.label}
                    </button>
                  ))}
                </div>

                {/* Crisp Non-Rotating Story Ring Theme */}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Story Ring Theme (Crisp & Steady)
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: "instagram", label: "Instagram" },
                      { id: "cyber", label: "Cyber Neon" },
                      { id: "emerald", label: "Emerald" },
                      { id: "minimal", label: "Clean" },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRingStyle(r.id)}
                      className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                        ringStyle === r.id
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Seed / Shuffle Control */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {selectedStyleId === "mascot"
                  ? "Interactive Mascot Controls:"
                  : "Type Any Custom Nickname / Handle:"}
              </label>

              {selectedStyleId === "mascot" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRollDice}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2"
                  >
                    <Dices className="w-4 h-4" />
                    <span>Shuffle Random Mood & Color</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customHandle}
                    onChange={(e) => setCustomHandle(e.target.value)}
                    placeholder="e.g. bhushan-dev, neo, quantum"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={handleRollDice}
                    title="Randomize faces"
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Shuffle</span>
                  </button>
                </div>
              )}
              <p className="text-[10px] text-slate-400 font-medium">
                {selectedStyleId === "mascot"
                  ? "Mascot blinks naturally and tracks your cursor in real time!"
                  : "Every unique name generates a completely unique face!"}
              </p>
            </div>
          </div>

          {/* Right Column: Style Collections & Showcase Grid (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Style Collection Tabs */}
            <div>
              <p className="text-xs font-extrabold text-slate-700 mb-2.5">
                1. Choose Illustration Style
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVATAR_COLLECTIONS.map((col) => {
                  const Icon = col.icon;
                  const isSelected = selectedStyleId === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        setSelectedStyleId(col.id);
                        setSelectedSeed(col.seeds[0]);
                        setCustomHandle("");
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all relative ${
                        isSelected
                          ? "bg-indigo-50/70 border-indigo-600 shadow-xs ring-1 ring-indigo-600/20"
                          : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                            col.id === "mascot"
                              ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white"
                              : isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {col.badge}
                        </span>
                      </div>
                      <p className="text-xs font-black text-slate-900 leading-tight">
                        {col.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                        {col.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Background Color Palette (for vector avatars) */}
            {selectedStyleId !== "mascot" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-extrabold text-slate-700">
                    2. Background Backdrop
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Matches your portfolio theme
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {BACKGROUND_PALETTES.map((palette) => {
                    const isSelected = selectedBgHex === palette.hex;
                    return (
                      <button
                        key={palette.hex}
                        type="button"
                        onClick={() => {
                          setSelectedBgHex(palette.hex);
                          setRingStyle(palette.ring);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: `#${palette.hex}` }}
                        />
                        <span>{palette.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Curated Quick Pick Grid (18 Distinct Faces / Mascots) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-extrabold text-slate-700">
                  {selectedStyleId === "mascot"
                    ? "2. Pick Live Mascot Personality & Color"
                    : "3. Pick From Curated Elite Looks"}
                </p>
                <span className="text-[11px] text-indigo-600 font-bold">
                  Tap any face to preview
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-2.5 bg-slate-50/70 rounded-2xl border border-slate-200/60">
                {activeCollection.seeds.map((seed) => {
                  const isCurrent = selectedSeed === seed && customHandle.trim() === "";

                  if (selectedStyleId === "mascot") {
                    const parts = seed.split(":");
                    const theme = (parts[0] || "orange") as MascotTheme;
                    const mood = (parts[1] || "curious") as MascotMood;

                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => {
                          setSelectedSeed(seed);
                          setCustomHandle("");
                        }}
                        className={`relative p-1.5 rounded-2xl transition-all flex flex-col items-center group ${
                          isCurrent
                            ? "bg-white ring-2 ring-indigo-600 shadow-md scale-105"
                            : "bg-white/80 hover:bg-white hover:shadow-xs border border-slate-200/50"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center p-0.5">
                          <InteractiveEyeMascot
                            theme={theme}
                            mood={mood}
                            size={44}
                            interactive={false}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-700 truncate mt-1 w-full text-center capitalize">
                          {theme}
                        </span>
                        <span className="text-[8px] text-slate-400 truncate w-full text-center capitalize">
                          {mood}
                        </span>
                        {isCurrent && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  }

                  const url = `https://api.dicebear.com/9.x/${activeCollection.id}/svg?seed=${seed}&backgroundColor=${selectedBgHex}`;

                  return (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => {
                        setSelectedSeed(seed);
                        setCustomHandle("");
                      }}
                      className={`relative p-1.5 rounded-2xl transition-all flex flex-col items-center group ${
                        isCurrent
                          ? "bg-white ring-2 ring-indigo-600 shadow-md scale-105"
                          : "bg-white/80 hover:bg-white hover:shadow-xs border border-slate-200/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                        <img
                          src={url}
                          alt={seed}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 truncate mt-1 w-full text-center">
                        {seed}
                      </span>
                      {isCurrent && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Modal Footer: Actions ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          {onSwitchToPhotoUpload ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToPhotoUpload();
              }}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Prefer your real camera photo? Click here to upload →
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">
              Continuous Live Animated Studio
            </span>
          )}

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 sm:flex-none px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white text-xs font-extrabold shadow-md shadow-rose-500/25 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Use as My Official Avatar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
