"use client";

import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services";
import type { EventDocument } from "@/db/schema";

interface EventsListResult {
  items: EventDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

interface UsePublicEventsOptions {
  params?: string;
  enabled?: boolean;
  cacheTTL?: number;
}

/**
 * usePublicEvents  (Tier 1 — shared hook)
 * Fetches public-facing events with optional filtering.
 * Uses the Tier 1 eventService (TASK-27: consolidated from Tier-2 duplicate).
 *
 *
 * @example
 * const { events } = usePublicEvents({ params: 'types=sale,offer&status=active&pageSize=1' });
 */
export function usePublicEvents({
  params = "",
  enabled = true,
  cacheTTL = 5 * 60 * 1000,
}: UsePublicEventsOptions = {}) {
  const { data, isLoading, error, refetch } = useQuery<EventsListResult>({
    queryKey: ["public-events", params],
    queryFn: () => eventService.list(params),
    enabled,
    staleTime: cacheTTL,
  });

  return {
    events: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
