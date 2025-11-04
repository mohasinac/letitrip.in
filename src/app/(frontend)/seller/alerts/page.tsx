"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  ShoppingBag,
  Clock,
  Truck,
  Package,
  CheckCircle,
  RotateCcw,
  Star,
  Info,
  MoreVertical,
  Mail,
  Trash2,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from '@/contexts/SessionAuthContext';
import { apiGet, apiPut, apiPost, apiDelete } from "@/lib/api/seller";
import Link from "next/link";

interface SellerAlert {
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

interface AlertStats {
  total: number;
  unread: number;
  newOrders: number;
  pendingApproval: number;
  lowStock: number;
}

export default function AlertsPage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Alerts", href: "/seller/alerts" },
  ]);
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SellerAlert[]>([]);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    unread: 0,
    newOrders: 0,
    pendingApproval: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [menuAlertId, setMenuAlertId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    if (user) {
      fetchAlerts();
    } else {
      setLoading(false);
    }
  }, [user, typeFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response: any = await apiGet(
        `/api/seller/alerts?type=${typeFilter}`
      );
      if (response.success) {
        setAlerts(response.data || []);
        setStats(response.stats || stats);
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to fetch alerts",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Error fetching alerts:", error);
      const errorMessage = error.message || "Failed to load alerts";
      setSnackbar({
        open: true,
        message: errorMessage.includes("not authenticated")
          ? "Please log in to view alerts"
          : errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      const response: any = await apiPut(
        `/api/seller/alerts/${alertId}/read`,
        {}
      );
      if (response.success) {
        setSnackbar({
          open: true,
          message: "Alert marked as read",
          severity: "success",
        });
        fetchAlerts();
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to mark as read",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error marking alert as read:", error);
      setSnackbar({
        open: true,
        message: "Failed to mark as read",
        severity: "error",
      });
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedAlerts.length === 0) {
      setSnackbar({
        open: true,
        message: "No alerts selected",
        severity: "warning",
      });
      return;
    }

    try {
      const response: any = await apiPost("/api/seller/alerts/bulk-read", {
        alertIds: selectedAlerts,
      });
      if (response.success) {
        setSnackbar({
          open: true,
          message: `${selectedAlerts.length} alerts marked as read`,
          severity: "success",
        });
        setSelectedAlerts([]);
        fetchAlerts();
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to mark alerts as read",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error bulk marking alerts:", error);
      setSnackbar({
        open: true,
        message: "Failed to mark alerts as read",
        severity: "error",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAlerts.length === 0) {
      setSnackbar({
        open: true,
        message: "No alerts selected",
        severity: "warning",
      });
      return;
    }

    if (!confirm(`Delete ${selectedAlerts.length} selected alerts?`)) return;

    try {
      const response: any = await apiPost("/api/seller/alerts/bulk-delete", {
        alertIds: selectedAlerts,
      });
      if (response.success) {
        setSnackbar({
          open: true,
          message: `${selectedAlerts.length} alerts deleted`,
          severity: "success",
        });
        setSelectedAlerts([]);
        fetchAlerts();
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to delete alerts",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error bulk deleting alerts:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete alerts",
        severity: "error",
      });
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm("Delete this alert?")) return;

    try {
      const response: any = await apiDelete(`/api/seller/alerts/${alertId}`);
      if (response.success) {
        setSnackbar({
          open: true,
          message: "Alert deleted",
          severity: "success",
        });
        fetchAlerts();
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to delete alert",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete alert",
        severity: "error",
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedAlerts.length === alerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(alerts.map((a) => a.id));
    }
  };

  const getAlertIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      new_order: <ShoppingBag className="w-6 h-6" />,
      pending_approval: <Clock className="w-6 h-6" />,
      pending_shipment: <Truck className="w-6 h-6" />,
      low_stock: <Package className="w-6 h-6" />,
      order_delivered: <CheckCircle className="w-6 h-6" />,
      return_request: <RotateCcw className="w-6 h-6" />,
      review: <Star className="w-6 h-6" />,
      system: <Info className="w-6 h-6" />,
    };
    return icons[type] || <Bell className="w-6 h-6" />;
  };

  const getAlertColor = (severity: string) => {
    const colors: Record<string, string> = {
      info: "text-blue-600 bg-blue-50",
      warning: "text-amber-600 bg-amber-50",
      error: "text-red-600 bg-red-50",
      success: "text-green-600 bg-green-50",
    };
    return colors[severity] || "text-gray-600 bg-gray-50";
  };

  const filteredAlerts = alerts;

  if (loading) {
    return (
      <RoleGuard requiredRole="seller">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (!user) {
    return (
      <RoleGuard requiredRole="seller">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <p className="text-lg text-gray-600">
              Please log in to view alerts
            </p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="seller">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Snackbar */}
        {snackbar.open && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <div
              className={`p-4 rounded-lg shadow-lg flex items-start gap-3 ${
                snackbar.severity === "error"
                  ? "bg-red-50 border border-red-200"
                  : snackbar.severity === "success"
                  ? "bg-green-50 border border-green-200"
                  : snackbar.severity === "warning"
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <AlertCircle
                className={`w-5 h-5 flex-shrink-0 ${
                  snackbar.severity === "error"
                    ? "text-red-600"
                    : snackbar.severity === "success"
                    ? "text-green-600"
                    : snackbar.severity === "warning"
                    ? "text-amber-600"
                    : "text-blue-600"
                }`}
              />
              <p
                className={`text-sm flex-1 ${
                  snackbar.severity === "error"
                    ? "text-red-800"
                    : snackbar.severity === "success"
                    ? "text-green-800"
                    : snackbar.severity === "warning"
                    ? "text-amber-800"
                    : "text-blue-800"
                }`}
              >
                {snackbar.message}
              </p>
              <button
                onClick={() => setSnackbar({ ...snackbar, open: false })}
                className={`${
                  snackbar.severity === "error"
                    ? "text-red-600 hover:text-red-800"
                    : snackbar.severity === "success"
                    ? "text-green-600 hover:text-green-800"
                    : snackbar.severity === "warning"
                    ? "text-amber-600 hover:text-amber-800"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Alerts & Notifications
          </h1>
          <p className="text-sm text-gray-600">
            Stay updated with your store activities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Total Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Unread</p>
            <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">New Orders</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.newOrders}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-600">
              {stats.pendingApproval}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  typeFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter("new_order")}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  typeFilter === "new_order"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setTypeFilter("low_stock")}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  typeFilter === "low_stock"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setTypeFilter("review")}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  typeFilter === "review"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Reviews
              </button>
            </div>

            {selectedAlerts.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Mail className="w-4 h-4" />
                  Mark Read ({selectedAlerts.length})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedAlerts.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {filteredAlerts.length > 0 ? (
            <div>
              {/* Select All */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    selectedAlerts.length === alerts.length && alerts.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {selectedAlerts.length > 0
                    ? `${selectedAlerts.length} selected`
                    : "Select all"}
                </span>
              </div>

              {/* Alert Items */}
              <div className="divide-y divide-gray-200">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 flex items-start gap-4 hover:bg-gray-50 ${
                      !alert.isRead ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAlerts.includes(alert.id)}
                      onChange={() => {
                        if (selectedAlerts.includes(alert.id)) {
                          setSelectedAlerts(
                            selectedAlerts.filter((id) => id !== alert.id)
                          );
                        } else {
                          setSelectedAlerts([...selectedAlerts, alert.id]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                    />

                    <div
                      className={`p-3 rounded-lg ${getAlertColor(
                        alert.severity
                      )}`}
                    >
                      {getAlertIcon(alert.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {alert.title}
                        </h3>
                        {!alert.isRead && (
                          <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full whitespace-nowrap">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                        {alert.actionUrl && alert.actionLabel && (
                          <Link
                            href={alert.actionUrl}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {alert.actionLabel} →
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuAlertId(
                            menuAlertId === alert.id ? null : alert.id
                          )
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {menuAlertId === alert.id && (
                        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[160px]">
                          {!alert.isRead && (
                            <button
                              onClick={() => {
                                handleMarkAsRead(alert.id);
                                setMenuAlertId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Mail className="w-4 h-4" />
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleDeleteAlert(alert.id);
                              setMenuAlertId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No alerts yet
              </h3>
              <p className="text-sm text-gray-600">
                {typeFilter === "all"
                  ? "You're all caught up! New alerts will appear here."
                  : "No alerts of this type."}
              </p>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
