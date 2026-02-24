"use client";

import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";
import type { EventDocument } from "@/db/schema";

interface UseEventOptions {
  id: string;
  enabled?: boolean;
}

export function useEvent({ id, enabled = true }: UseEventOptions) {
  const { data, isLoading, error, refetch } = useApiQuery<EventDocument>({
    queryKey: ["admin-event", id],
    queryFn: () =>
      apiClient.get<EventDocument>(API_ENDPOINTS.ADMIN.EVENTS.DETAIL(id)),
    enabled: enabled && !!id,
  });

  return {
    event: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
