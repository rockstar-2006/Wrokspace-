"use client";

import React, { useState, useEffect } from "react";

interface TypewriterTextProps {
  words: string | string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  loop?: boolean;
  cursorChar?: string;
  className?: string;
  cursorClassName?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
}

export default function TypewriterText({
  words,
  typingSpeed = 70,
  deletingSpeed = 40,
  pauseTime = 1800,
  loop = true,
  cursorChar = "|",
  className = "",
  cursorClassName = "text-indigo-600 animate-pulse font-bold ml-0.5",
  as: Component = "span",
}: TypewriterTextProps) {
  const wordsSerialized = Array.isArray(words) ? words.join(";;;") : words;
  const wordsArray = React.useMemo(
    () => (Array.isArray(words) ? words : [words]),
    [wordsSerialized]
  );
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentWord = wordsArray[currentWordIdx] || "";

    if (!isDeleting && displayText.length < currentWord.length) {
      // Typing forward
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, displayText.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && displayText.length === currentWord.length) {
      // Finished word, pause before deleting if looping or more words exist
      if (loop || currentWordIdx < wordsArray.length - 1) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    } else if (isDeleting && displayText.length > 0) {
      // Deleting backwards
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, displayText.length - 1));
      }, deletingSpeed);
    } else if (isDeleting && displayText.length === 0) {
      // Finished deleting, move to next word
      setIsDeleting(false);
      setCurrentWordIdx((prev) => (prev + 1) % wordsArray.length);
    }

    return () => clearTimeout(timeout);
  }, [
    displayText,
    isDeleting,
    currentWordIdx,
    wordsArray,
    typingSpeed,
    deletingSpeed,
    pauseTime,
    loop,
  ]);

  return (
    <Component className={`inline-flex items-center ${className}`}>
      <span>{displayText}</span>
      <span className={cursorClassName}>{cursorChar}</span>
    </Component>
  );
}
