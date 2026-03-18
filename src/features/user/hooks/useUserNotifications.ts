"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import {
  markNotificationReadAction,
  deleteNotificationAction,
  markAllNotificationsReadAction,
} from "@/actions";
import type { NotificationDocument } from "@/db/schema";

interface NotificationsPageResponse {
  notifications: NotificationDocument[];
  unreadCount: number;
  meta?: { total: number; totalPages: number; page: number };
}

/**
 * useUserNotifications
 * Fetches paginated notifications via GET /api/notifications.
 */
export function useUserNotifications(queryParams: string, enabled: boolean) {
  const query = useQuery<NotificationsPageResponse>({
    queryKey: ["notifications", "page", queryParams],
    queryFn: () =>
      apiClient.get<NotificationsPageResponse>(
        `/api/notifications${queryParams ? `?${queryParams}` : ""}`,
      ),
    enabled,
    staleTime: 0,
  });

  const markRead = useMutation<unknown, Error, string>({
    mutationFn: (id: string) => markNotificationReadAction(id),
  });

  const deleteOne = useMutation<unknown, Error, string>({
    mutationFn: (id: string) => deleteNotificationAction(id),
  });

  const markAllRead = useMutation<unknown, Error, void>({
    mutationFn: () => markAllNotificationsReadAction(),
  });

  return {
    ...query,
    markRead: markRead.mutate,
    deleteOne: deleteOne.mutate,
    markAllRead: markAllRead.mutate,
    isMarkingAll: markAllRead.isPending,
  };
}
