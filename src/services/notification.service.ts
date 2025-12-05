/**
 * @fileoverview Service Module
 * @module src/services/notification.service
 * @description This file contains service functions for notification operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Notification Service
 * Epic: E016 - Notifications System
 *
 * Frontend service for interacting with the notifications API
 */

import { apiService } from "./api.service";

/**
 * NotificationType type
 * 
 * @typedef {Object} NotificationType
 * @description Type definition for NotificationType
 */
export type NotificationType =
  | "order"
  | "auction"
  | "bid"
  | "message"
  | "system"
  | "payment"
  | "shipping"
  | "review";

/**
 * NotificationFE interface
 * 
 * @interface
 * @description Defines the structure and contract for NotificationFE
 */
export interface NotificationFE {
  /** Id */
  id: string;
  /** User Id */
  userId: string;
  /** Type */
  type: NotificationType;
  /** Title */
  title: string;
  /** Message */
  message: string;
  /** Read */
  read: boolean;
  /** Link */
  link?: string;
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Created At */
  createdAt: Date;
  /** Read At */
  readAt?: Date;
}

/**
 * NotificationListResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for NotificationListResponse
 */
export interface NotificationListResponse {
  /** Notifications */
  notifications: NotificationFE[];
  /** Pagination */
  pagination: {
    /** Page */
    page: number;
    /** Page Size */
    pageSize: number;
    /** Total */
    total: number;
    /** Total Pages */
    totalPages: number;
    /** Has Next */
    hasNext: boolean;
    /** Has Prev */
    hasPrev: boolean;
  };
}

/**
 * NotificationListParams interface
 * 
 * @interface
 * @description Defines the structure and contract for NotificationListParams
 */
export interface NotificationListParams {
  /** Page */
  page?: number;
  /** Page Size */
  pageSize?: number;
  /** Unread Only */
  unreadOnly?: boolean;
}

/**
 * NotificationService class
 * 
 * @class
 * @description Description of NotificationService class functionality
 */
class NotificationService {
  /**
   * Get list of notifications for the current user
   */
  async list(
    /** Params */
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
      /** Data */
      data: {
        /** Notifications */
        notifications: Array<{
          /** Id */
          id: string;
          /** User Id */
          userId: string;
          /** Type */
          type: NotificationType;
          /** Title */
          title: string;
          /** Message */
          message: string;
          /** Read */
          read: boolean;
          /** Link */
          link?: string;
          /** Metadata */
          metadata?: Record<string, unknown>;
          /** Created At */
          createdAt: string;
          /** Read At */
          readAt?: string;
        }>;
        /** Pagination */
        pagination: NotificationListResponse["pagination"];
      };
    }>(url);

    // Transform dates
    /**
 * Performs notifications operation
 *
 * @param {any} (n - The (n
 *
 * @returns {any} The notifications result
 *
 */
const notifications: NotificationFE[] = response.data.notifications.map(
      (n) => ({
        ...n,
        /** Created At */
        createdAt: new Date(n.createdAt),
        /** Read At */
        readAt: n.readAt ? new Date(n.readAt) : undefined,
      }),
    );

    return {
      notifications,
      /** Pagination */
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
      /** Order */
      order: "Package",
      /** Auction */
      auction: "Gavel",
      /** Bid */
      bid: "TrendingUp",
      /** Message */
      message: "MessageSquare",
      /** System */
      system: "Bell",
      /** Payment */
      payment: "CreditCard",
      /** Shipping */
      shipping: "Truck",
      /** Review */
      review: "Star",
    };
    return icons[type] || "Bell";
  }

  /**
   * Get notification type color
   */
  getTypeColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      /** Order */
      order: "text-blue-600",
      /** Auction */
      auction: "text-purple-600",
      /** Bid */
      bid: "text-green-600",
      /** Message */
      message: "text-indigo-600",
      /** System */
      system: "text-gray-600",
      /** Payment */
      payment: "text-yellow-600",
      /** Shipping */
      shipping: "text-orange-600",
      /** Review */
      review: "text-pink-600",
    };
    return colors[type] || "text-gray-600";
  }
}

export const notificationService = new NotificationService();
