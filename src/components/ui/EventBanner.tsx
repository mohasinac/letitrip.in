"use client";

import { useState, useEffect } from "react";
import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, ROUTES, UI_LABELS } from "@/constants";
import type { EventDocument } from "@/db/schema";
import Link from "next/link";

interface EventsListResponse {
  items: EventDocument[];
}

/**
 * EventBanner
 *
 * Displays a dismissible site-wide banner for the current active sale or offer event.
 * Remembers dismissed events in sessionStorage so they don't re-appear during the session.
 */
export function EventBanner() {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("dismissed_event_banners");
      if (stored) setDismissedIds(JSON.parse(stored));
    } catch {
      // sessionStorage unavailable (SSR guard)
    }
    setMounted(true);
  }, []);

  const { data } = useApiQuery<EventsListResponse>({
    queryKey: ["public-events-banner"],
    queryFn: () =>
      apiClient.get<EventsListResponse>(
        `${API_ENDPOINTS.EVENTS.LIST}?types=sale,offer&status=active&pageSize=1`,
      ),
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  });

  if (!mounted) return null;

  // Pick first active sale or offer not yet dismissed
  const event = data?.items?.find(
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
    ? UI_LABELS.EVENTS.SALE_BANNER(discountPct)
    : UI_LABELS.EVENTS.OFFER_BANNER(offerCode);

  const bgClass = isSale
    ? "bg-gradient-to-r from-indigo-600 to-purple-600"
    : "bg-gradient-to-r from-emerald-600 to-teal-600";

  const href = isSale
    ? ROUTES.PUBLIC.PRODUCTS
    : ROUTES.PUBLIC.EVENT_DETAIL(event.id);

  return (
    <div
      className={`relative ${bgClass} text-white py-2 px-4 text-center text-sm font-medium`}
    >
      <Link href={href} className="hover:underline">
        🎉 {bannerText}
      </Link>
      <button
        onClick={dismiss}
        aria-label="Dismiss banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

export default EventBanner;
