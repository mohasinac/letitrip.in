"use client";

import { useApiQuery } from "@/hooks";
import { eventService } from "@/services";
import type { EventEntryDocument } from "@/db/schema";

/**
 * useEventLeaderboard
 * Fetches the leaderboard (top entries) for a public event.
 *
 * @param eventId - The event to fetch the leaderboard for
 * @param enabled - Whether the query should run (default: true)
 */
export function useEventLeaderboard(eventId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useApiQuery<EventEntryDocument[]>(
    {
      queryKey: ["event-leaderboard", eventId],
      queryFn: () => eventService.getLeaderboard(eventId),
      enabled: enabled && Boolean(eventId),
    },
  );

  return {
    leaderboard: data ?? [],
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
