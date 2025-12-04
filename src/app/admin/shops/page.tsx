"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { shopsService } from "@/services/shops.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Store, CheckCircle, XCircle } from "lucide-react";
import { getShopBulkActions } from "@/constants/bulk-actions";
import { SHOP_FIELDS, toInlineFields } from "@/constants/form-fields";
import type { ShopCardFE } from "@/types/frontend/shop.types";

export default function AdminShopsPage() {
  // Define columns
  const columns = [
    {
      key: "shop",
      label: "Shop",
      render: (shop: ShopCardFE) => (
        <div className="flex items-center gap-3">
          {shop.logo ? (
            <OptimizedImage
              src={shop.logo}
              alt={shop.name}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Store className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {shop.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {shop.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      render: (shop: ShopCardFE) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {shop.owner?.name || shop.owner?.email || "Unknown"}
        </div>
      ),
    },
    {
      key: "verification",
      label: "Verified",
      render: (shop: ShopCardFE) =>
        shop.isVerified ? (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Verified</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-400">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Not verified</span>
          </div>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (shop: ShopCardFE) => (
        <StatusBadge
          status={shop.isActive ? "active" : "inactive"}
          label={shop.isActive ? "Active" : "Inactive"}
        />
      ),
    },
    {
      key: "products",
      label: "Products",
      render: (shop: ShopCardFE) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {shop.productCount || 0}
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (shop: ShopCardFE) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {shop.rating ? `⭐ ${shop.rating.toFixed(1)}` : "No rating"}
        </div>
      ),
    },
    {
      key: "created",
      label: "Created",
      render: (shop: ShopCardFE) => (
        <DateDisplay date={new Date(shop.createdAt)} format="relative" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      key: "isVerified",
      label: "Verification",
      type: "select" as const,
      options: [
        { value: "all", label: "All" },
        { value: "true", label: "Verified" },
        { value: "false", label: "Not Verified" },
      ],
    },
    {
      key: "isActive",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "all", label: "All Status" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  // Load data function
  const loadData = async (options: {
    cursor: string | null;
    search?: string;
    filters?: Record<string, string>;
  }) => {
    const apiFilters: any = {
      page: options.cursor ? parseInt(options.cursor) : 1,
      limit: 20,
    };

    if (options.filters?.isVerified && options.filters.isVerified !== "all") {
      apiFilters.isVerified = options.filters.isVerified === "true";
    }
    if (options.filters?.isActive && options.filters.isActive !== "all") {
      apiFilters.isActive = options.filters.isActive === "true";
    }
    if (options.search) {
      apiFilters.search = options.search;
    }

    const response = await shopsService.list(apiFilters);
    const currentPage = apiFilters.page;
    const totalPages = Math.ceil((response.count || 0) / 20);

    return {
      items: (response.data || []) as ShopCardFE[],
      nextCursor: currentPage < totalPages ? String(currentPage + 1) : null,
      hasNextPage: currentPage < totalPages,
    };
  };

  // Handle save
  const handleSave = async (id: string, data: Partial<ShopCardFE>) => {
    await shopsService.update(id, data);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    await shopsService.delete(id);
  };

  return (
    <AdminResourcePage<ShopCardFE>
      resourceName="Shop"
      resourceNamePlural="Shops"
      loadData={loadData}
      columns={columns}
      fields={toInlineFields(SHOP_FIELDS)}
      bulkActions={getShopBulkActions(0)}
      onSave={handleSave}
      onDelete={handleDelete}
      filters={filters}
    />
  );
}
