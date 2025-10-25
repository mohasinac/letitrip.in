"use client";

import { useState, useEffect } from "react";
import {
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export default function SellerNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/seller/notifications?limit=6");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        } else {
          setNotifications([]);
          const errorText = await response.text();
          console.error(
            "Failed to fetch notifications:",
            response.status,
            errorText
          );
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "warning":
        return (
          <ExclamationTriangleIcon className={`${iconClass} text-orange-500`} />
        );
      case "success":
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case "error":
        return <XMarkIcon className={`${iconClass} text-red-500`} />;
      default:
        return (
          <InformationCircleIcon className={`${iconClass} text-blue-500`} />
        );
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    const baseClasses = read ? "bg-gray-50" : "bg-white border-l-4";
    const borderColors = {
      warning: "border-l-orange-500",
      success: "border-l-green-500",
      error: "border-l-red-500",
      info: "border-l-blue-500",
    };
    return `${baseClasses} ${
      !read ? borderColors[type as keyof typeof borderColors] : ""
    }`;
  };

  const getTimeAgo = (dateString: string) => {
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

  const markAsRead = async (id: string) => {
    // Update UI immediately for better UX
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    // Update on server (only if it's not a default notification)
    if (!["welcome", "setup-store", "verification"].includes(id)) {
      try {
        await fetch("/api/seller/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId: id,
            read: true,
          }),
        });
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        // Revert the UI change if the API call failed
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, read: false }
              : notification
          )
        );
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex space-x-3">
                  <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="mb-4">
              <BellIcon className="w-12 h-12 text-gray-300 mx-auto" />
            </div>
            <p>No notifications</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${getNotificationBg(
                  notification.type,
                  notification.read
                )}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p
                        className={`text-sm font-medium ${
                          notification.read ? "text-gray-700" : "text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {notification.actionRequired && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {getTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        notification.read ? "text-gray-500" : "text-gray-700"
                      }`}
                    >
                      {notification.message}
                    </p>
                    {notification.action && (
                      <div className="mt-2">
                        <a
                          href={notification.action.href}
                          className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {notification.action.label}
                          <svg
                            className="w-3 h-3 ml-1"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
