"use client";

import { useApiQuery } from "@/hooks";
import { eventService } from "@/services";
import type { EventDocument } from "@/db/schema";

interface UsePublicEventOptions {
  initialData?: EventDocument;
  enabled?: boolean;
}

/**
 * usePublicEvent
 * Wraps `eventService.getById(id)` for the public event detail and participate views.
 * Uses queryKey "public-event" (distinct from "admin-event" used by `useEvent`).
 * `options.initialData` — server-prefetched event; prevents initial client fetch.
 */
export function usePublicEvent(id: string, options?: UsePublicEventOptions) {
  const { data, isLoading, error } = useApiQuery<EventDocument>({
    queryKey: ["public-event", id],
    queryFn: () => eventService.getById(id),
    initialData: options?.initialData,
    enabled: options?.enabled !== false,
  });

  return { event: data ?? null, isLoading, error };
}
