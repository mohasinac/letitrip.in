"use client";

import { useQuery } from "@tanstack/react-query";
import { adminListEventsAction } from "@/actions";
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
    queryFn: async () => {
      const sp = new URLSearchParams(params);
      return adminListEventsAction({
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
    },
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
