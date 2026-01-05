"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { useResourceListState } from "@/hooks/useResourceListState";
import { logError } from "@/lib/firebase-error-logger";
import {
  NotificationFE,
  notificationService,
  NotificationType,
} from "@/services/notification.service";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Filter,
  Loader2,
  MessageSquare,
  Package,
  RefreshCw,
  Star,
  Trash2,
  TrendingUp,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Icon mapping for notification types
const typeIcons: Record<NotificationType, React.ReactNode> = {
  order: <Package className="h-5 w-5" />,
  auction: <Bell className="h-5 w-5" />,
  bid: <TrendingUp className="h-5 w-5" />,
  message: <MessageSquare className="h-5 w-5" />,
  system: <Bell className="h-5 w-5" />,
  payment: <CreditCard className="h-5 w-5" />,
  shipping: <Truck className="h-5 w-5" />,
  review: <Star className="h-5 w-5" />,
};

// Color mapping for notification types
const typeColors: Record<NotificationType, string> = {
  order: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  auction:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  bid: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  message:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  system: "bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
  payment:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  shipping:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  review: "bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: NotificationFE;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div
      className={`group relative flex items-start gap-4 p-4 rounded-lg transition-colors ${
        notification.read
          ? "bg-white dark:bg-gray-800"
          : "bg-indigo-50 dark:bg-indigo-900/20"
      } ${
        notification.link
          ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          : ""
      }`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      role={notification.link ? "button" : undefined}
      tabIndex={notification.link ? 0 : undefined}
    >
      {/* Type icon */}
      <div
        className={`flex-shrink-0 p-2 rounded-full ${
          typeColors[notification.type]
        }`}
      >
        {typeIcons[notification.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`text-sm font-medium ${
              notification.read
                ? "text-gray-700 dark:text-gray-300"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {notification.title}
          </h3>
          <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {notification.message}
        </p>
        {!notification.read && (
          <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-400 rounded-full">
            New
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="p-1.5 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function NotificationsContent() {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch notifications with filtering and pagination
  const {
    items: notifications,
    currentPage,
    setCurrentPage,
    isLoading,
    error,
    setFilter,
    refresh,
  } = useResourceListState<NotificationFE>({
    initialItems: [],
    pageSize: 20,
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationService.list({
          page: currentPage,
          pageSize: 20,
          unreadOnly: showUnreadOnly,
        });
        setFilter("items", response.notifications);
      } catch (err) {
        logError(err as Error, { component: "NotificationsContent.fetch" });
      }
    };
    fetchNotifications();
  }, [currentPage, showUnreadOnly, setFilter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead([id]);
      // Update notification locally
      const updatedNotifications = notifications.map((n) =>
        n.id === id ? { ...n, read: true, readAt: new Date() } : n
      );
      setFilter("items", updatedNotifications);
    } catch (err) {
      logError(err as Error, {
        component: "NotificationsContent.handleMarkAsRead",
        metadata: { notificationId: id },
      });
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionLoading(true);
    try {
      await notificationService.markAllAsRead();
      // Update all notifications
      const updatedNotifications = notifications.map((n) => ({
        ...n,
        read: true,
        readAt: new Date(),
      }));
      setFilter("items", updatedNotifications);
    } catch (err) {
      logError(err as Error, {
        component: "NotificationsContent.handleMarkAllAsRead",
      });
      toast.error("Failed to mark all as read");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.delete(id);
      // Remove from list
      const updatedNotifications = notifications.filter((n) => n.id !== id);
      setFilter("items", updatedNotifications);
    } catch (err) {
      logError(err as Error, {
        component: "NotificationsContent.handleDelete",
        metadata: { notificationId: id },
      });
      toast.error("Failed to delete notification");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleDeleteRead = async () => {
    setActionLoading(true);
    try {
      await notificationService.deleteRead();
      const updatedNotifications = notifications.filter((n) => n.read);
      setFilter("items", updatedNotifications);
    } catch (err) {
      logError(err as Error, {
        component: "NotificationsContent.handleDeleteRead",
      });
      toast.error("Failed to delete read notifications");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/user"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Account
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${
                      unreadCount === 1 ? "" : "s"
                    }`
                  : "You're all caught up!"}
              </p>
            </div>
            <button
              onClick={fetchNotifications}
              disabled={isLoading}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw
                className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Action bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter toggle */}
            <button
              onClick={() => {
                setShowUnreadOnly(!showUnreadOnly);
                setPage(1);
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showUnreadOnly
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              <Filter className="h-4 w-4" />
              {showUnreadOnly ? "Showing unread only" : "Show all"}
            </button>

            {/* Bulk actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={actionLoading || unreadCount === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
              <button
                onClick={handleDeleteRead}
                disabled={actionLoading || !notifications.some((n) => n.read)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
                Delete read
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error.message}</p>
            <button
              onClick={fetchNotifications}
              className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {showUnreadOnly
                ? "No unread notifications"
                : "No notifications yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {showUnreadOnly
                ? "You've read all your notifications!"
                : "When you have notifications, they'll appear here."}
            </p>
            {showUnreadOnly && (
              <button
                onClick={() => setShowUnreadOnly(false)}
                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Show all notifications
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Notification list */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination - can be added later with hasNextPage from API */}
            {notifications.length > 20 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationsContent />
    </AuthGuard>
  );
}
