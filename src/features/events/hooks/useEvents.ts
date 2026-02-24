"use client";

import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";
import type { EventDocument } from "@/db/schema";

interface EventsListResult {
  items: EventDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

interface UseEventsOptions {
  params?: string;
  enabled?: boolean;
}

export function useEvents({
  params = "",
  enabled = true,
}: UseEventsOptions = {}) {
  const { data, isLoading, error, refetch } = useApiQuery<EventsListResult>({
    queryKey: ["admin-events", params],
    queryFn: () =>
      apiClient.get<EventsListResult>(
        `${API_ENDPOINTS.ADMIN.EVENTS.LIST}${params ? `?${params}` : ""}`,
      ),
    enabled,
  });

  return {
    events: data?.items ?? [],
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
