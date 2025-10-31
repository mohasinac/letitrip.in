"use client";

import React, { useState, useEffect } from "react";
import {
  MoreVertical,
  Eye,
  Printer,
  RefreshCw,
  X,
  Search,
  Truck,
  Clock,
  Plane,
  CheckCircle,
  AlertCircle,
  Target,
  Package,
  Loader2,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api/seller";
import Link from "next/link";

interface ShipmentTrackingEvent {
  status: string;
  location?: string;
  description: string;
  timestamp: string;
}

interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface Shipment {
  id: string;
  sellerId: string;
  orderId: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  fromAddress: Address;
  toAddress: Address;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };
  status:
    | "pending"
    | "pickup_scheduled"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
    | "returned";
  trackingHistory: ShipmentTrackingEvent[];
  shippingLabel?: string;
  invoiceUrl?: string;
  manifestUrl?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

interface ShipmentStats {
  total: number;
  pending: number;
  pickupScheduled: number;
  inTransit: number;
  delivered: number;
  failed: number;
}

export default function ShipmentsPage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Shipments", href: "/seller/shipments" },
  ]);
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<ShipmentStats>({
    total: 0,
    pending: 0,
    pickupScheduled: 0,
    inTransit: 0,
    delivered: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuShipmentId, setMenuShipmentId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    if (user) {
      fetchShipments();
    } else {
      setLoading(false);
    }
  }, [user, statusFilter, searchQuery]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response: any = await apiGet(
        `/api/seller/shipments?status=${statusFilter}&search=${searchQuery}`
      );
      if (response.success) {
        setShipments(response.data || []);
        setStats(response.stats || stats);
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to fetch shipments",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Error fetching shipments:", error);
      const errorMessage = error.message || "Failed to load shipments";
      setSnackbar({
        open: true,
        message: errorMessage.includes("not authenticated")
          ? "Please log in to view shipments"
          : errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTrackShipment = async (shipmentId: string) => {
    try {
      const response: any = await apiPost(
        `/api/seller/shipments/${shipmentId}/track`,
        {}
      );
      if (response.success) {
        setSnackbar({
          open: true,
          message: "Tracking updated successfully",
          severity: "success",
        });
        fetchShipments();
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to update tracking",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error tracking shipment:", error);
      setSnackbar({
        open: true,
        message: "Failed to update tracking",
        severity: "error",
      });
    }
    setMenuShipmentId(null);
  };

  const handlePrintLabel = (shipment: Shipment) => {
    if (shipment?.shippingLabel) {
      window.open(shipment.shippingLabel, "_blank");
    } else {
      setSnackbar({
        open: true,
        message: "Shipping label not available",
        severity: "warning",
      });
    }
    setMenuShipmentId(null);
  };

  const handleCancelShipment = async (shipment: Shipment) => {
    if (
      confirm(
        `Are you sure you want to cancel shipment for order #${shipment.orderNumber}?`
      )
    ) {
      try {
        const response: any = await apiPost(
          `/api/seller/shipments/${shipment.id}/cancel`,
          {}
        );
        if (response.success) {
          setSnackbar({
            open: true,
            message: "Shipment cancelled successfully",
            severity: "success",
          });
          fetchShipments();
        } else {
          setSnackbar({
            open: true,
            message: response.error || "Failed to cancel shipment",
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Error cancelling shipment:", error);
        setSnackbar({
          open: true,
          message: "Failed to cancel shipment",
          severity: "error",
        });
      }
    }
    setMenuShipmentId(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      pickup_scheduled:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      in_transit:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      out_for_delivery:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      delivered:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      returned:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    );
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="w-4 h-4" />,
      pickup_scheduled: <Truck className="w-4 h-4" />,
      in_transit: <Plane className="w-4 h-4" />,
      out_for_delivery: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      failed: <AlertCircle className="w-4 h-4" />,
      returned: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || null;
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const selectedShipment = shipments.find((s) => s.id === menuShipmentId);

  return (
    <RoleGuard requiredRole="seller">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Shipments
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage all your shipments
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/seller/shipments/bulk-labels"
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Truck className="w-5 h-5" />
              Bulk Labels
            </Link>
            <Link
              href="/seller/shipments/bulk-track"
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Target className="w-5 h-5" />
              Track Multiple
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Total
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Pending
            </p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Pickup Scheduled
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.pickupScheduled}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              In Transit
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.inTransit}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Delivered
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.delivered}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Failed
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.failed}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { label: "All Shipments", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Pickup Scheduled", value: "pickup_scheduled" },
              { label: "In Transit", value: "in_transit" },
              { label: "Delivered", value: "delivered" },
              { label: "Failed", value: "failed" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === tab.value
                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tracking number, order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={fetchShipments}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : shipments.length === 0 ? (
            <div className="py-12 text-center">
              <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No shipments found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Shipments will appear here once you initiate shipping for orders
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tracking #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Carrier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {shipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`${SELLER_ROUTES.ORDERS}/${shipment.orderId}`}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          #{shipment.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {shipment.trackingNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {shipment.carrier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {shipment.fromAddress.city},{" "}
                        {shipment.fromAddress.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {shipment.toAddress.city}, {shipment.toAddress.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            shipment.status
                          )}`}
                        >
                          {getStatusIcon(shipment.status)}
                          {formatStatus(shipment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(shipment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setMenuShipmentId(
                                menuShipmentId === shipment.id
                                  ? null
                                  : shipment.id
                              )
                            }
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>

                          {/* Dropdown Menu */}
                          {menuShipmentId === shipment.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuShipmentId(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                                <Link
                                  href={`${SELLER_ROUTES.SHIPMENTS}/${shipment.id}`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  onClick={() => setMenuShipmentId(null)}
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Link>
                                <button
                                  onClick={() =>
                                    handleTrackShipment(shipment.id)
                                  }
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  Update Tracking
                                </button>
                                <button
                                  onClick={() => handlePrintLabel(shipment)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <Printer className="w-4 h-4" />
                                  Print Label
                                </button>
                                {shipment.status === "pending" && (
                                  <button
                                    onClick={() =>
                                      handleCancelShipment(shipment)
                                    }
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                    Cancel Shipment
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Snackbar */}
        {snackbar.open && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
            <div
              className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg ${
                snackbar.severity === "success"
                  ? "bg-green-600 text-white"
                  : snackbar.severity === "warning"
                  ? "bg-yellow-600 text-white"
                  : snackbar.severity === "info"
                  ? "bg-blue-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              <AlertCircle className="w-5 h-5" />
              <span>{snackbar.message}</span>
              <button
                onClick={() => setSnackbar({ ...snackbar, open: false })}
                className="ml-4 hover:bg-white/20 rounded p-1 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
