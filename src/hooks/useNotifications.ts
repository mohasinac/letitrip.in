"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { notificationService } from "@/services";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions";
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
  const { data, isLoading, refetch } = useQuery<NotificationsResponse>({
    queryKey: ["notifications", "list", String(limit)],
    queryFn: () => notificationService.list(`limit=${limit}`),
    staleTime: 30_000, // 30 seconds
  });

  const { mutate: markRead } = useMutation<unknown, Error, string>({
    mutationFn: (id: string) => markNotificationReadAction(id),
    onSuccess: () => refetch(),
  });

  const { mutate: markAllRead, isPending: isMarkingAll } = useMutation<
    unknown,
    Error,
    void
  >({
    mutationFn: () => markAllNotificationsReadAction().then(() => undefined),
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
