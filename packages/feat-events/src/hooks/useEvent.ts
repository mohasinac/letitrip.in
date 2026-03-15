"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type {
  EventItem,
  EventEntryListResponse,
  LeaderboardEntry,
} from "../types";

export function useEvent(id: string, opts?: { enabled?: boolean }) {
  const { data, isLoading, error, refetch } = useQuery<EventItem | null>({
    queryKey: ["event", id],
    queryFn: () => apiClient.get<EventItem>(`/api/events/${id}`),
    enabled: (opts?.enabled ?? true) && !!id,
  });

  return {
    event: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useEventEntries(
  eventId: string,
  params: { page?: number; pageSize?: number; reviewStatus?: string } = {},
  opts?: { enabled?: boolean },
) {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params.reviewStatus) sp.set("reviewStatus", params.reviewStatus);
  const qs = sp.toString();

  const { data, isLoading, error, refetch } = useQuery<EventEntryListResponse>({
    queryKey: ["event-entries", eventId, qs],
    queryFn: () =>
      apiClient.get<EventEntryListResponse>(
        `/api/events/${eventId}/entries${qs ? `?${qs}` : ""}`,
      ),
    enabled: (opts?.enabled ?? true) && !!eventId,
  });

  return {
    entries: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useEventLeaderboard(
  eventId: string,
  limit = 10,
  opts?: { enabled?: boolean },
) {
  const { data, isLoading, error } = useQuery<LeaderboardEntry[]>({
    queryKey: ["event-leaderboard", eventId, limit],
    queryFn: () =>
      apiClient.get<LeaderboardEntry[]>(
        `/api/events/${eventId}/leaderboard?limit=${limit}`,
      ),
    enabled: (opts?.enabled ?? true) && !!eventId,
  });

  return {
    leaderboard: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
