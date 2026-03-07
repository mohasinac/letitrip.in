"use client";

/**
 * TranslatePanel
 *
 * Globe icon button in the title bar that opens a Google Translate widget
 * panel. On first open the script is loaded lazily; subsequent opens reuse the
 * already-initialised widget.
 *
 * The panel is always mounted in the DOM (display:hidden when closed) so the
 * Google Translate element can initialise before the user opens the panel,
 * avoiding a visible delay.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { Button, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

// Module-level flag so the <script> is only injected once per page load.
let _scriptInjected = false;

export function TranslatePanel() {
  const t = useTranslations("accessibility");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // ─── 1. Load script + initialise widget ───────────────────────────────────
  useEffect(() => {
    // If already initialised (e.g. after HMR remount) mark ready and return.
    if (document.querySelector(".goog-te-gadget")) {
      setWidgetReady(true);
      return;
    }

    if (_scriptInjected) return;
    _scriptInjected = true;

    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: locale === "hi" ? "hi" : "en",
            autoDisplay: false,
          },
          "google_translate_element",
        );
        setWidgetReady(true);
      } catch {
        // widget init failed – silently degrade
      }
    };

    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.head.appendChild(script);
  }, [locale]);

  // ─── 2. Close on outside click / Escape ───────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const onMouse = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouse);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onMouse);
    };
  }, [isOpen]);

  const handleToggle = useCallback(() => setIsOpen((v) => !v), []);

  const { colors, themed } = THEME_CONSTANTS;

  return (
    <div ref={wrapperRef} className="relative">
      {/* Globe toggle button */}
      <Button
        variant="ghost"
        onClick={handleToggle}
        className={`p-2 md:p-2.5 rounded-xl transition-colors ${colors.iconButton.onPrimary} ${
          isOpen
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            : ""
        }`}
        aria-label={t("translateToggle")}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Globe
          className={`w-5 h-5 transition-colors ${
            isOpen ? "text-blue-600 dark:text-blue-400" : colors.icon.titleBar
          }`}
          aria-hidden="true"
        />
      </Button>

      {/*
       * Panel — always in the DOM so the Google Translate gadget can mount
       * even while closed. Visually hidden via `hidden` when not open.
       */}
      <div
        role="dialog"
        aria-label={t("translatePanelLabel")}
        aria-hidden={!isOpen}
        className={`absolute right-0 top-full mt-2 z-50 rounded-xl shadow-xl border p-3 min-w-[220px] ${themed.bgElevated} ${themed.border} ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {/* Loading hint shown before the widget initialises */}
        {!widgetReady && (
          <Text size="xs" variant="secondary" className="text-center py-2">
            {t("translateLoading")}
          </Text>
        )}

        {/* Google Translate mounts its <select> into this div */}
        <div id="google_translate_element" />
      </div>
    </div>
  );
}
