"use client";

import { ConfirmDialog } from "@letitrip/react-library";
import { FormModal } from "@/components/common/FormModal";
import { OptimizedImage } from "@letitrip/react-library"
import { StatusBadge } from '@letitrip/react-library';
import { Price } from "@letitrip/react-library";
import { logError } from "@/lib/firebase-error-logger";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { Column, DataTable } from "@letitrip/react-library";
import { Edit, ExternalLink, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ProductInlineForm } from "./ProductInlineForm";

interface ProductTableProps {
  products: ProductCardFE[];
  isLoading?: boolean;
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
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

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
        component: "ProductTable.handleConfirmDelete",
        metadata: { productSlug: selectedProduct.slug },
      });
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickEditSuccess = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
    onRefresh?.();
  };

  const columns: Column<ProductCardFE>[] = [
    {
      key: "image",
      label: "Image",
      width: "80px",
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
      key: "name",
      label: "ProductCardFE Name",
      sortable: true,
      render: (_, ProductCardFE) => (
        <div className="min-w-[200px]">
          <div className="font-medium text-gray-900 dark:text-white">
            {ProductCardFE.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            SKU: {ProductCardFE.sku || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "categoryId",
      label: "Category",
      sortable: true,
      render: (categoryId) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {categoryId || "Uncategorized"}
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      render: (slug) => (
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono max-w-[150px] truncate">
          {slug}
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
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
      key: "stockCount",
      label: "Stock",
      sortable: true,
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
      key: "status",
      label: "Status",
      sortable: true,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: "actions",
      label: "Actions",
      width: "160px",
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
