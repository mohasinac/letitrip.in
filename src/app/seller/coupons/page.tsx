"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  Search,
  Loader2,
  AlertCircle,
  Ticket,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import Link from "next/link";
import type { SellerCoupon } from "@/types";
import { apiGet, apiPost, apiDelete } from "@/lib/api/seller";

function CouponsListContent() {
  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
    },
    {
      label: "Coupons",
      href: SELLER_ROUTES.COUPONS,
      active: true,
    },
  ]);

  const [coupons, setCoupons] = useState<SellerCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [menuCouponId, setMenuCouponId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch coupons from API
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response: any = await apiGet<{
        coupons: SellerCoupon[];
        total: number;
      }>(`/api/seller/coupons?${params.toString()}`);
      setCoupons(response.coupons);
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to load coupons",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [statusFilter]);

  const handleToggleStatus = async (couponId: string) => {
    try {
      const response: any = await apiPost(
        `/api/seller/coupons/${couponId}/toggle`,
        {}
      );

      // Update local state
      setCoupons(
        coupons.map((c) =>
          c.id === couponId
            ? {
                ...c,
                status: c.status === "active" ? "inactive" : ("active" as any),
              }
            : c
        )
      );

      setSnackbar({
        open: true,
        message: "Coupon status updated successfully",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error toggling coupon status:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update coupon status",
        severity: "error",
      });
    }
    setMenuCouponId(null);
  };

  const handleDuplicate = (couponId: string) => {
    // TODO: Implement duplicate functionality
    console.log("Duplicate coupon:", couponId);
    setMenuCouponId(null);
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      const response: any = await apiDelete(`/api/seller/coupons/${couponId}`);

      // Update local state
      setCoupons(coupons.filter((c) => c.id !== couponId));

      setSnackbar({
        open: true,
        message: "Coupon deleted successfully",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete coupon",
        severity: "error",
      });
    }
    setMenuCouponId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return "Percentage";
      case "fixed":
        return "Fixed Amount";
      case "free_shipping":
        return "Free Shipping";
      case "bogo":
        return "BOGO";
      case "cart_discount":
        return "Cart Discount";
      case "buy_x_get_y_cheapest":
        return "Buy X Get Y Free";
      case "buy_x_get_y_percentage":
        return "Buy X Get Y Discount";
      case "tiered_discount":
        return "Tiered Discount";
      case "bundle_discount":
        return "Bundle Discount";
      default:
        return type;
    }
  };

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
        return `Buy ${config.buyQuantity} Get ${
          config.getQuantity
        } Cheapest Free${config.repeatOffer ? " (Repeating)" : ""}`;

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
        return `Buy ${
          config.bundleProducts?.length || 0
        } products together: ${bundleDisc}`;

      default:
        return coupon.description || "";
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || coupon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.status === "active").length,
    totalUsage: coupons.reduce((sum, c) => sum + c.usedCount, 0),
  };

  const selectedCoupon = coupons.find((c) => c.id === menuCouponId);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Coupons
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage discount coupons and promotional codes
            </p>
          </div>
          <Link
            href={SELLER_ROUTES.COUPONS_NEW}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Coupon
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Total Coupons
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Active Coupons
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.active}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Total Usage
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalUsage}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="py-12 text-center">
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No coupons found
              </p>
              <Link
                href={SELLER_ROUTES.COUPONS_NEW}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Coupon
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCoupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {coupon.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getCouponDescription(coupon)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {getTypeLabel(coupon.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {coupon.type === "percentage"
                          ? `${coupon.value}%`
                          : coupon.type === "fixed"
                          ? `₹${coupon.value}`
                          : coupon.type === "free_shipping"
                          ? "Free"
                          : coupon.type === "buy_x_get_y_cheapest" ||
                            coupon.type === "buy_x_get_y_percentage"
                          ? `${coupon.advancedConfig?.buyQuantity}+${coupon.advancedConfig?.getQuantity}`
                          : coupon.type === "tiered_discount"
                          ? `${coupon.advancedConfig?.tiers?.length || 0} Tiers`
                          : coupon.type === "bundle_discount"
                          ? `${
                              coupon.advancedConfig?.bundleProducts?.length || 0
                            } Items`
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {coupon.usedCount}
                        {coupon.maxUses && ` / ${coupon.maxUses}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              coupon.status
                            )}`}
                          >
                            {coupon.status}
                          </span>
                          {coupon.isPermanent && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                              Permanent
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setMenuCouponId(
                                menuCouponId === coupon.id ? null : coupon.id
                              )
                            }
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>

                          {/* Dropdown Menu */}
                          {menuCouponId === coupon.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuCouponId(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                                <Link
                                  href={SELLER_ROUTES.COUPONS_EDIT(coupon.id)}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  onClick={() => setMenuCouponId(null)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleToggleStatus(coupon.id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  {coupon.status === "active" ? (
                                    <>
                                      <ToggleLeft className="w-4 h-4" />
                                      Disable
                                    </>
                                  ) : (
                                    <>
                                      <ToggleRight className="w-4 h-4" />
                                      Enable
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDuplicate(coupon.id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <Copy className="w-4 h-4" />
                                  Duplicate
                                </button>
                                <button
                                  onClick={() => handleDelete(coupon.id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
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

        {/* Success/Error Snackbar */}
        {snackbar.open && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
            <div
              className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg ${
                snackbar.severity === "success"
                  ? "bg-green-600 text-white"
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
    </div>
  );
}

export default function CouponsList() {
  return (
    <RoleGuard requiredRole="seller">
      <CouponsListContent />
    </RoleGuard>
  );
}
