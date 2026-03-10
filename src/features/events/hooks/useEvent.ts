"use client";

import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services";
import type { EventDocument } from "@/db/schema";

interface UseEventOptions {
  id: string;
  enabled?: boolean;
}

export function useEvent({ id, enabled = true }: UseEventOptions) {
  const { data, isLoading, error, refetch } = useQuery<EventDocument>({
    queryKey: ["admin-event", id],
    queryFn: () => eventService.adminGetById(id),
    enabled: enabled && !!id,
  });

  return {
    event: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
