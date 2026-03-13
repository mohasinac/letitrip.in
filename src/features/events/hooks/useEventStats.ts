"use client";

import { useQuery } from "@tanstack/react-query";
import { adminGetEventStatsAction } from "@/actions";

interface UseEventStatsOptions {
  eventId: string;
  enabled?: boolean;
}

export function useEventStats({
  eventId,
  enabled = true,
}: UseEventStatsOptions) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-event-stats", eventId],
    queryFn: () => adminGetEventStatsAction(eventId),
    enabled: enabled && !!eventId,
  });

  return {
    stats: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
