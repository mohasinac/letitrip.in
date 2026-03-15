"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type { EventListResponse, EventListParams } from "../types";

export function useEvents(
  params: EventListParams = {},
  opts?: { enabled?: boolean },
) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.type) sp.set("type", params.type);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params.sort) sp.set("sorts", params.sort);
  if (params.filters) sp.set("filters", params.filters);

  const qs = sp.toString();

  const { data, isLoading, error, refetch } = useQuery<EventListResponse>({
    queryKey: ["events", qs],
    queryFn: () =>
      apiClient.get<EventListResponse>(`/api/events${qs ? `?${qs}` : ""}`),
    enabled: opts?.enabled ?? true,
  });

  return {
    events: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    hasMore: data?.hasMore ?? false,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
