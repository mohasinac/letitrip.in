/**
 * @fileoverview React Component
 * @module src/components/seller/ProductTable
 * @description This file contains the ProductTable component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { logError } from "@/lib/firebase-error-logger";
import { Eye, Edit, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Price } from "@/components/common/values/Price";
import { FormModal } from "@/components/common/FormModal";
import { ProductInlineForm } from "./ProductInlineForm";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

/**
 * ProductTableProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductTableProps
 */
interface ProductTableProps {
  /** Products */
  products: ProductCardFE[];
  /** Is Loading */
  isLoading?: boolean;
  /** On Refresh */
  onRefresh?: () => void;
}

export default function ProductTable({
  products,
  isLoading = false,
  onRefresh,
}: ProductTableProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductCardFE | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      setIsDeleting(true);
      await productsService.delete(selectedProduct.slug);
      setShowDeleteDialog(false);
      setSelectedProduct(null);
      onRefresh?.();
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "ProductTable.handleConfirmDelete",
        /** Metadata */
        metadata: { productSlug: selectedProduct.slug },
      });
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handles quick edit success event
   *
   * @returns {any} The handlequickeditsuccess result
   */

  /**
   * Handles quick edit success event
   *
   * @returns {any} The handlequickeditsuccess result
   */

  const handleQuickEditSuccess = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
    onRefresh?.();
  };

  const columns: Column<ProductCardFE>[] = [
    {
      /** Key */
      key: "image",
      /** Label */
      label: "Image",
      /** Width */
      width: "80px",
      /** Render */
      render: (_, ProductCardFE) => (
        <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
          {ProductCardFE.images?.[0] ? (
            <OptimizedImage
              src={ProductCardFE.images[0]}
              alt={ProductCardFE.name}
              width={48}
              height={48}
              className="rounded-lg"
              objectFit="cover"
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
      /** Key */
      key: "name",
      /** Label */
      label: "ProductCardFE Name",
      /** Sortable */
      sortable: true,
      /** Render */
      render: (_, ProductCardFE) => (
        <div className="min-w-[200px]">
          <div className="font-medium text-gray-900 dark:text-white">
            {ProductCardFE.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            /** S K U */
            SKU: {ProductCardFE.sku || "N/A"}
          </div>
        </div>
      ),
    },
    {
      /** Key */
      key: "categoryId",
      /** Label */
      label: "Category",
      /** Sortable */
      sortable: true,
      /** Render */
      render: (categoryId) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {categoryId || "Uncategorized"}
        </div>
      ),
    },
    {
      /** Key */
      key: "slug",
      /** Label */
      label: "Slug",
      /** Render */
      render: (slug) => (
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono max-w-[150px] truncate">
          {slug}
        </div>
      ),
    },
    {
      /** Key */
      key: "price",
      /** Label */
      label: "Price",
      /** Sortable */
      sortable: true,
      /** Render */
      render: (_, ProductCardFE) => (
        <div className="min-w-[100px]">
          <div className="font-medium text-gray-900 dark:text-white">
            <Price amount={ProductCardFE.price || 0} />
          </div>
          {ProductCardFE.originalPrice &&
            ProductCardFE.originalPrice > ProductCardFE.price && (
              <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                <Price amount={ProductCardFE.originalPrice} />
              </div>
            )}
        </div>
      ),
    },
    {
      /** Key */
      key: "stockCount",
      /** Label */
      label: "Stock",
      /** Sortable */
      sortable: true,
      /** Render */
      render: (stockCount, ProductCardFE) => {
        const isLowStock =
          stockCount <= (ProductCardFE.lowStockThreshold || 5) &&
          stockCount > 0;
        const isOutOfStock = stockCount === 0;

        return (
          <div className="min-w-[80px]">
            <span
              className={`font-medium ${
                isOutOfStock
                  ? "text-red-600 dark:text-red-400"
                  : isLowStock
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-gray-900 dark:text-white"
              }`}
            >
              {stockCount}
            </span>
            {isLowStock && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Low stock
              </div>
            )}
            {isOutOfStock && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                Out of stock
              </div>
            )}
          </div>
        );
      },
    },
    {
      /** Key */
      key: "status",
      /** Label */
      label: "Status",
      /** Sortable */
      sortable: true,
      /** Render */
      render: (status) => <StatusBadge status={status} />,
    },
    {
      /** Key */
      key: "actions",
      /** Label */
      label: "Actions",
      /** Width */
      width: "160px",
      /** Render */
      render: (_, ProductCardFE) => (
        <div className="flex items-center gap-2">
          {/* View Public Page */}
          <Link
            href={`/products/${ProductCardFE.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="View public page"
          >
            <Eye className="h-4 w-4" />
          </Link>

          {/* Quick Edit */}
          <button
            onClick={() => {
              setSelectedProduct(ProductCardFE);
              setShowEditModal(true);
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Quick edit"
          >
            <Edit className="h-4 w-4" />
          </button>

          {/* Edit Page */}
          <Link
            href={`/seller/products/${ProductCardFE.slug}/edit`}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Full edit page"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>

          {/* Delete */}
          <button
            onClick={() => {
              setSelectedProduct(ProductCardFE);
              setShowDeleteDialog(true);
            }}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete ProductCardFE"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={products}
        columns={columns}
        keyExtractor={(ProductCardFE) => ProductCardFE.id || ProductCardFE.slug}
        isLoading={isLoading}
        emptyMessage="No products found. Create your first ProductCardFE to get started."
        className="border border-gray-200 dark:border-gray-700 rounded-lg"
      />

      {/* Quick Edit Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        title="Quick Edit ProductCardFE"
      >
        <ProductInlineForm
          product={selectedProduct || undefined}
          onSuccess={handleQuickEditSuccess}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
        />
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDelete}
        title="Delete ProductCardFE"
        description={
          selectedProduct
            ? `Are you sure you want to delete "${selectedProduct.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete ProductCardFE"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
