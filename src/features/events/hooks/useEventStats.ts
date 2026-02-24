"use client";

import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";
import type { EventDocument, EventEntryDocument } from "@/db/schema";

interface PollOptionResult {
  optionId: string;
  label: string;
  votes: number;
  percentage: number;
}

interface EventStatsResult {
  event: EventDocument;
  totalEntries: number;
  approvedEntries: number;
  flaggedEntries: number;
  pendingEntries: number;
  pollResults: PollOptionResult[];
  leaderboard: EventEntryDocument[];
}

interface UseEventStatsOptions {
  eventId: string;
  enabled?: boolean;
}

export function useEventStats({
  eventId,
  enabled = true,
}: UseEventStatsOptions) {
  const { data, isLoading, error, refetch } = useApiQuery<EventStatsResult>({
    queryKey: ["admin-event-stats", eventId],
    queryFn: () =>
      apiClient.get<EventStatsResult>(
        API_ENDPOINTS.ADMIN.EVENTS.STATS(eventId),
      ),
    enabled: enabled && !!eventId,
  });

  return {
    stats: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
