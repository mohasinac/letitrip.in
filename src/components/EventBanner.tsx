"use client";

import { useState, useEffect } from "react";
import { useEvents } from "@mohasinac/feat-events";
import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Button, TextLink } from "@/components";

/**
 * EventBanner
 *
 * Displays a dismissible site-wide banner for the current active sale or offer event.
 * Remembers dismissed events in sessionStorage so they don't re-appear during the session.
 */
export function EventBanner() {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("eventBanner");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("dismissed_event_banners");
      if (stored) setDismissedIds(JSON.parse(stored));
    } catch {
      // sessionStorage unavailable (SSR guard)
    }
    setMounted(true);
  }, []);

  const { events } = useEvents({
    pageSize: 1,
    sort: "-startsAt",
  });

  if (!mounted) return null;

  // Pick first active sale or offer not yet dismissed
  const event = events.find(
    (e) =>
      (e.type === "sale" || e.type === "offer") && !dismissedIds.includes(e.id),
  );

  if (!event) return null;

  const dismiss = () => {
    const next = [...dismissedIds, event.id];
    setDismissedIds(next);
    try {
      sessionStorage.setItem("dismissed_event_banners", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const isSale = event.type === "sale";
  const discountPct = event.saleConfig?.discountPercent ?? 0;
  const offerCode = event.offerConfig?.displayCode ?? "";

  const bannerText = isSale
    ? t("saleBanner", { pct: discountPct })
    : t("offerBanner", { code: offerCode });

  const bgClass = THEME_CONSTANTS.accentBanner.cta;

  const href = isSale
    ? ROUTES.PUBLIC.PRODUCTS
    : ROUTES.PUBLIC.EVENT_DETAIL(event.id);

  return (
    <div
      className={`relative ${bgClass} text-white py-2 px-4 text-center text-sm font-medium`}
    >
      <TextLink href={href} className="hover:underline">
        🎉 {bannerText}
      </TextLink>
      <Button
        variant="ghost"
        onClick={dismiss}
        aria-label="Dismiss banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-lg leading-none"
      >
        ×
      </Button>
    </div>
  );
}

export default EventBanner;
