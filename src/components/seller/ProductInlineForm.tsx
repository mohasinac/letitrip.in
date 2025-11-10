"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import SlugInput from "@/components/common/SlugInput";
import { productsService } from "@/services/products.service";
import type { Product } from "@/types";

interface ProductInlineFormProps {
  product?: Product;
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
  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    price: product?.price || 0,
    stockCount: product?.stockCount || 0,
    categoryId: product?.categoryId || "",
    description: product?.description || "",
    condition: product?.condition || "new",
    status: product?.status || "draft",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug) {
      alert("Slug is required");
      return;
    }

    try {
      setLoading(true);

      if (product) {
        // Update existing product
        await productsService.update(product.slug, formData);
      } else {
        // Create new product
        if (!shopId) {
          alert("Shop ID is required");
          return;
        }

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
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Slug */}
      <div>
        <SlugInput
          value={formData.slug}
          sourceText={formData.name}
          onChange={(slug: string) => setFormData({ ...formData, slug })}
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price (₹) *
        </label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: parseFloat(e.target.value) })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stock Count *
        </label>
        <input
          type="number"
          required
          min="0"
          value={formData.stockCount}
          onChange={(e) =>
            setFormData({ ...formData, stockCount: parseInt(e.target.value) })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category ID *
        </label>
        <input
          type="text"
          required
          value={formData.categoryId}
          onChange={(e) =>
            setFormData({ ...formData, categoryId: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g., electronics"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

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
          {product ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
