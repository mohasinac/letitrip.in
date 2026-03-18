"use client";

import { useEvents } from "@mohasinac/feat-events";
import type { EventItem } from "@mohasinac/feat-events";

/**
 * useFeaturedEvents
 * Fetches active/upcoming events for the homepage featured events section.
 * Delegates to @mohasinac/feat-events.
 */
export function useFeaturedEvents() {
  const { events, total, isLoading, error } = useEvents({
    pageSize: 12,
    sort: "-createdAt",
  });

  return {
    data: events.length > 0 ? { items: events, total } : undefined,
    isLoading,
    error,
  } as {
    data: { items: EventItem[]; total: number } | undefined;
    isLoading: boolean;
    error: string | null;
  };
}
