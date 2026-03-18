"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
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
  const { data, isLoading, error, refetch } = useQuery<EventsListResult>({
    queryKey: ["admin-events", params],
    queryFn: () =>
      apiClient.get<EventsListResult>(
        `/api/admin/events${params ? `?${params}` : ""}`,
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
