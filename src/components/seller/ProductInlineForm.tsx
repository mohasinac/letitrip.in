"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import SlugInput from "@/components/common/SlugInput";
import { productsService } from "@/services/products.service";
import type { ProductFE, ProductCardFE } from "@/types/frontend/product.types";

interface ProductInlineFormProps {
  product?: ProductFE | ProductCardFE;
  shopId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductInlineForm({
  product,
  shopId,
  onSuccess,
  onCancel,
}: ProductInlineFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    price: product?.price || 0,
    stockCount: product?.stockCount || 0,
    categoryId: product?.categoryId || "",
    description: product && "description" in product ? product.description : "",
    condition: product && "condition" in product ? product.condition : "new",
    status: product?.status || "draft",
  });

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.slug) {
      newErrors.slug = "Slug is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!product && !shopId) {
      newErrors.form = "Shop ID is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      if (product) {
        // Update existing product
        await productsService.update(product.slug, formData as any);
      } else {
        // Create new product
        await productsService.create({
          ...formData,
          shopId,
          countryOfOrigin: "India",
          lowStockThreshold: 5,
          isReturnable: true,
          returnWindowDays: 7,
        } as any);
      }

      onSuccess();
    } catch (error: any) {
      console.error("Failed to save product:", error);
      setErrors({ form: error.message || "Failed to save product" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form-level error */}
      {errors.form && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">
            {errors.form}
          </p>
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="product-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Product Name *
        </label>
        <input
          id="product-name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            clearError("name");
          }}
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
            errors.name
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          }`}
        />
        {errors.name && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.name}
          </p>
        )}
      </div>

      {/* Slug */}
      <div>
        <SlugInput
          value={formData.slug}
          sourceText={formData.name}
          onChange={(slug: string) => {
            setFormData({ ...formData, slug });
            clearError("slug");
          }}
        />
        {errors.slug && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.slug}
          </p>
        )}
      </div>

      {/* Price */}
      <div>
        <label
          htmlFor="product-price"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Price (₹) *
        </label>
        <input
          id="product-price"
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => {
            setFormData({ ...formData, price: parseFloat(e.target.value) });
            clearError("price");
          }}
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
            errors.price
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          }`}
        />
        {errors.price && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.price}
          </p>
        )}
      </div>

      {/* Stock */}
      <div>
        <label
          htmlFor="product-stock"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Stock Count *
        </label>
        <input
          id="product-stock"
          type="number"
          required
          min="0"
          value={formData.stockCount}
          onChange={(e) =>
            setFormData({ ...formData, stockCount: parseInt(e.target.value) })
          }
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="product-category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Category ID *
        </label>
        <input
          id="product-category"
          type="text"
          required
          value={formData.categoryId}
          onChange={(e) =>
            setFormData({ ...formData, categoryId: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g., electronics"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="product-description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Description
        </label>
        <textarea
          id="product-description"
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {product ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
