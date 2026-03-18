"use client";

import {
  useEvents as _useEvents,
  type EventListParams,
  type EventListResponse,
} from "@mohasinac/feat-events";

export type { EventListResponse as EventsListResult };

interface UsePublicEventsOptions {
  params?: string;
  enabled?: boolean;
  cacheTTL?: number;
  initialData?: EventListResponse;
}

/**
 * Adapter shim — delegates to @mohasinac/feat-events's useEvents.
 * Accepts the legacy `params` URLSearchParams string format for backward compatibility.
 */
export function usePublicEvents({
  params = "",
  enabled = true,
  initialData,
}: UsePublicEventsOptions = {}) {
  const parsed: EventListParams = {};
  if (params) {
    const sp = new URLSearchParams(params);
    const page = sp.get("page");
    if (page) parsed.page = Number(page);
    const pageSize = sp.get("pageSize");
    if (pageSize) parsed.pageSize = Number(pageSize);
    const status = sp.get("status");
    if (status) parsed.status = status as EventListParams["status"];
    const type = sp.get("types") ?? sp.get("type");
    if (type) parsed.type = type as EventListParams["type"];
    const sort = sp.get("sorts") ?? sp.get("sort");
    if (sort) parsed.sort = sort;
    const filters = sp.get("filters");
    if (filters) parsed.filters = filters;
  }

  const result = _useEvents(parsed, { enabled, initialData });

  return {
    events: result.events,
    total: result.total,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}
