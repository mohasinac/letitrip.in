"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Tag, ToggleRight } from "lucide-react";
import { useAuth } from '@/lib/contexts/AuthContext";
import { apiGet, apiPost, apiDelete } from "@/lib/api/seller";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";
import { ModernDataTable } from "@/components/ui/admin-seller/ModernDataTable";
import { UnifiedAlert } from "@/components/ui/unified";
import type { SellerSale } from "@/types/shared";

interface SaleStats {
  total: number;
  active: number;
  totalRevenue: number;
  totalOrders: number;
}

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

interface SalesProps {
  context: "admin" | "seller";
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  createUrl?: string;
  editUrl: (id: string) => string;
}

export default function Sales({
  context,
  title = "Sales",
  description = "Manage store-wide sales and promotions",
  breadcrumbs,
  createUrl,
  editUrl,
}: SalesProps) {
  const { user } = useAuth();
  const [sales, setSales] = useState<SellerSale[]>([]);
  const [stats, setStats] = useState<SaleStats>({
    total: 0,
    active: 0,
    totalRevenue: 0,
    totalOrders: 0,
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
      fetchSales();
    } else {
      setLoading(false);
    }
  }, [user, statusFilter, searchQuery]);

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

      let response: any;
      if (context === "admin") {
        response = await apiClient.get(
          `/api/admin/sales${params.toString() ? `?${params.toString()}` : ""}`
        );
      } else {
        response = await apiGet(
          `/api/seller/sales${params.toString() ? `?${params.toString()}` : ""}`
        );
      }

      if (response.success && response.data) {
        setSales(response.data);

        // Calculate stats
        const calculatedStats = {
          total: response.data.length,
          active: response.data.filter((s: SellerSale) => s.status === "active")
            .length,
          totalRevenue: response.data.reduce(
            (sum: number, s: SellerSale) => sum + (s.stats?.revenue || 0),
            0
          ),
          totalOrders: response.data.reduce(
            (sum: number, s: SellerSale) => sum + (s.stats?.ordersCount || 0),
            0
          ),
        };
        setStats(calculatedStats);
      }
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to load sales",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (saleId: string) => {
    try {
      let response: any;

      if (context === "admin") {
        response = await apiClient.post(
          `/api/admin/sales/${saleId}/toggle`,
          {}
        );
      } else {
        response = await apiPost(`/api/seller/sales/${saleId}/toggle`, {});
      }

      if (response.success) {
        // Update local state
        setSales(
          sales.map((s) =>
            s.id === saleId ? { ...s, status: response.data.status as any } : s
          )
        );

        setAlert({
          show: true,
          message:
            response.message ||
            `Sale ${
              response.data.status === "active" ? "activated" : "deactivated"
            } successfully`,
          type: "success",
        });
      }
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to toggle sale status",
        type: "error",
      });
    }
  };

  const handleDelete = async (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;

    if (
      !confirm(
        `Are you sure you want to delete "${sale.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      let response: any;

      if (context === "admin") {
        response = await apiClient.delete(`/api/admin/sales/${saleId}`);
      } else {
        response = await apiDelete(`/api/seller/sales/${saleId}`);
      }

      if (response.success) {
        // Remove from local state
        setSales(sales.filter((s) => s.id !== saleId));

        setAlert({
          show: true,
          message: "Sale deleted successfully",
          type: "success",
        });
      }
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to delete sale",
        type: "error",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "green",
      inactive: "gray",
      expired: "red",
      scheduled: "blue",
    };
    return colors[status] || "gray";
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

  // Table columns
  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (sale: SellerSale) => (
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {sale.name}
          </div>
          {sale.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {sale.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "discount",
      label: "Discount",
      sortable: true,
      render: (sale: SellerSale) => (
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
      ),
    },
    ...(context === "admin"
      ? [
          {
            key: "seller",
            label: "Seller",
            sortable: true,
            render: (sale: any) => (
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                  {sale.shopName || "Unknown Shop"}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {sale.sellerEmail || "Unknown"}
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      key: "applyTo",
      label: "Apply To",
      sortable: true,
      render: (sale: SellerSale) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white">
            {getApplyToLabel(sale.applyTo)}
          </div>
          {sale.applyTo !== "all_products" && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {sale.stats?.productsAffected || 0} products
            </div>
          )}
        </div>
      ),
    },
    {
      key: "orders",
      label: "Orders",
      sortable: true,
      render: (sale: SellerSale) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {sale.stats?.ordersCount || 0}
        </span>
      ),
    },
    {
      key: "revenue",
      label: "Revenue",
      sortable: true,
      render: (sale: SellerSale) => (
        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
          ₹{(sale.stats?.revenue || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (sale: SellerSale) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{sale.status}</span>
          {sale.isPermanent && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
              Permanent
            </span>
          )}
        </div>
      ),
      badge: (sale: SellerSale) => ({
        text: sale.status,
        color: getStatusColor(sale.status) as any,
      }),
    },
  ];

  // Row actions
  const rowActions = [
    {
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: (row: SellerSale) => {
        window.location.href = editUrl(row.id);
      },
    },
    {
      label: "Toggle Status",
      icon: <ToggleRight className="w-4 h-4" />,
      onClick: (row: SellerSale) => handleToggleStatus(row.id),
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: SellerSale) => handleDelete(row.id),
    },
  ];

  // Stats cards
  const statsCards = [
    {
      label: "Total Sales",
      value: stats.total,
      color: "gray",
    },
    {
      label: "Active Sales",
      value: stats.active,
      color: "green",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      color: "blue",
    },
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      color: "green",
    },
  ];

  // Status tabs
  const statusTabs = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Expired", value: "expired" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          createUrl && context === "seller" ? (
            <Link
              href={createUrl}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Sale
            </Link>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {stat.label}
            </p>
            <p
              className={`text-3xl font-bold ${
                stat.color === "gray"
                  ? "text-gray-900 dark:text-white"
                  : stat.color === "green"
                  ? "text-green-600 dark:text-green-400"
                  : "text-blue-600 dark:text-blue-400"
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

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sales by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <ModernDataTable
        data={sales}
        columns={columns}
        loading={loading}
        emptyMessage={
          context === "seller"
            ? "Create sales to offer flat discounts on your products"
            : "No sales found from any sellers"
        }
        rowActions={rowActions}
      />
    </div>
  );
}
