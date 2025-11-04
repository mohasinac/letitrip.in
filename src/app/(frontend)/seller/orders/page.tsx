"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  Printer,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from '@/contexts/SessionAuthContext';
import { apiGet, apiPost } from "@/lib/api/seller";
import { useRouter } from "next/navigation";
import {
  ModernDataTable,
  PageHeader,
  type TableColumn,
} from "@/components/ui/admin-seller";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedBadge } from "@/components/ui/unified/Badge";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { UnifiedModal } from "@/components/ui/unified/Modal";
import { UnifiedAlert } from "@/components/ui/unified/Alert";
import { SimpleTabs } from "@/components/ui/unified/Tabs";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku?: string;
  sellerId?: string;
  sellerName?: string;
  slug?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  userName?: string;
  userEmail?: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

interface OrderStats {
  total: number;
  pendingApproval: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

function OrdersListContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
    },
    {
      label: "Orders",
      href: SELLER_ROUTES.ORDERS,
      active: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pendingApproval: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "approve" | "reject" | null;
    order: Order | null;
    reason: string;
    loading: boolean;
  }>({
    open: false,
    type: null,
    order: null,
    reason: "",
    loading: false,
  });

  const tabs = [
    { id: "all", label: "All", count: stats.total },
    {
      id: "pending_approval",
      label: "Pending Approval",
      count: stats.pendingApproval,
    },
    { id: "processing", label: "Processing", count: stats.processing },
    { id: "shipped", label: "Shipped", count: stats.shipped },
    { id: "delivered", label: "Delivered", count: stats.delivered },
    { id: "cancelled", label: "Cancelled", count: stats.cancelled },
  ];

  // Fetch orders from API
  const fetchOrders = async () => {
    // Prevent calls when not authenticated
    if (!user || authLoading) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== "all") {
        params.append("status", activeTab);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await apiGet<{
        success: boolean;
        data: Order[];
        stats?: OrderStats;
      }>(
        `/api/seller/orders${params.toString() ? `?${params.toString()}` : ""}`
      );

      if (response.success) {
        setOrders(response.data || []);
        if (response.stats) {
          setStats(response.stats);
        }
      }
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to load orders",
        type: "error",
      });
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (user && !authLoading && isMounted) {
        await fetchOrders();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, user, authLoading]); // Re-fetch when tab, user, or auth state changes

  const handleAction = (type: "approve" | "reject", order: Order) => {
    setActionDialog({
      open: true,
      type,
      order,
      reason: "",
      loading: false,
    });
  };

  const confirmAction = async () => {
    if (!actionDialog.order || !actionDialog.type) return;

    // Validate rejection reason
    if (
      actionDialog.type === "reject" &&
      (!actionDialog.reason || actionDialog.reason.trim().length === 0)
    ) {
      setAlert({
        show: true,
        message: "Please provide a rejection reason",
        type: "error",
      });
      return;
    }

    try {
      setActionDialog({ ...actionDialog, loading: true });

      if (actionDialog.type === "approve") {
        const response = await apiPost<{ success: boolean; message?: string }>(
          `/api/seller/orders/${actionDialog.order.id}/approve`,
          {}
        );

        if (response.success) {
          setAlert({
            show: true,
            message: "Order approved successfully",
            type: "success",
          });
          fetchOrders();
        }
      } else if (actionDialog.type === "reject") {
        const response = await apiPost<{ success: boolean; message?: string }>(
          `/api/seller/orders/${actionDialog.order.id}/reject`,
          { reason: actionDialog.reason }
        );

        if (response.success) {
          setAlert({
            show: true,
            message: "Order rejected successfully",
            type: "success",
          });
          fetchOrders();
        }
      }

      setActionDialog({
        open: false,
        type: null,
        order: null,
        reason: "",
        loading: false,
      });
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || `Failed to ${actionDialog.type} order`,
        type: "error",
      });
      setActionDialog({ ...actionDialog, loading: false });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "warning";
      case "processing":
        return "primary";
      case "shipped":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "refunded":
        return "primary";
      default:
        return "default";
    }
  };

  // Table columns configuration
  const columns: TableColumn<Order>[] = [
    {
      key: "orderNumber",
      label: "Order #",
      sortable: true,
      render: (_, order) => (
        <span className="font-semibold text-primary">{order.orderNumber}</span>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true,
      render: (_, order) => (
        <div className="min-w-0">
          <p className="font-medium text-text truncate">
            {order.customerName || order.userName || "Unknown"}
          </p>
          <p className="text-xs text-textSecondary truncate">
            {order.customerEmail || order.userEmail || "N/A"}
          </p>
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      align: "center",
      sortable: true,
      render: (_, order) => (
        <span className="text-text">{order.items?.length || 0}</span>
      ),
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      sortable: true,
      render: (_, order) => (
        <span className="font-semibold text-text">
          ₹{order.total.toLocaleString()}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (_, order) => (
        <div>
          <UnifiedBadge
            size="sm"
            variant={getPaymentStatusVariant(order.paymentStatus) as any}
            className="mb-1"
          >
            {order.paymentStatus}
          </UnifiedBadge>
          <p className="text-xs text-textSecondary">{order.paymentMethod}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, order) => (
        <UnifiedBadge variant={getStatusVariant(order.status) as any}>
          {order.status.replace("_", " ")}
        </UnifiedBadge>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (_, order) => (
        <span className="text-sm text-text">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Row actions - dynamically show approve/reject for pending orders
  const getRowActions = (order: Order) => {
    const actions: any[] = [
      {
        label: "View Details",
        icon: <Eye className="w-4 h-4" />,
        onClick: (order: Order) => {
          router.push(`/seller/orders/${order.id}`);
        },
      },
    ];

    if (order.status === "pending_approval") {
      actions.push({
        label: "Approve Order",
        icon: <CheckCircle className="w-4 h-4" />,
        onClick: (order: Order) => handleAction("approve", order),
      });
      actions.push({
        label: "Reject Order",
        icon: <XCircle className="w-4 h-4" />,
        onClick: (order: Order) => handleAction("reject", order),
      });
    }

    actions.push({
      label: "Print Invoice",
      icon: <Printer className="w-4 h-4" />,
      onClick: () => {
        setAlert({
          show: true,
          message: "Print invoice functionality coming soon",
          type: "warning",
        });
      },
    });

    return actions;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Alert */}
      {alert.show && (
        <UnifiedAlert
          variant={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </UnifiedAlert>
      )}

      {/* Page Header */}
      <PageHeader
        title="Orders"
        description="Manage customer orders and fulfillment"
        breadcrumbs={[
          { label: "Seller", href: SELLER_ROUTES.DASHBOARD },
          { label: "Orders" },
        ]}
        badge={{ text: `${stats.total} orders`, variant: "primary" }}
        actions={
          <UnifiedButton
            variant="outline"
            icon={<Receipt />}
            onClick={() => router.push("/seller/orders/bulk-invoice")}
          >
            Bulk Invoice
          </UnifiedButton>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slideUp">
        <UnifiedCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Total Orders</p>
              <p className="text-2xl font-bold text-text">{stats.total}</p>
            </div>
          </div>
        </UnifiedCard>

        <UnifiedCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Pending Approval</p>
              <p className="text-2xl font-bold text-warning">
                {stats.pendingApproval}
              </p>
            </div>
          </div>
        </UnifiedCard>

        <UnifiedCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Processing</p>
              <p className="text-2xl font-bold text-primary">
                {stats.processing}
              </p>
            </div>
          </div>
        </UnifiedCard>

        <UnifiedCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Delivered</p>
              <p className="text-2xl font-bold text-success">
                {stats.delivered}
              </p>
            </div>
          </div>
        </UnifiedCard>
      </div>

      {/* Tabs */}
      <UnifiedCard className="p-0 overflow-hidden">
        <SimpleTabs
          tabs={tabs.map((tab) => ({
            id: tab.id,
            label: `${tab.label}${tab.count > 0 ? ` (${tab.count})` : ""}`,
          }))}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />
      </UnifiedCard>

      {/* Search */}
      <UnifiedCard className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by order number, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchOrders();
                }
              }}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <UnifiedButton variant="outline" onClick={fetchOrders}>
            Search
          </UnifiedButton>
        </div>
      </UnifiedCard>

      {/* Orders Table */}
      <ModernDataTable
        data={orders}
        columns={columns}
        loading={loading}
        searchable={false} // We have custom search above
        rowActions={getRowActions}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyMessage={
          searchQuery
            ? "No orders found. Try adjusting your search"
            : "Orders will appear here when customers place them"
        }
        getRowId={(order) => order.id}
        rowClassName={(order) =>
          order.status === "pending_approval" ? "bg-warning/5" : ""
        }
      />

      {/* Action Confirmation Modal */}
      <UnifiedModal
        open={actionDialog.open}
        onClose={() =>
          !actionDialog.loading &&
          setActionDialog({
            open: false,
            type: null,
            order: null,
            reason: "",
            loading: false,
          })
        }
        title={
          actionDialog.type === "approve" ? "Approve Order?" : "Reject Order?"
        }
        footer={
          <div className="flex gap-2 justify-end">
            <UnifiedButton
              variant="outline"
              onClick={() =>
                setActionDialog({
                  open: false,
                  type: null,
                  order: null,
                  reason: "",
                  loading: false,
                })
              }
              disabled={actionDialog.loading}
            >
              Cancel
            </UnifiedButton>
            <UnifiedButton
              variant={
                actionDialog.type === "approve" ? "success" : "destructive"
              }
              onClick={confirmAction}
              loading={actionDialog.loading}
            >
              {actionDialog.loading
                ? "Processing..."
                : actionDialog.type === "approve"
                ? "Approve"
                : "Reject"}
            </UnifiedButton>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-textSecondary">
            {actionDialog.type === "approve"
              ? `Are you sure you want to approve order ${actionDialog.order?.orderNumber}? This will move it to processing.`
              : `Are you sure you want to reject order ${actionDialog.order?.orderNumber}? The customer will be notified.`}
          </p>

          {actionDialog.type === "reject" && (
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Rejection Reason <span className="text-error">*</span>
              </label>
              <textarea
                value={actionDialog.reason}
                onChange={(e) =>
                  setActionDialog({ ...actionDialog, reason: e.target.value })
                }
                rows={3}
                placeholder="Please provide a reason for rejecting this order..."
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                required
              />
            </div>
          )}
        </div>
      </UnifiedModal>
    </div>
  );
}

export default function OrdersList() {
  return (
    <RoleGuard requiredRole="seller">
      <OrdersListContent />
    </RoleGuard>
  );
}
