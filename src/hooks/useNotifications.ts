"use client";

import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";
import { notificationService } from "@/services";
import type { NotificationDocument } from "@/db/schema";

interface NotificationsResponse {
  notifications: NotificationDocument[];
  unreadCount: number;
}

/**
 * useNotifications
 * Provides notifications list, unread count, and read/mark-all mutations.
 * Used by NotificationBell and any other notification UI.
 *
 * @param limit - Number of notifications to fetch (default: 10)
 */
export function useNotifications(limit = 10) {
  const { data, isLoading, refetch } = useApiQuery<NotificationsResponse>({
    queryKey: ["notifications", "list", String(limit)],
    queryFn: () => notificationService.list(`limit=${limit}`),
    cacheTTL: 30_000, // 30 seconds
  });

  const { mutate: markRead } = useApiMutation<unknown, string>({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => refetch(),
  });

  const { mutate: markAllRead, isLoading: isMarkingAll } = useApiMutation<
    unknown,
    void
  >({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => refetch(),
  });

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    refetch,
    markRead,
    markAllRead,
    isMarkingAll,
  };
}
