/**
 * @fileoverview React Component
 * @module src/components/seller/ProductInlineForm
 * @description This file contains the ProductInlineForm component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logError } from "@/lib/firebase-error-logger";
import SlugInput from "@/components/common/SlugInput";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { productsService } from "@/services/products.service";
import type { ProductFE, ProductCardFE } from "@/types/frontend/product.types";

/**
 * ProductInlineFormProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductInlineFormProps
 */
interface ProductInlineFormProps {
  /** Product */
  product?: ProductFE | ProductCardFE;
  /** Shop Id */
  shopId?: string;
  /** On Success */
  onSuccess: () => void;
  /** On Cancel */
  onCancel: () => void;
}

/**
 * Function: Product Inline Form
 */
/**
 * Performs product inline form operation
 *
 * @returns {any} The productinlineform result
 *
 * @example
 * ProductInlineForm();
 */

/**
 * Performs product inline form operation
 *
 * @returns {any} The productinlineform result
 *
 * @example
 * ProductInlineForm();
 */

export function ProductInlineForm({
  product,
  shopId,
  onSuccess,
  onCancel,
}: ProductInlineFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    /** Name */
    name: product?.name || "",
    /** Slug */
    slug: product?.slug || "",
    /** Price */
    price: product?.price || 0,
    /** Stock Count */
    stockCount: product?.stockCount || 0,
    /** Category Id */
    categoryId: product?.categoryId || "",
    /** Description */
    description: product && "description" in product ? product.description : "",
    /** Condition */
    condition: product && "condition" in product ? product.condition : "new",
    /** Status */
    status: product?.status || "draft",
  });

  /**
   * Performs clear error operation
   *
   * @param {string} field - The field
   *
   * @returns {string} The clearerror result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs clear error operation
   *
   * @param {string} field - The field
   *
   * @returns {string} The clearerror result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Performs async operation
   *
   * @param {React.FormEvent} e - The e
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {React.FormEvent} e - The e
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

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
          /** Country Of Origin */
          countryOfOrigin: "India",
          /** Low Stock Threshold */
          lowStockThreshold: 5,
          /** Is Returnable */
          isReturnable: true,
          /** Return Window Days */
          returnWindowDays: 7,
        } as any);
      }

      onSuccess();
    } catch (error: any) {
      logError(error as Error, {
        /** Component */
        component: "ProductInlineForm.handleSubmit",
        /** Metadata */
        metadata: { productSlug: formData.slug },
      });
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
        <FormInput
          id="product-name"
          label="Product Name"
          required
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            clearError("name");
          }}
          error={errors.name}
        />
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
        <FormInput
          id="product-price"
          label="Price (₹)"
          type="number"
          required
          min={0}
          step={0.01}
          value={formData.price}
          onChange={(e) => {
            setFormData({ ...formData, price: parseFloat(e.target.value) });
            clearError("price");
          }}
          error={errors.price}
        />
      </div>

      {/* Stock */}
      <div>
        <FormInput
          id="product-stock"
          label="Stock Count"
          type="number"
          required
          min={0}
          value={formData.stockCount}
          onChange={(e) =>
            setFormData({ ...formData, stockCount: parseInt(e.target.value) })
          }
        />
      </div>

      {/* Category */}
      <div>
        <FormInput
          id="product-category"
          label="Category ID"
          required
          value={formData.categoryId}
          onChange={(e) =>
            setFormData({ ...formData, categoryId: e.target.value })
          }
          placeholder="e.g., electronics"
        />
      </div>

      {/* Description */}
      <div>
        <FormTextarea
          id="product-description"
          label="Description"
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
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
