"use client";

/**
 * TTSButton
 *
 * Text-to-Speech accessibility button for the title bar.
 * Reads the #main-content element aloud using the Web Speech API.
 *
 * - Click to start reading; click again to stop.
 * - Voice language is matched to the current next-intl locale.
 * - Returns null on browsers that don't support speechSynthesis.
 * - An aria-live region announces playback state to screen readers.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Volume2, Square } from "lucide-react";
import { Button } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

export function TTSButton() {
  const t = useTranslations("accessibility");
  const locale = useLocale();

  const [supported, setSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ─── Feature-detect on client ─────────────────────────────────────────────
  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);

    return () => {
      // Cancel any ongoing speech on unmount
      if (typeof window !== "undefined" && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getMainText = useCallback((): string => {
    const main = document.getElementById("main-content") ?? document.body;
    const clone = main.cloneNode(true) as HTMLElement;
    // Strip elements that should not be read
    clone
      .querySelectorAll(
        "script,style,[aria-hidden='true'],.notranslate,noscript,svg",
      )
      .forEach((el) => el.remove());
    return (clone.innerText ?? "").replace(/\s{3,}/g, "\n").trim();
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    const text = getMainText();
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = locale === "hi" ? "hi-IN" : "en-US";
    utterance.lang = langCode;
    utterance.rate = 0.92;
    utterance.pitch = 1;

    // Pick a matching voice when available
    const voices = window.speechSynthesis.getVoices();
    const matched = voices.find((v) =>
      v.lang.startsWith(locale === "hi" ? "hi" : "en"),
    );
    if (matched) utterance.voice = matched;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [getMainText, locale]);

  const handleClick = useCallback(() => {
    if (isPlaying) stop();
    else play();
  }, [isPlaying, stop, play]);

  if (!supported) return null;

  const { colors } = THEME_CONSTANTS;

  return (
    <>
      {/* Polite live region so screen-reader users hear status changes */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isPlaying ? t("ttsPlaying") : ""}
      </div>

      <Button
        variant="ghost"
        onClick={handleClick}
        className={`p-2 md:p-2.5 rounded-xl transition-colors ${colors.iconButton.onPrimary} ${
          isPlaying
            ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
            : ""
        }`}
        aria-label={isPlaying ? t("ttsStop") : t("ttsPlay")}
        aria-pressed={isPlaying}
      >
        {isPlaying ? (
          <Square
            className="w-5 h-5 text-green-600 dark:text-green-400"
            aria-hidden="true"
          />
        ) : (
          <Volume2
            className={`w-5 h-5 ${colors.icon.titleBar}`}
            aria-hidden="true"
          />
        )}
      </Button>
    </>
  );
}
