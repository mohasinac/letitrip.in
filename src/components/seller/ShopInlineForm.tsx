"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import SlugInput from "@/components/common/SlugInput";
import { shopsService } from "@/services/shops.service";
import type { ShopFE } from "@/types/frontend/shop.types";

interface ShopInlineFormProps {
  shop?: ShopFE;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ShopInlineForm({
  shop,
  onSuccess,
  onCancel,
}: ShopInlineFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: shop?.name || "",
    slug: shop?.slug || "",
    description: shop?.description || "",
    email: shop?.email || "",
    phone: shop?.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug) {
      alert("Slug is required");
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
      console.error("Failed to save shop:", error);
      alert("Failed to save shop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Shop Name *
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

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
          {shop ? "Update Shop" : "Create Shop"}
        </button>
      </div>
    </form>
  );
}
