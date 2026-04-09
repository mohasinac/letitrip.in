"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiClientError } from "@mohasinac/appkit/http";
import type { EventDocument } from "@/db/schema";

interface UseEventOptions {
  id: string;
  enabled?: boolean;
}

export function useEvent({ id, enabled = true }: UseEventOptions) {
  const { data, isLoading, error, refetch } = useQuery<EventDocument | null>({
    queryKey: ["admin-event", id],
    queryFn: async () => {
      try {
        return await apiClient.get<EventDocument>(`/api/admin/events/${id}`);
      } catch (e) {
        if (e instanceof ApiClientError && e.status === 404) return null;
        throw e;
      }
    },
    enabled: enabled && !!id,
  });

  return {
    event: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
