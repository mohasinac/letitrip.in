"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { productsService } from "@/services/products.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values";
import { Price } from "@/components/common/values/Price";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Package } from "lucide-react";
import { getProductBulkActions } from "@/constants/bulk-actions";
import { PRODUCT_FIELDS, toInlineFields } from "@/constants/form-fields";
import type { ProductCardFE } from "@/types/frontend/product.types";

export default function AdminProductsPage() {
  // Define columns
  const columns = [
    {
      key: "product",
      label: "Product",
      render: (product: ProductCardFE) => (
        <div className="flex items-center gap-3">
          {product.images && product.images[0] ? (
            <OptimizedImage
              src={product.images[0]}
              alt={product.name}
              width={60}
              height={60}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-[60px] h-[60px] rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {product.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {product.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (product: ProductCardFE) => <Price amount={product.price} />,
    },
    {
      key: "stock",
      label: "Stock",
      render: (product: ProductCardFE) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {product.stockCount || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {product.stockCount && product.stockCount > 0
              ? product.stockCount < 10
                ? "Low stock"
                : "In stock"
              : "Out of stock"}
          </div>
        </div>
      ),
    },
    {
      key: "seller",
      label: "Shop",
      render: (product: ProductCardFE) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {product.shop?.name || "No shop"}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (product: ProductCardFE) => (
        <StatusBadge status={product.status || "pending"} />
      ),
    },
    {
      key: "created",
      label: "Created",
      render: (product: ProductCardFE) => (
        <DateDisplay date={new Date()} format="medium" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    {
      key: "inStock",
      label: "Stock",
      type: "select" as const,
      options: [
        { value: "all", label: "All" },
        { value: "true", label: "In Stock" },
        { value: "false", label: "Out of Stock" },
      ],
    },
    {
      key: "minPrice",
      label: "Min Price",
      type: "text" as const,
    },
    {
      key: "maxPrice",
      label: "Max Price",
      type: "text" as const,
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

    if (options.filters?.status && options.filters.status !== "all") {
      apiFilters.status = options.filters.status;
    }
    if (options.filters?.inStock && options.filters.inStock !== "all") {
      apiFilters.inStock = options.filters.inStock === "true";
    }
    if (options.filters?.minPrice) {
      apiFilters.minPrice = parseFloat(options.filters.minPrice);
    }
    if (options.filters?.maxPrice) {
      apiFilters.maxPrice = parseFloat(options.filters.maxPrice);
    }
    if (options.search) {
      apiFilters.search = options.search;
    }

    const response = await productsService.list(apiFilters);
    const currentPage = apiFilters.page;
    const totalPages = Math.ceil((response.count || 0) / 20);

    return {
      items: (response.data || []) as ProductCardFE[],
      nextCursor: currentPage < totalPages ? String(currentPage + 1) : null,
      hasNextPage: currentPage < totalPages,
    };
  };

  // Handle save
  const handleSave = async (id: string, data: Partial<ProductCardFE>) => {
    await productsService.update(id, data as any);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    await productsService.delete(id);
  };

  return (
    <AdminResourcePage<ProductCardFE>
      resourceName="Product"
      resourceNamePlural="Products"
      loadData={loadData}
      columns={columns}
      fields={toInlineFields(PRODUCT_FIELDS)}
      bulkActions={getProductBulkActions(0)}
      onSave={handleSave}
      onDelete={handleDelete}
      filters={filters}
    />
  );
}
