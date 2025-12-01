"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { OptionalStepProps } from "./types";

export function OptionalDetailsStep({
  formData,
  setFormData,
  expandedSections,
  toggleSection,
}: OptionalStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Additional Details (Optional)
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Expand sections below to add more information
      </p>

      {/* Product Details Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection("details")}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <span className="font-medium text-gray-900 dark:text-white">
            Product Details
          </span>
          {expandedSections.details ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.details && (
          <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label
                htmlFor="product-brand"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Brand
              </label>
              <input
                id="product-brand"
                type="text"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                placeholder="Enter brand name"
              />
            </div>
            <div>
              <label
                htmlFor="product-description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="product-description"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                placeholder="Describe your product..."
              />
            </div>
            <div>
              <label
                htmlFor="product-condition"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Condition
              </label>
              <select
                id="product-condition"
                value={formData.condition}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    condition: e.target.value as any,
                  })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              >
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="product-compare-price"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Compare at Price (₹)
                </label>
                <input
                  id="product-compare-price"
                  type="number"
                  min="0"
                  value={formData.compareAtPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      compareAtPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="product-weight"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Weight (kg)
                </label>
                <input
                  id="product-weight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shipping Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection("shipping")}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <span className="font-medium text-gray-900 dark:text-white">
            Shipping & Returns
          </span>
          {expandedSections.shipping ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.shipping && (
          <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label
                htmlFor="shipping-class"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Shipping Class
              </label>
              <select
                id="shipping-class"
                value={formData.shippingClass}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingClass: e.target.value as any,
                  })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              >
                <option value="standard">Standard Shipping</option>
                <option value="express">Express Shipping</option>
                <option value="free">Free Shipping</option>
                <option value="fragile">Fragile Items</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="return-policy"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Return Policy
              </label>
              <textarea
                id="return-policy"
                rows={2}
                value={formData.returnPolicy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    returnPolicy: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                placeholder="e.g., 7 days return policy"
              />
            </div>
            <div>
              <label
                htmlFor="warranty-info"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Warranty Information
              </label>
              <textarea
                id="warranty-info"
                rows={2}
                value={formData.warrantyInfo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    warrantyInfo: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                placeholder="e.g., 1 year manufacturer warranty"
              />
            </div>
          </div>
        )}
      </div>

      {/* SEO Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection("seo")}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <span className="font-medium text-gray-900 dark:text-white">
            SEO & Publishing
          </span>
          {expandedSections.seo ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.seo && (
          <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label
                htmlFor="meta-title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Meta Title
              </label>
              <input
                id="meta-title"
                type="text"
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                placeholder="SEO title for search engines"
                maxLength={60}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.metaTitle.length}/60 characters
              </p>
            </div>
            <div>
              <label
                htmlFor="meta-description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Meta Description
              </label>
              <textarea
                id="meta-description"
                rows={2}
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaDescription: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                placeholder="Brief description for search results"
                maxLength={160}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.metaDescription.length}/160 characters
              </p>
            </div>
            <div>
              <label
                htmlFor="product-status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Publishing Status
              </label>
              <select
                id="product-status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              >
                <option value="draft">Draft (Save for later)</option>
                <option value="published">Published (Go live now)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Product Summary */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Product Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Name:</span>{" "}
            <span className="ml-2 text-gray-900 dark:text-white font-medium">
              {formData.name || "—"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">SKU:</span>{" "}
            <span className="ml-2 text-gray-900 dark:text-white font-medium">
              {formData.sku || "—"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Price:</span>{" "}
            <span className="ml-2 text-gray-900 dark:text-white font-medium">
              ₹{formData.price.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Stock:</span>{" "}
            <span className="ml-2 text-gray-900 dark:text-white font-medium">
              {formData.stockCount} units
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Images:</span>{" "}
            <span className="ml-2 text-gray-900 dark:text-white font-medium">
              {formData.images.length} uploaded
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Status:</span>{" "}
            <span className="ml-2 text-gray-900 dark:text-white font-medium capitalize">
              {formData.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
