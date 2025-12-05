import { ChevronDown, ChevronUp } from "lucide-react";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSelect } from "@/components/forms/FormSelect";
import { Price } from "@/components/common/values/Price";
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
            <FormInput
              id="product-brand"
              label="Brand"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              placeholder="Enter brand name"
            />
            <FormTextarea
              id="product-description"
              label="Description"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Describe your product..."
            />
            <FormSelect
              id="product-condition"
              label="Condition"
              value={formData.condition}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  condition: e.target.value as any,
                })
              }
              options={[
                { value: "new", label: "New" },
                { value: "like-new", label: "Like New" },
                { value: "used", label: "Used" },
                { value: "refurbished", label: "Refurbished" },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                id="product-compare-price"
                label="Compare at Price (₹)"
                type="number"
                min={0}
                value={formData.compareAtPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    compareAtPrice: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <FormInput
                id="product-weight"
                label="Weight (kg)"
                type="number"
                min={0}
                step={0.01}
                value={formData.weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weight: parseFloat(e.target.value) || 0,
                  })
                }
              />
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
            <FormSelect
              id="shipping-class"
              label="Shipping Class"
              value={formData.shippingClass}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shippingClass: e.target.value as any,
                })
              }
              options={[
                { value: "standard", label: "Standard Shipping" },
                { value: "express", label: "Express Shipping" },
                { value: "free", label: "Free Shipping" },
                { value: "fragile", label: "Fragile Items" },
              ]}
            />
            <FormTextarea
              id="return-policy"
              label="Return Policy"
              rows={2}
              value={formData.returnPolicy}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  returnPolicy: e.target.value,
                })
              }
              placeholder="e.g., 7 days return policy"
            />
            <FormTextarea
              id="warranty-info"
              label="Warranty Information"
              rows={2}
              value={formData.warrantyInfo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  warrantyInfo: e.target.value,
                })
              }
              placeholder="e.g., 1 year manufacturer warranty"
            />
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
              <FormInput
                id="meta-title"
                label="Meta Title"
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                placeholder="SEO title for search engines"
                maxLength={60}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.metaTitle.length}/60 characters
              </p>
            </div>
            <div>
              <FormTextarea
                id="meta-description"
                label="Meta Description"
                rows={2}
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaDescription: e.target.value,
                  })
                }
                placeholder="Brief description for search results"
                maxLength={160}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.metaDescription.length}/160 characters
              </p>
            </div>
            <FormSelect
              id="product-status"
              label="Publishing Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as any,
                })
              }
              options={[
                { value: "draft", label: "Draft (Save for later)" },
                { value: "published", label: "Published (Go live now)" },
              ]}
            />
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
              <Price amount={formData.price} />
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
