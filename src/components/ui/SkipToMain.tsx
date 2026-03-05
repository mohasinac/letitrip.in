"use client";

import { useTranslations } from "next-intl";
import { TextLink } from "@/components";

/**
 * Keyboard-only skip-navigation link.
 *
 * Hidden by default (`sr-only`). When a keyboard user presses Tab the link
 * becomes visible as a fixed pill in the top-left corner so they can jump
 * straight to the `#main-content` landmark.
 *
 * Place this as the first focusable element in the document (before the
 * navbar) so it is the first stop in the tab order.
 */
export function SkipToMain() {
  const t = useTranslations("a11y");

  return (
    <TextLink
      href="#main-content"
      variant="bare"
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2.5 focus-visible:bg-indigo-600 focus-visible:text-white focus-visible:text-sm focus-visible:font-semibold focus-visible:rounded-lg focus-visible:shadow-lg focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:outline-none transition-all"
    >
      {t("skipToMainContent")}
    </TextLink>
  );
}
