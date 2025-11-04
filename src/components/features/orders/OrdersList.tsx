/**
 * Reusable Orders List Component
 * Can be used by both Admin and Seller pages with different contexts
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  Printer,
  Receipt,
  ShoppingBag,
  Package,
  TrendingUp,
  DollarSign,
  Clock,
} from "lucide-react";
import { useAuth } from '@/contexts/SessionAuthContext';
import { apiClient } from "@/lib/api/client";
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
  sellerId?: string;
  sellerName?: string;
  createdAt: string;
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  totalSellers?: number;
  codOrders?: number;
  prepaidOrders?: number;
  avgOrderValue?: number;
}

interface OrdersListProps {
  /**
   * Context: 'admin' or 'seller'
   * Determines API endpoints and permissions
   */
  context: "admin" | "seller";

  /**
   * Base path for navigation
   */
  basePath: string;

  /**
   * Breadcrumbs for navigation
   */
  breadcrumbs: Array<{ label: string; href?: string; active?: boolean }>;

  /**
   * Show seller information in table (admin only)
   */
  showSellerInfo?: boolean;
}

export function OrdersList({
  context,
  basePath,
  breadcrumbs,
  showSellerInfo = false,
}: OrdersListProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
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
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    action: string;
    loading: boolean;
  }>({
    open: false,
    action: "",
    loading: false,
  });

  // Determine API endpoint based on context
  const apiEndpoint =
    context === "admin" ? "/api/admin/orders" : "/api/seller/orders";
  const statsEndpoint =
    context === "admin"
      ? "/api/admin/orders/stats"
      : "/api/seller/orders/stats";

  const tabs = [
    { id: "all", label: "All", count: stats.total },
    { id: "pending", label: "Pending", count: stats.pending },
    { id: "processing", label: "Processing", count: stats.processing },
    { id: "shipped", label: "Shipped", count: stats.shipped },
    { id: "delivered", label: "Delivered", count: stats.delivered },
    { id: "cancelled", label: "Cancelled", count: stats.cancelled },
  ];

  // Fetch orders from API
  const fetchOrders = async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", pageSize.toString());

      if (activeTab !== "all") {
        params.append("status", activeTab);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await apiClient.get<Order[]>(
        `${apiEndpoint}?${params.toString()}`
      );

      setOrders(response || []);
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

  // Fetch stats
  const fetchStats = async () => {
    if (!user || authLoading) return;

    try {
      const response = await apiClient.get<OrderStats>(statsEndpoint);
      setStats(response || stats);
    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchOrders();
      fetchStats();
    }
  }, [user, authLoading, activeTab, page, pageSize]);

  // Handle bulk status update (admin only)
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0 || context !== "admin") return;

    try {
      setBulkActionDialog({ open: false, action: "", loading: true });

      await apiClient.patch("/api/admin/orders", {
        ids: selectedOrders,
        status: newStatus,
      });

      setAlert({
        show: true,
        message: `${selectedOrders.length} order(s) updated successfully`,
        type: "success",
      });

      setSelectedOrders([]);
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to update orders",
        type: "error",
      });
    } finally {
      setBulkActionDialog({ open: false, action: "", loading: false });
    }
  };

  // Table columns
  const columns: TableColumn<Order>[] = [
    {
      key: "orderNumber",
      label: "Order #",
      sortable: true,
      render: (_, order) => (
        <div>
          <p className="font-medium text-text">{order.orderNumber}</p>
          <p className="text-xs text-textSecondary">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      render: (_, order) => (
        <div>
          <p className="font-medium text-text">
            {order.customerName || order.userName || "Unknown"}
          </p>
          <p className="text-xs text-textSecondary">
            {order.customerEmail || order.userEmail || "N/A"}
          </p>
        </div>
      ),
    },
    ...(showSellerInfo
      ? [
          {
            key: "seller",
            label: "Seller",
            sortable: false,
            render: (_: any, order: Order) => (
              <div>
                <p className="text-sm text-text">
                  {order.sellerName || "Unknown"}
                </p>
                <p className="text-xs text-textSecondary truncate">
                  {order.sellerId}
                </p>
              </div>
            ),
          },
        ]
      : []),
    {
      key: "items",
      label: "Items",
      sortable: true,
      render: (_, order) => (
        <div className="text-center">
          <p className="font-medium text-text">{order.items?.length || 0}</p>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (_, order) => (
        <p className="font-semibold text-text">
          ₹{order.total?.toLocaleString() || 0}
        </p>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment",
      sortable: true,
      render: (_, order) => (
        <UnifiedBadge
          variant={order.paymentMethod === "cod" ? "warning" : "success"}
        >
          {order.paymentMethod?.toUpperCase()}
        </UnifiedBadge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_, order) => {
        const variantMap: Record<string, "success" | "warning" | "error"> = {
          delivered: "success",
          shipped: "success",
          processing: "warning",
          pending: "warning",
          pending_approval: "warning",
          cancelled: "error",
        };
        return (
          <UnifiedBadge variant={variantMap[order.status] || "warning"}>
            {order.status?.replace("_", " ").toUpperCase()}
          </UnifiedBadge>
        );
      },
    },
  ];

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: <Eye className="w-4 h-4" />,
      onClick: (order: Order) => {
        router.push(`${basePath}/${order.id}`);
      },
    },
    {
      label: "Generate Invoice",
      icon: <Receipt className="w-4 h-4" />,
      onClick: (order: Order) => {
        // TODO: Implement invoice generation
        setAlert({
          show: true,
          message: "Invoice generation coming soon",
          type: "warning",
        });
      },
    },
  ];

  // Bulk actions (admin only)
  const bulkActions =
    context === "admin"
      ? [
          {
            label: "Mark as Processing",
            icon: <Package className="w-4 h-4" />,
            onClick: () => {
              setBulkActionDialog({
                open: true,
                action: "processing",
                loading: false,
              });
            },
          },
          {
            label: "Mark as Shipped",
            icon: <CheckCircle className="w-4 h-4" />,
            onClick: () => {
              setBulkActionDialog({
                open: true,
                action: "shipped",
                loading: false,
              });
            },
          },
          {
            label: "Mark as Delivered",
            icon: <CheckCircle className="w-4 h-4" />,
            onClick: () => {
              setBulkActionDialog({
                open: true,
                action: "delivered",
                loading: false,
              });
            },
          },
        ]
      : [];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
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
          description={`Manage ${context === "admin" ? "all" : "your"} orders`}
          breadcrumbs={breadcrumbs}
          badge={{ text: `${stats.total} total`, variant: "primary" }}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-textSecondary">Pending</p>
                <p className="text-2xl font-bold text-warning">
                  {stats.pending}
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

          <UnifiedCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-info/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-textSecondary">Revenue</p>
                <p className="text-2xl font-bold text-text">
                  ₹{(stats.totalRevenue / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
          </UnifiedCard>
        </div>

        {/* Tabs */}
        <SimpleTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {/* Search */}
        <UnifiedCard className="p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by order number, customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchOrders();
                  }
                }}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50"
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
          selectable={context === "admin"}
          searchable={false}
          bulkActions={bulkActions}
          rowActions={rowActions}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          emptyMessage="No orders found. Try adjusting your filters."
          getRowId={(order) => order.id}
        />

        {/* Bulk Action Confirmation Modal */}
        {context === "admin" && (
          <UnifiedModal
            open={bulkActionDialog.open}
            onClose={() =>
              setBulkActionDialog({ open: false, action: "", loading: false })
            }
            title="Confirm Bulk Action"
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-textSecondary">
                Are you sure you want to mark {selectedOrders.length} order(s)
                as {bulkActionDialog.action}?
              </p>
              <div className="flex gap-3 justify-end">
                <UnifiedButton
                  variant="outline"
                  onClick={() =>
                    setBulkActionDialog({
                      open: false,
                      action: "",
                      loading: false,
                    })
                  }
                  disabled={bulkActionDialog.loading}
                >
                  Cancel
                </UnifiedButton>
                <UnifiedButton
                  variant="primary"
                  onClick={() =>
                    handleBulkStatusUpdate(bulkActionDialog.action)
                  }
                  loading={bulkActionDialog.loading}
                >
                  Confirm
                </UnifiedButton>
              </div>
            </div>
          </UnifiedModal>
        )}
      </div>
    </div>
  );
}

