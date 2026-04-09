"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";

interface EventStats {
  totalEntries: number;
  approvedEntries: number;
  flaggedEntries: number;
  pendingEntries: number;
  pollResults: {
    optionId: string;
    label: string;
    count: number;
    percent: number;
  }[];
  leaderboard: unknown[];
}

interface UseEventStatsOptions {
  eventId: string;
  enabled?: boolean;
}

export function useEventStats({
  eventId,
  enabled = true,
}: UseEventStatsOptions) {
  const { data, isLoading, error, refetch } = useQuery<EventStats>({
    queryKey: ["admin-event-stats", eventId],
    queryFn: () =>
      apiClient.get<EventStats>(`/api/admin/events/${eventId}/stats`),
    enabled: enabled && !!eventId,
  });

  return {
    stats: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
