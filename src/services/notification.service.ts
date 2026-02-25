/**
 * Notification Service
 * Pure async functions for user notification API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const notificationService = {
  /** List user notifications with optional pagination */
  list: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.NOTIFICATIONS.LIST}${params ? `?${params}` : ""}`,
    ),

  /** Get the unread notification count (for badge indicator) */
  getUnreadCount: () => apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),

  /** Mark a single notification as read */
  markRead: (id: string) =>
    apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {}),

  /** Mark all notifications as read */
  markAllRead: () => apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, {}),

  /** Delete a notification */
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id)),
};
