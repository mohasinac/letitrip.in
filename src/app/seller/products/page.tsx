"use client";

import { SellerResourcePage } from "@/components/seller/SellerResourcePage";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Price } from "@/components/common/values";
import OptimizedImage from "@/components/common/OptimizedImage";
import Link from "next/link";
import { Eye, ExternalLink } from "lucide-react";

export default function ProductsPage() {
  return (
    <SellerResourcePage<ProductCardFE>
      resourceName="Product"
      resourceNamePlural="Products"
      loadData={async (options) => {
        const response = await productsService.list({
          search: options.search,
          ...options.filters,
          page: 1,
          limit: 50,
        });
        return {
          items: response.data || [],
          nextCursor: null,
          hasNextPage: false,
        };
      }}
      columns={[
        {
          key: "images",
          label: "Image",
          width: "80px",
          render: (product) => (
            <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
              {product.images?.[0] ? (
                <OptimizedImage
                  src={product.images[0]}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                  No image
                </div>
              )}
            </div>
          ),
        },
        {
          key: "name",
          label: "Product",
          sortable: true,
          render: (product) => (
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {product.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {product.slug}
              </div>
            </div>
          ),
        },
        {
          key: "price",
          label: "Price",
          sortable: true,
          render: (product) => (
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                <Price amount={product.price || 0} />
              </div>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                    <Price amount={product.compareAtPrice} />
                  </div>
                )}
            </div>
          ),
        },
        {
          key: "stockCount",
          label: "Stock",
          sortable: true,
          render: (product) => {
            const isLowStock =
              product.stockCount <= (product.lowStockThreshold || 5) &&
              product.stockCount > 0;
            const isOutOfStock = product.stockCount === 0;
            return (
              <div>
                <span
                  className={`font-medium ${
                    isOutOfStock
                      ? "text-red-600 dark:text-red-400"
                      : isLowStock
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-gray-900 dark:text-white"
                  }`}
                >
                  {product.stockCount}
                </span>
                {isLowStock && (
                  <div className="text-xs text-yellow-600 mt-1">Low stock</div>
                )}
                {isOutOfStock && (
                  <div className="text-xs text-red-600 mt-1">Out of stock</div>
                )}
              </div>
            );
          },
        },
        {
          key: "categoryId",
          label: "Category",
          render: (product) => (
            <span className="text-sm text-gray-900 dark:text-white">
              {product.categoryId || "Uncategorized"}
            </span>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (product) => <StatusBadge status={product.status} />,
        },
        {
          key: "actions",
          label: "Actions",
          render: (product) => (
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                title="View"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                href={`/seller/products/${product.slug}/edit`}
                className="rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                title="Full Edit"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          ),
        },
      ]}
      fields={[
        {
          name: "name",
          label: "Product Name",
          type: "text",
          required: true,
        },
        {
          name: "price",
          label: "Price",
          type: "number",
          required: true,
        },
        {
          name: "stockCount",
          label: "Stock",
          type: "number",
          required: true,
        },
        {
          name: "categoryId",
          label: "Category",
          type: "select",
          required: true,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
        },
      ]}
      bulkActions={[]}
      onSave={async (id: string, data: any) => {
        if (id) {
          await productsService.quickUpdate(data.slug || id, data);
        } else {
          await productsService.quickCreate(data);
        }
      }}
      onDelete={async (id: string) => {
        const product = await productsService.getById(id);
        await productsService.delete(product.slug);
      }}
      renderMobileCard={(product) => (
        <div className="p-4">
          <div className="flex gap-3">
            <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
              {product.images?.[0] ? (
                <OptimizedImage
                  src={product.images[0]}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {product.name}
                </h3>
                <StatusBadge status={product.status} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {product.categoryId || "Uncategorized"}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  <Price amount={product.price} />
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Stock: {product.stockCount}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Link
              href={`/seller/products/${product.slug}/edit`}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Edit
            </Link>
            <Link
              href={`/products/${product.slug}`}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              View
            </Link>
          </div>
        </div>
      )}
      renderGridCard={(product) => (
        <div className="group relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
            <OptimizedImage
              src={product.images?.[0] || "/placeholder-product.jpg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                {product.name}
              </h3>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {product.categoryId || "Uncategorized"}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                <Price amount={product.price} />
              </span>
              <StatusBadge status={product.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Stock: {product.stockCount}</span>
              <span>Sales: {product.salesCount || 0}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/seller/products/${product.slug}/edit`}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Edit
              </Link>
              <Link
                href={`/products/${product.slug}`}
                className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      )}
    />
  );
}
