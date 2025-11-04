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
import { useAuth } from '@/contexts/SessionAuthContext';
import { apiGet, apiPost } from "@/lib/api/seller";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";
import { ModernDataTable } from "@/components/ui/admin-seller/ModernDataTable";
import { UnifiedAlert } from "@/components/ui/unified";

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
  // Admin-specific fields
  sellerEmail?: string;
  shopName?: string;
}

interface ShipmentStats {
  total: number;
  pending: number;
  pickupScheduled: number;
  inTransit: number;
  delivered: number;
  failed: number;
}

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

interface ShipmentsProps {
  context: "admin" | "seller";
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  detailsUrl: (id: string) => string;
  orderDetailsUrl: (id: string) => string;
  showBulkActions?: boolean;
}

export default function Shipments({
  context,
  title = "Shipments",
  description = "Track and manage shipments",
  breadcrumbs,
  detailsUrl,
  orderDetailsUrl,
  showBulkActions = true,
}: ShipmentsProps) {
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
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ show: false, message: "", type: "info" });

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
      let response: any;

      if (context === "admin") {
        response = await apiClient.get(
          `/api/admin/shipments?status=${statusFilter}&search=${searchQuery}`
        );
      } else {
        response = await apiGet(
          `/api/seller/shipments?status=${statusFilter}&search=${searchQuery}`
        );
      }

      if (response.success) {
        setShipments(response.data || []);
        setStats(response.stats || stats);
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to fetch shipments",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("Error fetching shipments:", error);
      const errorMessage = error.message || "Failed to load shipments";
      setAlert({
        show: true,
        message: errorMessage.includes("not authenticated")
          ? "Please log in to view shipments"
          : errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTrackShipment = async (shipmentId: string) => {
    try {
      let response: any;

      if (context === "admin") {
        response = await apiClient.post(
          `/api/admin/shipments/${shipmentId}/track`,
          {}
        );
      } else {
        response = await apiPost(
          `/api/seller/shipments/${shipmentId}/track`,
          {}
        );
      }

      if (response.success) {
        setAlert({
          show: true,
          message: "Tracking updated successfully",
          type: "success",
        });
        fetchShipments();
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to update tracking",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error tracking shipment:", error);
      setAlert({
        show: true,
        message: "Failed to update tracking",
        type: "error",
      });
    }
  };

  const handlePrintLabel = (shipment: Shipment) => {
    if (shipment?.shippingLabel) {
      window.open(shipment.shippingLabel, "_blank");
    } else {
      setAlert({
        show: true,
        message: "Shipping label not available",
        type: "warning",
      });
    }
  };

  const handleCancelShipment = async (shipment: Shipment) => {
    if (
      !confirm(
        `Are you sure you want to cancel shipment for order #${shipment.orderNumber}?`
      )
    ) {
      return;
    }

    try {
      let response: any;

      if (context === "admin") {
        response = await apiClient.post(
          `/api/admin/shipments/${shipment.id}/cancel`,
          {}
        );
      } else {
        response = await apiPost(
          `/api/seller/shipments/${shipment.id}/cancel`,
          {}
        );
      }

      if (response.success) {
        setAlert({
          show: true,
          message: "Shipment cancelled successfully",
          type: "success",
        });
        fetchShipments();
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to cancel shipment",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error cancelling shipment:", error);
      setAlert({
        show: true,
        message: "Failed to cancel shipment",
        type: "error",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "yellow",
      pickup_scheduled: "blue",
      in_transit: "purple",
      out_for_delivery: "indigo",
      delivered: "green",
      failed: "red",
      returned: "orange",
    };
    return colors[status] || "gray";
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

  // Table columns
  const columns = [
    {
      key: "orderNumber",
      label: "Order #",
      sortable: true,
      render: (shipment: Shipment) => (
        <Link
          href={orderDetailsUrl(shipment.orderId)}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          #{shipment.orderNumber}
        </Link>
      ),
    },
    {
      key: "trackingNumber",
      label: "Tracking #",
      sortable: true,
      render: (shipment: Shipment) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {shipment.trackingNumber}
        </span>
      ),
    },
    {
      key: "carrier",
      label: "Carrier",
      sortable: true,
    },
    ...(context === "admin"
      ? [
          {
            key: "seller",
            label: "Seller",
            sortable: true,
            render: (shipment: Shipment) => (
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                  {shipment.shopName || "Unknown Shop"}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {shipment.sellerEmail || "Unknown"}
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      key: "from",
      label: "From",
      sortable: true,
      render: (shipment: Shipment) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {shipment.fromAddress.city}, {shipment.fromAddress.state}
        </span>
      ),
    },
    {
      key: "to",
      label: "To",
      sortable: true,
      render: (shipment: Shipment) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {shipment.toAddress.city}, {shipment.toAddress.state}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (shipment: Shipment) => (
        <div className="flex items-center gap-1">
          {getStatusIcon(shipment.status)}
          <span className="text-sm">{formatStatus(shipment.status)}</span>
        </div>
      ),
      badge: (shipment: Shipment) => ({
        text: formatStatus(shipment.status),
        color: getStatusColor(shipment.status) as any,
      }),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (shipment: Shipment) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(shipment.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Stats cards
  const statsCards = [
    {
      label: "Total",
      value: stats.total,
      color: "gray",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "yellow",
    },
    {
      label: "Pickup Scheduled",
      value: stats.pickupScheduled,
      color: "blue",
    },
    {
      label: "In Transit",
      value: stats.inTransit,
      color: "purple",
    },
    {
      label: "Delivered",
      value: stats.delivered,
      color: "green",
    },
    {
      label: "Failed",
      value: stats.failed,
      color: "red",
    },
  ];

  // Status tabs
  const statusTabs = [
    { label: "All Shipments", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Pickup Scheduled", value: "pickup_scheduled" },
    { label: "In Transit", value: "in_transit" },
    { label: "Delivered", value: "delivered" },
    { label: "Failed", value: "failed" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          showBulkActions && context === "seller" ? (
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
          ) : undefined
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {stat.label}
            </p>
            <p
              className={`text-2xl font-bold ${
                stat.color === "gray"
                  ? "text-gray-900 dark:text-white"
                  : stat.color === "yellow"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : stat.color === "blue"
                  ? "text-blue-600 dark:text-blue-400"
                  : stat.color === "purple"
                  ? "text-purple-600 dark:text-purple-400"
                  : stat.color === "green"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {statusTabs.map((tab) => (
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
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <ModernDataTable
        data={shipments}
        columns={columns}
        loading={loading}
        emptyMessage="Shipments will appear here once you initiate shipping for orders"
        rowActions={[
          {
            label: "View Details",
            icon: <Eye className="w-4 h-4" />,
            onClick: (row: Shipment) => {
              window.location.href = detailsUrl(row.id);
            },
          },
          {
            label: "Update Tracking",
            icon: <RefreshCw className="w-4 h-4" />,
            onClick: (row: Shipment) => handleTrackShipment(row.id),
          },
          {
            label: "Print Label",
            icon: <Printer className="w-4 h-4" />,
            onClick: (row: Shipment) => handlePrintLabel(row),
          },
          {
            label: "Cancel Shipment",
            icon: <X className="w-4 h-4" />,
            onClick: (row: Shipment) => handleCancelShipment(row),
          },
        ]}
      />
    </div>
  );
}

