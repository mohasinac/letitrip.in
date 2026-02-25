"use client";

import { useApiQuery } from "@/hooks/useApiQuery";
import { eventService } from "../services/event.service";
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
 * usePublicEvents
 * Fetches public events with optional filtering for the public-facing events list.
 * Used by EventBanner, events page, and any public event widget.
 *
 * @example
 * const { events } = usePublicEvents({ params: 'types=sale,offer&status=active&pageSize=1' });
 */
export function usePublicEvents({
  params = "",
  enabled = true,
  cacheTTL = 5 * 60 * 1000,
}: UsePublicEventsOptions = {}) {
  const { data, isLoading, error, refetch } = useApiQuery<EventsListResult>({
    queryKey: ["public-events", params],
    queryFn: () => eventService.list(params),
    enabled,
    cacheTTL,
  });

  return {
    events: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
