"use client";

import { useState, useEffect } from "react";
import { SellerNotification } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ShoppingBagIcon,
  CubeIcon,
  StarIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";

export default function SellerNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "unread" | "order" | "product" | "review" | "payment"
  >("all");

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Mock data for now - in production, fetch from API
      const mockNotifications: SellerNotification[] = [
        {
          id: "1",
          sellerId: user?.id || "",
          type: "order",
          title: "New Order Received",
          message:
            "You have received a new order #ORD-001 from John Doe for ₹2,499",
          orderId: "ORD-001",
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        },
        {
          id: "2",
          sellerId: user?.id || "",
          type: "product",
          title: "Low Stock Alert",
          message:
            'Your product "Wireless Headphones" is running low on stock (2 units remaining)',
          productId: "prod-1",
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          id: "3",
          sellerId: user?.id || "",
          type: "review",
          title: "New Product Review",
          message:
            'Your product "Smart Watch" received a 5-star review from Sarah',
          productId: "prod-2",
          isRead: true,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        },
        {
          id: "4",
          sellerId: user?.id || "",
          type: "payment",
          title: "Payment Received",
          message:
            "Payment of ₹2,499 for order #ORD-001 has been processed successfully",
          orderId: "ORD-001",
          isRead: true,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        },
      ];

      const filteredNotifications =
        filter === "all"
          ? mockNotifications
          : filter === "unread"
          ? mockNotifications.filter((n) => !n.isRead)
          : mockNotifications.filter((n) => n.type === filter);

      setNotifications(filteredNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBagIcon className="h-6 w-6 text-blue-600" />;
      case "product":
        return <CubeIcon className="h-6 w-6 text-yellow-600" />;
      case "review":
        return <StarIcon className="h-6 w-6 text-green-600" />;
      case "payment":
        return <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />;
      default:
        return <BellIcon className="h-6 w-6 text-secondary" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 text-secondary mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-primary">
                  Notifications
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Stay updated with order notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                      {unreadCount} unread
                    </span>
                  )}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { key: "all", label: "All" },
              { key: "unread", label: "Unread" },
              { key: "order", label: "Orders" },
              { key: "product", label: "Products" },
              { key: "review", label: "Reviews" },
              { key: "payment", label: "Payments" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="h-12 w-12 text-muted mx-auto mb-4" />
            <p className="text-muted mb-2">No notifications found</p>
            <p className="text-sm text-muted">
              We'll notify you when there are new orders or updates
            </p>
          </div>
        ) : (
          <div className="bg-background shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-border">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <div
                    className={`px-4 py-4 ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <h3
                              className={`text-sm font-medium ${
                                !notification.isRead
                                  ? "text-gray-900"
                                  : "text-gray-600"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted mt-2">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700 p-1 rounded"
                          title="Delete notification"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
