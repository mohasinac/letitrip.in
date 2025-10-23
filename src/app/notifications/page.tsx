"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "unread" | "order" | "auction" | "promotion"
  >("all");

  useEffect(() => {
    // Mock notifications data
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "order",
        title: "Order Shipped",
        message:
          "Your order #12345 has been shipped and is on its way to you. Expected delivery: Tomorrow",
        isRead: false,
        createdAt: "2024-10-23T10:30:00Z",
        actionUrl: "/orders/12345",
        actionText: "Track Order",
        priority: "medium",
      },
      {
        id: "2",
        type: "auction",
        title: "Auction Ending Soon",
        message:
          "The auction for 'Rare Gold Beyblade Burst' is ending in 2 hours. You're currently the highest bidder!",
        isRead: false,
        createdAt: "2024-10-23T08:15:00Z",
        actionUrl: "/auctions/gold-beyblade-burst",
        actionText: "View Auction",
        priority: "high",
      },
      {
        id: "3",
        type: "promotion",
        title: "Flash Sale Alert",
        message:
          "🔥 24-hour flash sale! Up to 50% off on all Beyblade Burst series. Don't miss out!",
        isRead: true,
        createdAt: "2024-10-22T16:00:00Z",
        actionUrl: "/products?sale=true",
        actionText: "Shop Now",
        priority: "medium",
      },
      {
        id: "4",
        type: "order",
        title: "Order Delivered",
        message:
          "Your order #12344 has been successfully delivered. We hope you love your new Beyblades!",
        isRead: true,
        createdAt: "2024-10-22T14:22:00Z",
        actionUrl: "/orders/12344",
        actionText: "Leave Review",
        priority: "low",
      },
      {
        id: "5",
        type: "security",
        title: "New Login Detected",
        message:
          "We detected a new login to your account from Chrome on Windows. If this wasn't you, please secure your account.",
        isRead: false,
        createdAt: "2024-10-22T09:45:00Z",
        actionUrl: "/profile?tab=security",
        actionText: "Review Security",
        priority: "high",
      },
      {
        id: "6",
        type: "auction",
        title: "Auction Won!",
        message:
          "Congratulations! You won the auction for 'Limited Edition Metal Fight Beyblade'. Please complete payment within 24 hours.",
        isRead: true,
        createdAt: "2024-10-21T20:30:00Z",
        actionUrl: "/auctions/metal-fight-limited/payment",
        actionText: "Pay Now",
        priority: "high",
      },
      {
        id: "7",
        type: "system",
        title: "Maintenance Complete",
        message:
          "Our scheduled maintenance is complete. The auction system is now back online with improved performance.",
        isRead: true,
        createdAt: "2024-10-21T06:00:00Z",
        priority: "low",
      },
      {
        id: "8",
        type: "promotion",
        title: "New Arrivals",
        message:
          "Check out the latest Beyblade X series that just arrived! Be the first to own these cutting-edge battlers.",
        isRead: false,
        createdAt: "2024-10-20T12:00:00Z",
        actionUrl: "/products?category=beyblade-x&sort=newest",
        actionText: "Explore New",
        priority: "low",
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.type === filter;
  });

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return (
          <div className="bg-blue-100 p-2 rounded-full">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        );
      case "auction":
        return (
          <div className="bg-yellow-100 p-2 rounded-full">
            <svg
              className="h-5 w-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
        );
      case "promotion":
        return (
          <div className="bg-green-100 p-2 rounded-full">
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
        );
      case "security":
        return (
          <div className="bg-red-100 p-2 rounded-full">
            <svg
              className="h-5 w-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-2 rounded-full">
            <svg
              className="h-5 w-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      default:
        return "border-l-gray-300";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-gray-600 mt-1">
                  {unreadCount > 0
                    ? `${unreadCount} unread notifications`
                    : "All caught up!"}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn btn-outline btn-sm"
                >
                  Mark All as Read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All", count: notifications.length },
                { key: "unread", label: "Unread", count: unreadCount },
                {
                  key: "order",
                  label: "Orders",
                  count: notifications.filter((n) => n.type === "order").length,
                },
                {
                  key: "auction",
                  label: "Auctions",
                  count: notifications.filter((n) => n.type === "auction")
                    .length,
                },
                {
                  key: "promotion",
                  label: "Promotions",
                  count: notifications.filter((n) => n.type === "promotion")
                    .length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        filter === tab.key
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(
                    notification.priority
                  )} ${!notification.isRead ? "bg-blue-50/30" : ""}`}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3
                                className={`text-sm font-medium ${
                                  !notification.isRead
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {notification.message}
                            </p>
                            <p className="mt-2 text-xs text-gray-400">
                              {new Date(
                                notification.createdAt
                              ).toLocaleString()}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="text-xs text-gray-400 hover:text-red-600"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Action Button */}
                        {notification.actionUrl && notification.actionText && (
                          <div className="mt-4">
                            <a
                              href={notification.actionUrl}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary hover:text-primary-dark border border-primary hover:border-primary-dark rounded-md hover:bg-primary/5 transition-colors"
                            >
                              {notification.actionText}
                              <svg
                                className="ml-1 h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-15 0V7a7.5 7.5 0 0115 0v10z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === "all"
                  ? "You're all caught up! No notifications to show."
                  : `No ${filter} notifications to show.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
