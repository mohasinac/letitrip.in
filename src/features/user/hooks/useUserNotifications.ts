"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  listNotificationsAction,
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
  const query = useQuery<NotificationsPageResponse>({
    queryKey: ["notifications", "page", queryParams],
    queryFn: async () => {
      const sp = new URLSearchParams(queryParams);
      const limit = sp.has("limit") ? Number(sp.get("limit")) : 20;
      const result = await listNotificationsAction(limit);
      return {
        notifications: result.notifications,
        unreadCount: result.unreadCount,
      };
    },
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
