"use client";

import { useState } from "react";
import { useRealTimeNotifications } from "@/hooks/data/useRealTimeData";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ShoppingBagIcon,
  GiftIcon,
  ShieldCheckIcon,
  CogIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  type: "order" | "auction" | "promotion" | "security" | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
  priority: "low" | "medium" | "high";
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, error, refresh, markAsRead } =
    useRealTimeNotifications();

  const [filter, setFilter] = useState<
    "all" | "unread" | "order" | "auction" | "promotion"
  >("all");

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter((notification: any) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.type === filter;
  });

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n: any) => !n.isRead)
          .map((n: any) => markAsRead(n.id))
      );
      refresh();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/user/notifications/${notificationId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (response.ok) {
        refresh();
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBagIcon className="h-6 w-6 text-blue-600" />;
      case "auction":
        return <GiftIcon className="h-6 w-6 text-purple-600" />;
      case "promotion":
        return <GiftIcon className="h-6 w-6 text-green-600" />;
      case "security":
        return <ShieldCheckIcon className="h-6 w-6 text-red-600" />;
      case "system":
        return <CogIcon className="h-6 w-6 text-gray-600" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <BellIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Notifications
                      </h1>
                      <p className="text-sm text-gray-600">
                        You have {unreadCount} unread notifications
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={refresh}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Refresh
                    </button>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        Mark All Read
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="px-6 py-4">
                <div className="flex items-center space-x-1">
                  <FunnelIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-600 mr-4">Filter:</span>
                  {[
                    { key: "all", label: "All" },
                    { key: "unread", label: "Unread" },
                    { key: "order", label: "Orders" },
                    { key: "auction", label: "Auctions" },
                    { key: "promotion", label: "Promotions" },
                  ].map((filterOption) => (
                    <button
                      key={filterOption.key}
                      onClick={() => setFilter(filterOption.key as any)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filter === filterOption.key
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {filterOption.label}
                      {filterOption.key === "unread" && unreadCount > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-lg shadow-sm">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No notifications found
                  </h3>
                  <p className="text-gray-600">
                    {filter === "all"
                      ? "You're all caught up! No notifications to show."
                      : `No ${filter} notifications found.`}
                  </p>
                  {error && (
                    <p className="text-red-600 mt-2">
                      Error loading notifications: {error}
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${
                        !notification.isRead
                          ? "bg-blue-50 " +
                            getPriorityColor(notification.priority)
                          : getPriorityColor(notification.priority)
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-gray-500">
                                  {formatTime(notification.createdAt)}
                                </p>
                                {notification.actionUrl &&
                                  notification.actionText && (
                                    <a
                                      href={notification.actionUrl}
                                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                      {notification.actionText}
                                    </a>
                                  )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-blue-600 hover:text-blue-700 p-1 rounded"
                                  title="Mark as read"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="text-red-600 hover:text-red-700 p-1 rounded"
                                title="Delete notification"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
