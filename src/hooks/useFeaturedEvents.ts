"use client";

import { useApiQuery } from "./useApiQuery";
import { eventService } from "@/services";
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
  return useApiQuery<PaginatedResult>({
    queryKey: ["events", "featured"],
    queryFn: () =>
      eventService.list(
        "status=active&pageSize=12&sorts=-createdAt",
      ) as Promise<PaginatedResult>,
  });
}
