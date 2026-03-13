"use client";

import { useQuery } from "@tanstack/react-query";
import { listPublicEventsAction } from "@/actions";
import type { EventDocument } from "@/db/schema";

interface PaginatedResult {
  items: EventDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * useFeaturedEvents
 * Fetches active/upcoming events for the homepage featured events section.
 */
export function useFeaturedEvents() {
  return useQuery<PaginatedResult>({
    queryKey: ["events", "featured"],
    queryFn: () =>
      listPublicEventsAction({
        pageSize: 12,
        sorts: "-createdAt",
      }) as Promise<PaginatedResult>,
  });
}
