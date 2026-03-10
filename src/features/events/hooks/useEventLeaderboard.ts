"use client";

import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services";
import type { EventEntryDocument } from "@/db/schema";

interface LeaderboardResponse {
  leaderboard: EventEntryDocument[];
  pointsLabel: string;
}

/**
 * useEventLeaderboard
 * Fetches the leaderboard (top entries) for a public event.
 *
 * @param eventId - The event to fetch the leaderboard for
 * @param enabled - Whether the query should run (default: true)
 */
export function useEventLeaderboard(eventId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery<LeaderboardResponse>({
    queryKey: ["event-leaderboard", eventId],
    queryFn: () => eventService.getLeaderboard(eventId),
    enabled: enabled && Boolean(eventId),
  });

  return {
    leaderboard: data?.leaderboard ?? [],
    pointsLabel: data?.pointsLabel,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
