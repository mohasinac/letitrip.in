"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { notificationService } from "@/services";
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
 * Provides paginated notification list + mutation hooks for mark-read, delete, mark-all-read.
 */
export function useUserNotifications(queryParams: string, enabled: boolean) {
  const query = useApiQuery<NotificationsPageResponse>({
    queryKey: ["notifications", "page", queryParams],
    queryFn: () => notificationService.list(queryParams),
    enabled,
    cacheTTL: 0,
  });

  const markRead = useApiMutation<unknown, string>({
    mutationFn: (id: string) => markNotificationReadAction(id),
  });

  const deleteOne = useApiMutation<unknown, string>({
    mutationFn: (id: string) => deleteNotificationAction(id),
  });

  const markAllRead = useApiMutation<unknown, void>({
    mutationFn: () => markAllNotificationsReadAction(),
  });

  return {
    ...query,
    markRead: markRead.mutate,
    deleteOne: deleteOne.mutate,
    markAllRead: markAllRead.mutate,
    isMarkingAll: markAllRead.isLoading,
  };
}
