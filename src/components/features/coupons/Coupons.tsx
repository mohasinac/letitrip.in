"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  Ticket,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { UnifiedCard, CardContent } from "@/components/ui/unified/Card";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedBadge } from "@/components/ui/unified/Badge";
import { UnifiedAlert } from "@/components/ui/unified/Alert";
import { UnifiedModal } from "@/components/ui/unified/Modal";
import { ModernDataTable } from "@/components/ui/admin-seller/ModernDataTable";
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";
import { apiClient } from "@/lib/api/client";
import { apiGet, apiDelete, apiPost } from "@/lib/api/seller";
import type { TableColumn } from "@/components/ui/admin-seller/ModernDataTable";
import type { SellerCoupon } from "@/types/shared";

interface CouponStats {
  total: number;
  active: number;
  totalUsage: number;
  expired?: number;
}

interface CouponsProps {
  context: "admin" | "seller";
  title: string;
  description: string;
  breadcrumbs: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
  createUrl: string;
  editUrl: (id: string) => string;
}

export default function Coupons({
  context,
  title,
  description,
  breadcrumbs,
  createUrl,
  editUrl,
}: CouponsProps) {
  const [coupons, setCoupons] = useState<SellerCoupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch coupons and stats
  useEffect(() => {
    fetchData();
  }, [context, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      if (context === "admin") {
        // Admin: Fetch from admin API
        const response = await apiClient.get(
          `/api/admin/coupons?${params.toString()}`
        );
        setCoupons(response.data || []);

        // Calculate stats from data
        const data = response.data || [];
        setStats({
          total: data.length,
          active: data.filter((c: SellerCoupon) => c.status === "active")
            .length,
          totalUsage: data.reduce(
            (sum: number, c: SellerCoupon) => sum + c.usedCount,
            0
          ),
          expired: data.filter((c: SellerCoupon) => c.status === "expired")
            .length,
        });
      } else {
        // Seller: Fetch from seller API
        const response = (await apiGet(
          `/api/seller/coupons?${params.toString()}`
        )) as { coupons: SellerCoupon[]; total: number };

        setCoupons(response.coupons || []);

        // Calculate stats
        const data = response.coupons || [];
        setStats({
          total: data.length,
          active: data.filter((c) => c.status === "active").length,
          totalUsage: data.reduce((sum, c) => sum + c.usedCount, 0),
          expired: data.filter((c) => c.status === "expired").length,
        });
      }
    } catch (err: unknown) {
      console.error("Error fetching coupons:", err);
      setError(err instanceof Error ? err.message : "Failed to load coupons");
      setCoupons([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Toggle coupon status
  const handleToggleStatus = async (couponId: string) => {
    try {
      if (context === "admin") {
        await apiClient.post(`/api/admin/coupons/${couponId}/toggle`, {});
      } else {
        await apiPost(`/api/seller/coupons/${couponId}/toggle`, {});
      }

      // Update local state
      setCoupons(
        coupons.map((c) =>
          c.id === couponId
            ? {
                ...c,
                status:
                  c.status === "active"
                    ? ("inactive" as const)
                    : ("active" as const),
              }
            : c
        )
      );

      setSuccessMessage("Coupon status updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      console.error("Error toggling coupon status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update coupon status"
      );
    }
  };

  // Delete coupon
  const handleDelete = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      if (context === "admin") {
        await apiClient.delete(`/api/admin/coupons/${couponId}`);
      } else {
        await apiDelete(`/api/seller/coupons/${couponId}`);
      }

      // Update local state
      setCoupons(coupons.filter((c) => c.id !== couponId));

      setSuccessMessage("Coupon deleted successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      console.error("Error deleting coupon:", err);
      setError(err instanceof Error ? err.message : "Failed to delete coupon");
    }
  };

  // Duplicate coupon
  const handleDuplicate = (couponId: string) => {
    // TODO: Implement duplicate functionality
    console.log("Duplicate coupon:", couponId);
    setSuccessMessage("Duplicate functionality coming soon");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Status badge variant
  const getStatusVariant = (
    status: string
  ): "default" | "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "expired":
        return "error";
      case "scheduled":
        return "info";
      default:
        return "default";
    }
  };

  // Type label
  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      percentage: "Percentage",
      fixed: "Fixed Amount",
      free_shipping: "Free Shipping",
      bogo: "BOGO",
      cart_discount: "Cart Discount",
      buy_x_get_y_cheapest: "Buy X Get Y Free",
      buy_x_get_y_percentage: "Buy X Get Y Discount",
      tiered_discount: "Tiered Discount",
      bundle_discount: "Bundle Discount",
    };
    return labels[type] || type;
  };

  // Coupon description
  const getCouponDescription = (coupon: SellerCoupon): string => {
    const config = coupon.advancedConfig;

    switch (coupon.type) {
      case "percentage":
        return `${coupon.value}% off`;
      case "fixed":
        return `₹${coupon.value} off`;
      case "free_shipping":
        return "Free shipping";
      case "bogo":
        return "Buy one get one";
      case "cart_discount":
        return `₹${coupon.value} cart discount`;
      case "buy_x_get_y_cheapest":
        if (!config) return "Buy X Get Y Free";
        return `Buy ${config.buyQuantity} Get ${config.getQuantity} Cheapest Free`;
      case "buy_x_get_y_percentage":
        if (!config) return "Buy X Get Y Discount";
        const discountText =
          config.getDiscountType === "free"
            ? "Free"
            : config.getDiscountType === "percentage"
            ? `${config.getDiscountValue}% Off`
            : `₹${config.getDiscountValue} Off`;
        return `Buy ${config.buyQuantity} Get ${config.getQuantity} at ${discountText}`;
      case "tiered_discount":
        if (!config?.tiers || config.tiers.length === 0)
          return "Tiered Discount";
        const tierCount = config.tiers.length;
        const firstTier = config.tiers[0];
        const lastTier = config.tiers[tierCount - 1];
        return `${tierCount} Tiers: ${firstTier.discountValue}% to ${lastTier.discountValue}%`;
      case "bundle_discount":
        if (!config) return "Bundle Discount";
        const bundleDisc =
          config.bundleDiscountType === "percentage"
            ? `${config.bundleDiscountValue}% off`
            : `₹${config.bundleDiscountValue} off`;
        return `${config.bundleProducts?.length || 0} products: ${bundleDisc}`;
      default:
        return coupon.description || "";
    }
  };

  // Filter coupons by search
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      searchQuery === "" ||
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Define table columns
  const columns: TableColumn<SellerCoupon>[] = [
    {
      key: "code",
      label: "Coupon Code",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-gray-400" />
            <span className="font-mono font-semibold text-gray-900 dark:text-white">
              {value}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {row.name}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (value) => (
        <UnifiedBadge variant="default" size="sm">
          {getTypeLabel(value)}
        </UnifiedBadge>
      ),
    },
    {
      key: "value",
      label: "Discount",
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            {getCouponDescription(row)}
          </div>
        </div>
      ),
    },
    {
      key: "usedCount",
      label: "Usage",
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {value}
          </span>
          {row.maxUses && (
            <span className="text-gray-500 dark:text-gray-400">
              {" "}
              / {row.maxUses}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "endDate",
      label: "Expires",
      sortable: true,
      render: (value, row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.isPermanent ? "Never" : formatDate(value)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <UnifiedBadge variant={getStatusVariant(value)} size="sm">
          {value}
        </UnifiedBadge>
      ),
    },
  ];

  // Stats cards
  const statsCards = [
    {
      title: "Total Coupons",
      value: stats?.total || 0,
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Active Coupons",
      value: stats?.active || 0,
      icon: ToggleRight,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Total Usage",
      value: stats?.totalUsage || 0,
      icon: Ticket,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    ...(stats?.expired !== undefined
      ? [
          {
            title: "Expired",
            value: stats.expired,
            icon: AlertCircle,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-900/20",
          },
        ]
      : []),
  ];

  // Status tabs
  const statusTabs = [
    { id: "all", label: "All", count: stats?.total || 0 },
    { id: "active", label: "Active", count: stats?.active || 0 },
    {
      id: "inactive",
      label: "Inactive",
      count: (stats?.total || 0) - (stats?.active || 0) - (stats?.expired || 0),
    },
    { id: "expired", label: "Expired", count: stats?.expired || 0 },
  ];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header */}
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={
            <UnifiedButton onClick={() => (window.location.href = createUrl)}>
              <Plus className="w-4 h-4" />
              Create Coupon
            </UnifiedButton>
          }
        />

        {/* Success Message */}
        {successMessage && (
          <UnifiedAlert variant="success" className="mb-6">
            {successMessage}
          </UnifiedAlert>
        )}

        {/* Error Alert */}
        {error && (
          <UnifiedAlert variant="error" className="mb-6">
            {error}
          </UnifiedAlert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statsCards.map((stat) => (
            <UnifiedCard key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loading ? "-" : stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </UnifiedCard>
          ))}
        </div>

        {/* Filters */}
        <UnifiedCard className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search coupons by code or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </UnifiedCard>

        {/* Status Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-8 overflow-x-auto">
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    statusFilter === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      statusFilter === tab.id
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <UnifiedCard>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-primary"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading coupons...
                </p>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="p-12 text-center">
                <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No coupons found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Create your first coupon to get started"}
                </p>
                {!searchQuery && (
                  <UnifiedButton
                    onClick={() => (window.location.href = createUrl)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Coupon
                  </UnifiedButton>
                )}
              </div>
            ) : (
              <ModernDataTable
                columns={columns}
                data={filteredCoupons}
                rowActions={[
                  {
                    label: "Edit",
                    icon: <Edit className="w-4 h-4" />,
                    onClick: (row: SellerCoupon) => {
                      window.location.href = editUrl(row.id);
                    },
                  },
                  {
                    label: "Toggle Status",
                    icon: <ToggleRight className="w-4 h-4" />,
                    onClick: (row: SellerCoupon) => handleToggleStatus(row.id),
                  },
                  {
                    label: "Duplicate",
                    icon: <Copy className="w-4 h-4" />,
                    onClick: (row: SellerCoupon) => handleDuplicate(row.id),
                  },
                  {
                    label: "Delete",
                    icon: <Trash2 className="w-4 h-4" />,
                    onClick: (row: SellerCoupon) => handleDelete(row.id),
                  },
                ]}
              />
            )}
          </CardContent>
        </UnifiedCard>
      </div>
    </div>
  );
}
