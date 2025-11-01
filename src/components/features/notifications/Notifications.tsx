"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  CheckCheck,
  Trash2,
  RefreshCw,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Package,
  ShoppingCart,
  TrendingDown,
  MessageSquare,
  Settings,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";
import { ModernDataTable } from "@/components/ui/admin-seller/ModernDataTable";
import { UnifiedAlert } from "@/components/ui/unified";
import { UnifiedModal } from "@/components/ui/unified/Modal";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { SimpleTabs } from "@/components/ui/unified/Tabs";

interface Notification {
  id: string;
  sellerId: string;
  type:
    | "new_order"
    | "pending_approval"
    | "pending_shipment"
    | "low_stock"
    | "order_delivered"
    | "return_request"
    | "review"
    | "system";
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "success";
  orderId?: string;
  productId?: string;
  shipmentId?: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  info: number;
  warning: number;
  error: number;
  success: number;
}

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

interface NotificationsProps {
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
}

export default function Notifications({
  title = "Notifications Management",
  description = "Manage system notifications and alerts",
  breadcrumbs,
}: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    info: 0,
    warning: 0,
    error: 0,
    success: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ show: false, message: "", type: "info" });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"delete" | "view" | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [typeFilter, statusFilter, severityFilter, searchQuery]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("isRead", statusFilter === "read" ? "true" : "false");
      if (severityFilter !== "all") params.append("severity", severityFilter);

      const response = await apiClient.get(
        `/admin/notifications${params.toString() ? `?${params.toString()}` : ""}`
      );

      if (response) {
        setNotifications(response);
        calculateStats(response);
      }
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to load notifications",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (notificationsList: Notification[]) => {
    const calculatedStats = {
      total: notificationsList.length,
      unread: notificationsList.filter((n) => !n.isRead).length,
      info: notificationsList.filter((n) => n.severity === "info").length,
      warning: notificationsList.filter((n) => n.severity === "warning").length,
      error: notificationsList.filter((n) => n.severity === "error").length,
      success: notificationsList.filter((n) => n.severity === "success").length,
    };
    setStats(calculatedStats);
  };

  const openModal = (notification: Notification, type: "delete" | "view") => {
    setSelectedNotification(notification);
    setModalType(type);
    setShowModal(true);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/admin/notifications?action=mark-read`, {
        notificationId,
      });
      fetchNotifications();
      setAlert({
        show: true,
        message: "Notification marked as read",
        type: "success",
      });
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to mark as read",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;

    try {
      setActionLoading(true);
      await apiClient.delete(`/admin/notifications?id=${selectedNotification.id}`);
      fetchNotifications();
      setShowModal(false);
      setSelectedNotification(null);
      setAlert({
        show: true,
        message: "Notification deleted successfully",
        type: "success",
      });
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to delete notification",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    const icons: Record<string, any> = {
      info: Info,
      warning: AlertTriangle,
      error: XCircle,
      success: CheckCircle,
    };
    return icons[severity] || Info;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      new_order: ShoppingCart,
      pending_approval: Clock,
      pending_shipment: Package,
      low_stock: TrendingDown,
      order_delivered: CheckCircle,
      return_request: RefreshCw,
      review: MessageSquare,
      system: Settings,
    };
    return icons[type] || Bell;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      info: "blue",
      warning: "yellow",
      error: "red",
      success: "green",
    };
    return colors[severity] || "gray";
  };

  // Table columns
  const columns = [
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (notif: Notification) => {
        const Icon = getTypeIcon(notif.type);
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-900 dark:text-white capitalize">
              {notif.type.replace(/_/g, " ")}
            </span>
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Notification",
      render: (notif: Notification) => (
        <div className="max-w-md">
          <div className={`text-sm font-medium ${!notif.isRead ? "font-bold" : ""} text-gray-900 dark:text-white`}>
            {notif.title}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {notif.message}
          </div>
        </div>
      ),
    },
    {
      key: "sellerId",
      label: "User ID",
      render: (notif: Notification) => (
        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
          {notif.sellerId.substring(0, 12)}...
        </div>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      sortable: true,
      render: (notif: Notification) => {
        const Icon = getSeverityIcon(notif.severity);
        return (
          <div className="flex items-center gap-1">
            <Icon className={`w-4 h-4 ${
              notif.severity === "error" ? "text-red-500" :
              notif.severity === "warning" ? "text-yellow-500" :
              notif.severity === "success" ? "text-green-500" :
              "text-blue-500"
            }`} />
            <span className="text-sm capitalize">{notif.severity}</span>
          </div>
        );
      },
      badge: (notif: Notification) => ({
        text: notif.severity,
        color: getSeverityColor(notif.severity) as any,
      }),
    },
    {
      key: "isRead",
      label: "Status",
      sortable: true,
      render: (notif: Notification) => (
        <span className="text-sm">{notif.isRead ? "Read" : "Unread"}</span>
      ),
      badge: (notif: Notification) => ({
        text: notif.isRead ? "Read" : "Unread",
        color: notif.isRead ? "gray" : "blue" as any,
      }),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (notif: Notification) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(notif.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Row actions
  const rowActions: any = [
    {
      label: "View Details",
      icon: <Bell className="w-4 h-4" />,
      onClick: (row: Notification) => openModal(row, "view"),
    },
    {
      label: "Mark as Read",
      icon: <CheckCheck className="w-4 h-4" />,
      onClick: (row: Notification) => handleMarkAsRead(row.id),
      hidden: (row: Notification) => row.isRead,
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: Notification) => openModal(row, "delete"),
      variant: "danger" as const,
    },
  ];

  // Stats cards
  const statsCards = [
    {
      label: "Total Notifications",
      value: stats.total,
      color: "gray",
      icon: Bell,
    },
    {
      label: "Unread",
      value: stats.unread,
      color: "blue",
      icon: Clock,
    },
    {
      label: "Info",
      value: stats.info,
      color: "blue",
      icon: Info,
    },
    {
      label: "Warnings",
      value: stats.warning,
      color: "yellow",
      icon: AlertTriangle,
    },
    {
      label: "Errors",
      value: stats.error,
      color: "red",
      icon: XCircle,
    },
  ];

  // Type tabs
  const typeTabs = [
    { id: "all", label: "All Types" },
    { id: "new_order", label: "New Orders" },
    { id: "low_stock", label: "Low Stock" },
    { id: "pending_approval", label: "Pending" },
    { id: "review", label: "Reviews" },
    { id: "system", label: "System" },
  ];

  // Status tabs
  const statusTabs = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "read", label: "Read" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          <UnifiedButton
            onClick={fetchNotifications}
            icon={<RefreshCw className="w-5 h-5" />}
            variant="outline"
          >
            Refresh
          </UnifiedButton>
        }
      />

      {/* Alert */}
      {alert.show && (
        <UnifiedAlert
          variant={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
          className="mb-6"
        >
          {alert.message}
        </UnifiedAlert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <Icon
                  className={`w-5 h-5 ${
                    stat.color === "yellow"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : stat.color === "red"
                      ? "text-red-600 dark:text-red-400"
                      : stat.color === "blue"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
              </div>
              <p
                className={`text-3xl font-bold ${
                  stat.color === "yellow"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : stat.color === "red"
                    ? "text-red-600 dark:text-red-400"
                    : stat.color === "blue"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
        <SimpleTabs
          tabs={typeTabs}
          activeTab={typeFilter}
          onChange={setTypeFilter}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
        <SimpleTabs
          tabs={statusTabs}
          activeTab={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, message, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <ModernDataTable
        data={notifications}
        columns={columns}
        loading={loading}
        emptyMessage="No notifications found"
        rowActions={rowActions}
      />

      {/* Action Modal */}
      {showModal && selectedNotification && (
        <UnifiedModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedNotification(null);
          }}
          title={modalType === "view" ? "Notification Details" : "Delete Notification"}
        >
          <div className="space-y-4">
            {/* Notification Details */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {React.createElement(getTypeIcon(selectedNotification.type), {
                    className: "w-5 h-5 text-gray-600 dark:text-gray-400",
                  })}
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedNotification.type.replace(/_/g, " ")}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedNotification.severity === "success"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : selectedNotification.severity === "error"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : selectedNotification.severity === "warning"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {selectedNotification.severity}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {selectedNotification.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedNotification.message}
                </p>
              </div>

              {selectedNotification.actionUrl && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Action Available
                  </p>
                  <a
                    href={selectedNotification.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {selectedNotification.actionLabel || "View Details →"}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div>User: {selectedNotification.sellerId}</div>
                <div>•</div>
                <div>{new Date(selectedNotification.createdAt).toLocaleString()}</div>
                {selectedNotification.isRead && selectedNotification.readAt && (
                  <>
                    <div>•</div>
                    <div>Read: {new Date(selectedNotification.readAt).toLocaleString()}</div>
                  </>
                )}
              </div>
            </div>

            {/* Delete confirmation */}
            {modalType === "delete" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Warning: This action cannot be undone
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Deleting this notification will permanently remove it from the system.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {modalType === "delete" && (
              <div className="flex gap-2 mt-6">
                <UnifiedButton
                  onClick={() => {
                    setShowModal(false);
                    setSelectedNotification(null);
                  }}
                  disabled={actionLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </UnifiedButton>
                <UnifiedButton
                  onClick={handleDelete}
                  loading={actionLoading}
                  className="flex-1"
                  variant="destructive"
                >
                  {actionLoading ? "Deleting..." : "Delete"}
                </UnifiedButton>
              </div>
            )}
          </div>
        </UnifiedModal>
      )}
    </div>
  );
}
