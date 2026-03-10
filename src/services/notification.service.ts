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
};
// Mutations (markRead, markAllRead, delete) replaced by Server Actions in @/actions/notification.actions.ts
