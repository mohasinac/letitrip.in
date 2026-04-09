"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import type { EventEntryDocument } from "@/db/schema";

interface LeaderboardResponse {
  leaderboard: EventEntryDocument[];
  pointsLabel: string;
}

/**
 * useEventLeaderboard
 * Fetches the leaderboard via GET /api/events/[id]/leaderboard.
 *
 * @param eventId - The event to fetch the leaderboard for
 * @param enabled - Whether the query should run (default: true)
 */
export function useEventLeaderboard(eventId: string, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery<LeaderboardResponse>({
    queryKey: ["event-leaderboard", eventId],
    queryFn: () =>
      apiClient.get<LeaderboardResponse>(`/api/events/${eventId}/leaderboard`),
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
