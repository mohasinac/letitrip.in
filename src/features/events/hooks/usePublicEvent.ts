"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicEventByIdAction } from "@/actions";
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
  const { data, isLoading, error } = useQuery<EventDocument | null>({
    queryKey: ["public-event", id],
    queryFn: () => getPublicEventByIdAction(id),
    initialData: options?.initialData,
    enabled: options?.enabled !== false,
  });

  return { event: data ?? null, isLoading, error };
}
