/**
 * @fileoverview React Component
 * @module src/components/seller/ShopInlineForm
 * @description This file contains the ShopInlineForm component and its related functionality
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
import { shopsService } from "@/services/shops.service";
import type { ShopFE } from "@/types/frontend/shop.types";

/**
 * ShopInlineFormProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopInlineFormProps
 */
interface ShopInlineFormProps {
  /** Shop */
  shop?: ShopFE;
  /** On Success */
  onSuccess: () => void;
  /** On Cancel */
  onCancel: () => void;
}

/**
 * Function: Shop Inline Form
 */
/**
 * Performs shop inline form operation
 *
 * @param {ShopInlineFormProps} {
  shop,
  onSuccess,
  onCancel,
} - The {
  shop,
  on success,
  on cancel,
}
 *
 * @returns {any} The shopinlineform result
 *
 * @example
 * ShopInlineForm({
  shop,
  onSuccess,
  onCancel,
});
 */

/**
 * Performs shop inline form operation
 *
 * @param {ShopInlineFormProps} {
  shop,
  onSuccess,
  onCancel,
} - The {
  shop,
  on success,
  on cancel,
}
 *
 * @returns {any} The shopinlineform result
 *
 * @example
 * ShopInlineForm({
  shop,
  onSuccess,
  onCancel,
});
 */

/**
 * Performs shop inline form operation
 *
 * @param {ShopInlineFormProps} {
  shop,
  onSuccess,
  onCancel,
} - The {
  shop,
  onsuccess,
  oncancel,
}
 *
 * @returns {any} The shopinlineform result
 *
 * @example
 * ShopInlineForm({
  shop,
  onSuccess,
  onCancel,
});
 */
export function ShopInlineForm({
  shop,
  onSuccess,
  onCancel,
}: ShopInlineFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    /** Name */
    name: shop?.name || "",
    /** Slug */
    slug: shop?.slug || "",
    /** Description */
    description: shop?.description || "",
    /** Email */
    email: shop?.email || "",
    /** Phone */
    phone: shop?.phone || "",
  });

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

    if (!formData.slug) {
      toast.error("Slug is required");
      return;
    }

    try {
      setLoading(true);

      if (shop) {
        // Update existing shop
        await shopsService.update(shop.slug, formData);
      } else {
        // Create new shop
        await shopsService.create(formData as any);
      }

      onSuccess();
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "ShopInlineForm.handleSubmit",
        /** Metadata */
        metadata: { shopSlug: formData.slug },
      });
      toast.error("Failed to save shop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <FormInput
        id="shop-name"
        label="Shop Name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      {/* Slug */}
      <SlugInput
        value={formData.slug}
        sourceText={formData.name}
        onChange={(slug: string) => setFormData({ ...formData, slug })}
      />

      {/* Description */}
      <FormTextarea
        id="shop-description"
        label="Description"
        rows={3}
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      {/* Email */}
      <FormInput
        id="shop-email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      {/* Phone */}
      <FormInput
        id="shop-phone"
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {shop ? "Update Shop" : "Create Shop"}
        </button>
      </div>
    </form>
  );
}
