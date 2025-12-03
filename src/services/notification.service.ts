/**
 * Notification Service
 * Epic: E016 - Notifications System
 *
 * Frontend service for interacting with the notifications API
 */

import { apiService } from "./api.service";

export type NotificationType =
  | "order"
  | "auction"
  | "bid"
  | "message"
  | "system"
  | "payment"
  | "shipping"
  | "review";

export interface NotificationFE {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationListResponse {
  notifications: NotificationFE[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface NotificationListParams {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}

class NotificationService {
  /**
   * Get list of notifications for the current user
   */
  async list(
    params: NotificationListParams = {},
  ): Promise<NotificationListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());
    if (params.unreadOnly) searchParams.set("unreadOnly", "true");

    const queryString = searchParams.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ""}`;

    const response = await apiService.get<{
      data: {
        notifications: Array<{
          id: string;
          userId: string;
          type: NotificationType;
          title: string;
          message: string;
          read: boolean;
          link?: string;
          metadata?: Record<string, unknown>;
          createdAt: string;
          readAt?: string;
        }>;
        pagination: NotificationListResponse["pagination"];
      };
    }>(url);

    // Transform dates
    const notifications: NotificationFE[] = response.data.notifications.map(
      (n) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        readAt: n.readAt ? new Date(n.readAt) : undefined,
      }),
    );

    return {
      notifications,
      pagination: response.data.pagination,
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ data: { count: number } }>(
      "/notifications/unread-count",
    );
    return response.data.count;
  }

  /**
   * Mark specific notifications as read
   */
  async markAsRead(notificationIds: string[]): Promise<{ marked: number }> {
    const response = await apiService.patch<{ data: { marked: number } }>(
      "/notifications",
      { notificationIds },
    );
    return response.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ marked: number }> {
    const response = await apiService.patch<{ data: { marked: number } }>(
      "/notifications",
      { markAll: true },
    );
    return response.data;
  }

  /**
   * Delete a specific notification
   */
  async delete(notificationId: string): Promise<{ deleted: number }> {
    const response = await apiService.delete<{ data: { deleted: number } }>(
      `/notifications?id=${notificationId}`,
    );
    return response.data;
  }

  /**
   * Delete all read notifications
   */
  async deleteRead(): Promise<{ deleted: number }> {
    const response = await apiService.delete<{ data: { deleted: number } }>(
      "/notifications?deleteRead=true",
    );
    return response.data;
  }

  /**
   * Delete all notifications
   */
  async deleteAll(): Promise<{ deleted: number }> {
    const response = await apiService.delete<{ data: { deleted: number } }>(
      "/notifications?deleteAll=true",
    );
    return response.data;
  }

  /**
   * Get notification type icon name
   */
  getTypeIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      order: "Package",
      auction: "Gavel",
      bid: "TrendingUp",
      message: "MessageSquare",
      system: "Bell",
      payment: "CreditCard",
      shipping: "Truck",
      review: "Star",
    };
    return icons[type] || "Bell";
  }

  /**
   * Get notification type color
   */
  getTypeColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      order: "text-blue-600",
      auction: "text-purple-600",
      bid: "text-green-600",
      message: "text-indigo-600",
      system: "text-gray-600",
      payment: "text-yellow-600",
      shipping: "text-orange-600",
      review: "text-pink-600",
    };
    return colors[type] || "text-gray-600";
  }
}

export const notificationService = new NotificationService();
