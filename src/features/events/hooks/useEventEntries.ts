"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import type { EventEntryDocument } from "@/db/schema";

interface EventEntriesResult {
  items: EventEntryDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

interface UseEventEntriesOptions {
  eventId: string;
  params?: string;
  enabled?: boolean;
}

export function useEventEntries({
  eventId,
  params = "",
  enabled = true,
}: UseEventEntriesOptions) {
  const { data, isLoading, error, refetch } = useQuery<EventEntriesResult>({
    queryKey: ["admin-event-entries", eventId, params],
    queryFn: () =>
      apiClient.get<EventEntriesResult>(
        `/api/admin/events/${eventId}/entries${params ? `?${params}` : ""}`,
      ),
    enabled: enabled && !!eventId,
  });

  return {
    entries: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    pageSize: data?.pageSize ?? 25,
    totalPages: data?.totalPages ?? 1,
    hasMore: data?.hasMore ?? false,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
