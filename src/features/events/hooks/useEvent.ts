"use client";

import { useQuery } from "@tanstack/react-query";
import { adminGetEventByIdAction } from "@/actions";
import type { EventDocument } from "@/db/schema";

interface UseEventOptions {
  id: string;
  enabled?: boolean;
}

export function useEvent({ id, enabled = true }: UseEventOptions) {
  const { data, isLoading, error, refetch } = useQuery<EventDocument | null>({
    queryKey: ["admin-event", id],
    queryFn: () => adminGetEventByIdAction(id),
    enabled: enabled && !!id,
  });

  return {
    event: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
