"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { Draggable } from "gsap/Draggable";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

// Register all core and specialized GSAP plugins safely on client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip, Draggable, MotionPathPlugin);
}

export { gsap, ScrollTrigger, Flip, Draggable, MotionPathPlugin };

/**
 * Cinematic Split-Text Reveal
 * Splits a text string into word and letter mask spans for character-by-character
 * or word-by-word 3D perspective animations without requiring external paid packages.
 */
export function animateSplitText(
  container: HTMLElement | string,
  options: {
    type?: "words" | "chars";
    stagger?: number;
    duration?: number;
    delay?: number;
    yPercent?: number;
    rotateX?: number;
    trigger?: HTMLElement | string;
    start?: string;
    scrub?: boolean | number;
  } = {}
) {
  if (typeof window === "undefined") return;

  const {
    type = "words",
    stagger = 0.035,
    duration = 1.05,
    delay = 0,
    yPercent = 110,
    rotateX = 25,
    trigger,
    start = "top 85%",
    scrub = false,
  } = options;

  const el = typeof container === "string" ? document.querySelector(container) as HTMLElement : container;
  if (!el) return;

  const rawText = el.textContent || "";
  el.innerHTML = "";
  el.style.perspective = "1000px";

  if (type === "chars") {
    const words = rawText.split(" ");
    words.forEach((word) => {
      const wordWrap = document.createElement("span");
      wordWrap.className = "inline-block whitespace-nowrap overflow-hidden mr-[0.25em]";
      
      Array.from(word).forEach((char) => {
        const charSpan = document.createElement("span");
        charSpan.className = "inline-block will-change-transform char-split";
        charSpan.textContent = char;
        wordWrap.appendChild(charSpan);
      });
      el.appendChild(wordWrap);
    });
  } else {
    // Default words split
    const words = rawText.split(" ");
    words.forEach((word) => {
      const wordWrap = document.createElement("span");
      wordWrap.className = "inline-block overflow-hidden mr-[0.25em] align-top";
      const wordSpan = document.createElement("span");
      wordSpan.className = "inline-block will-change-transform word-split";
      wordSpan.textContent = word;
      wordWrap.appendChild(wordSpan);
      el.appendChild(wordWrap);
    });
  }

  const targets = el.querySelectorAll(".char-split, .word-split");

  const tl = gsap.timeline({
    delay,
    scrollTrigger: trigger
      ? {
          trigger: trigger,
          start,
          scrub,
          toggleActions: "play none none reverse",
        }
      : undefined,
  });

  tl.fromTo(
    targets,
    {
      yPercent,
      opacity: 0,
      rotateX,
      transformOrigin: "50% 100%",
    },
    {
      yPercent: 0,
      opacity: 1,
      rotateX: 0,
      stagger,
      duration,
      ease: "power4.out",
      force3D: true,
    }
  );

  return tl;
}

/**
 * High-Tech Scramble / Glitch Text Decoder
 * Animates random cryptographic characters into clean text
 */
export function animateScrambleText(
  target: HTMLElement | string,
  finalText: string,
  options: {
    duration?: number;
    chars?: string;
    revealSpeed?: number;
    onComplete?: () => void;
  } = {}
) {
  if (typeof window === "undefined") return;

  const el = typeof target === "string" ? document.querySelector(target) as HTMLElement : target;
  if (!el) return;

  const {
    duration = 1.2,
    chars = "!<>-_\\/[]{}—=+*^?#_0101XYZ#$@%",
    onComplete,
  } = options;

  const length = finalText.length;
  const progressObj = { value: 0 };

  const tween = gsap.to(progressObj, {
    value: 1,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      const p = progressObj.value;
      const solvedLength = Math.floor(p * length);
      let output = "";

      for (let i = 0; i < length; i++) {
        if (i < solvedLength) {
          output += finalText[i];
        } else if (finalText[i] === " ") {
          output += " ";
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      el.textContent = output;
    },
    onComplete: () => {
      el.textContent = finalText;
      if (onComplete) onComplete();
    },
  });

  return tween;
}

/**
 * Typewriter Simulation Effect with Custom Cursor Support
 */
export function animateTypewriter(
  target: HTMLElement | string,
  text: string,
  options: {
    duration?: number;
    delay?: number;
    cursorClass?: string;
    onComplete?: () => void;
  } = {}
) {
  if (typeof window === "undefined") return;

  const el = typeof target === "string" ? document.querySelector(target) as HTMLElement : target;
  if (!el) return;

  const { duration = 1.6, delay = 0, onComplete } = options;
  const progress = { val: 0 };
  const totalChars = text.length;

  return gsap.to(progress, {
    val: totalChars,
    duration,
    delay,
    ease: "none",
    onUpdate: () => {
      const currentCount = Math.floor(progress.val);
      el.textContent = text.slice(0, currentCount);
    },
    onComplete: () => {
      el.textContent = text;
      if (onComplete) onComplete();
    },
  });
}

/**
 * Parallax Motion Initializer for data-speed elements
 * Elements with data-speed="0.2", "0.5", "-0.3" move at relative speeds
 */
export function initParallaxElements(container?: HTMLElement | string) {
  if (typeof window === "undefined") return () => {};

  const parent = container
    ? typeof container === "string"
      ? document.querySelector(container)
      : container
    : document;

  if (!parent) return () => {};

  const elements = parent.querySelectorAll<HTMLElement>("[data-speed]");
  const ctx = gsap.context(() => {
    elements.forEach((el) => {
      const speed = parseFloat(el.getAttribute("data-speed") || "0.3");
      const yOffset = (speed * 180);

      gsap.fromTo(
        el,
        { y: -yOffset * 0.5 },
        {
          y: yOffset * 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        }
      );
    });
  }, parent as Element);

  return () => ctx.revert();
}

/**
 * Vector Line Drawing (DrawSVG Effect)
 */
export function animateDrawSvg(
  paths: SVGPathElement[] | NodeListOf<SVGPathElement> | string,
  options: {
    duration?: number;
    stagger?: number;
    delay?: number;
    ease?: string;
    trigger?: HTMLElement | string;
    start?: string;
    scrub?: boolean | number;
  } = {}
) {
  if (typeof window === "undefined") return;

  const {
    duration = 1.4,
    stagger = 0.15,
    delay = 0,
    ease = "power2.inOut",
    trigger,
    start = "top 80%",
    scrub = false,
  } = options;

  let targetElements: SVGPathElement[] = [];
  if (typeof paths === "string") {
    targetElements = Array.from(document.querySelectorAll(paths));
  } else if (paths instanceof NodeList) {
    targetElements = Array.from(paths);
  } else if (Array.isArray(paths)) {
    targetElements = paths;
  }

  targetElements.forEach((path) => {
    const length = path.getTotalLength ? path.getTotalLength() : 300;
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
  });

  return gsap.to(targetElements, {
    strokeDashoffset: 0,
    duration,
    stagger,
    delay,
    ease,
    scrollTrigger: trigger
      ? {
          trigger,
          start,
          scrub,
          toggleActions: "play none none reverse",
        }
      : undefined,
  });
}
