"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import Link from "next/link";
import type { SellerSale } from "@/types";
import { apiGet, apiPost, apiDelete } from "@/lib/api/seller";

function SalesListContent() {
  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
    },
    {
      label: "Sales",
      href: SELLER_ROUTES.SALES,
      active: true,
    },
  ]);

  const [sales, setSales] = useState<SellerSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [menuSaleId, setMenuSaleId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingSale, setDeletingSale] = useState(false);

  // Fetch sales from API
  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response: any = await apiGet<{
        success: boolean;
        data: SellerSale[];
      }>(
        `/api/seller/sales${params.toString() ? `?${params.toString()}` : ""}`
      );

      if (response.success && response.data) {
        setSales(response.data);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to load sales",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [statusFilter]);

  const handleToggleStatus = async (saleId: string) => {
    try {
      const response: any = await apiPost<{
        success: boolean;
        data: { status: string };
        message?: string;
      }>(`/api/seller/sales/${saleId}/toggle`, {});

      if (response.success) {
        // Update local state
        setSales(
          sales.map((s) =>
            s.id === saleId ? { ...s, status: response.data.status as any } : s
          )
        );

        setSnackbar({
          open: true,
          message:
            response.message ||
            `Sale ${
              response.data.status === "active" ? "activated" : "deactivated"
            } successfully`,
          severity: "success",
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to toggle sale status",
        severity: "error",
      });
    } finally {
      setMenuSaleId(null);
    }
  };

  const handleDeleteClick = (saleId: string) => {
    setMenuSaleId(null);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    const selectedSale = sales.find((s) => s.id === menuSaleId);
    if (!selectedSale) return;

    try {
      setDeletingSale(true);
      const response: any = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/api/seller/sales/${selectedSale.id}`);

      if (response.success) {
        // Remove from local state
        setSales(sales.filter((s) => s.id !== selectedSale.id));

        setSnackbar({
          open: true,
          message: "Sale deleted successfully",
          severity: "success",
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete sale",
        severity: "error",
      });
    } finally {
      setDeletingSale(false);
      setDeleteDialog(false);
      setMenuSaleId(null);
    }
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

  const getApplyToLabel = (applyTo: string) => {
    switch (applyTo) {
      case "all_products":
        return "All Products";
      case "specific_products":
        return "Specific Products";
      case "specific_categories":
        return "Specific Categories";
      default:
        return applyTo;
    }
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: sales.length,
    active: sales.filter((s) => s.status === "active").length,
    totalRevenue: sales.reduce((sum, s) => sum + s.stats.revenue, 0),
    totalOrders: sales.reduce((sum, s) => sum + s.stats.ordersCount, 0),
  };

  const selectedSale = sales.find((s) => s.id === menuSaleId);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sales
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage store-wide sales and promotions
            </p>
          </div>
          <Link
            href={SELLER_ROUTES.SALES_NEW}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Sale
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Total Sales
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Active Sales
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.active}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Total Orders
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalOrders}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Total Revenue
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              ₹{stats.totalRevenue.toLocaleString()}
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
                placeholder="Search sales..."
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

        {/* Sales Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="py-12 text-center">
              <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 dark:text-white font-medium mb-2">
                No sales found
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create sales to offer flat discounts on your products
              </p>
              <Link
                href={SELLER_ROUTES.SALES_NEW}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Sale
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Apply To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Revenue
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
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {sale.name}
                        </div>
                        {sale.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {sale.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {sale.discountType === "percentage"
                              ? `${sale.discountValue}%`
                              : `₹${sale.discountValue}`}
                          </div>
                          {sale.enableFreeShipping && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 mt-1">
                              Free Shipping
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getApplyToLabel(sale.applyTo)}
                        </div>
                        {sale.applyTo !== "all_products" && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {sale.stats.productsAffected} products
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {sale.stats.ordersCount}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                        ₹{sale.stats.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              sale.status
                            )}`}
                          >
                            {sale.status}
                          </span>
                          {sale.isPermanent && (
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
                              setMenuSaleId(
                                menuSaleId === sale.id ? null : sale.id
                              )
                            }
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>

                          {/* Dropdown Menu */}
                          {menuSaleId === sale.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuSaleId(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                                <Link
                                  href={SELLER_ROUTES.SALES_EDIT(sale.id)}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  onClick={() => setMenuSaleId(null)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleToggleStatus(sale.id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  {sale.status === "active" ? (
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
                                  onClick={() => handleDeleteClick(sale.id)}
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

        {/* Delete Confirmation Dialog */}
        {deleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => !deletingSale && setDeleteDialog(false)}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Delete Sale?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{selectedSale?.name}"? This
                action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteDialog(false)}
                  disabled={deletingSale}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingSale}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {deletingSale && <Loader2 className="w-4 h-4 animate-spin" />}
                  {deletingSale ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Snackbar for notifications */}
        {snackbar.open && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
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

export default function SalesList() {
  return (
    <RoleGuard requiredRole="seller">
      <SalesListContent />
    </RoleGuard>
  );
}
