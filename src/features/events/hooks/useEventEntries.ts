"use client";

import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";
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
  const { data, isLoading, error, refetch } = useApiQuery<EventEntriesResult>({
    queryKey: ["admin-event-entries", eventId, params],
    queryFn: () =>
      apiClient.get<EventEntriesResult>(
        `${API_ENDPOINTS.ADMIN.EVENTS.ENTRIES(eventId)}${params ? `?${params}` : ""}`,
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
