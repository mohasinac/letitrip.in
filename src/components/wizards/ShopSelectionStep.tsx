"use client";

import Link from "next/link";
import { Plus, Store } from "lucide-react";
import ShopSelector from "@/components/seller/ShopSelector";

export interface ShopSelectionStepProps {
  value: string;
  onChange: (shopId: string) => void;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  showCreateLink?: boolean;
  createLinkUrl?: string;
}

/**
 * ShopSelectionStep Component
 *
 * Reusable shop selection for multi-shop sellers.
 * Used across Product/Auction wizards for consistent shop selection.
 *
 * Features:
 * - Auto-load user's shops
 * - Auto-select if only one shop
 * - Create shop link (optional)
 * - Empty state message
 * - Real-time validation
 *
 * @example
 * ```tsx
 * <ShopSelectionStep
 *   value={formData.shopId}
 *   onChange={(shopId) => setFormData({ ...formData, shopId })}
 *   label="Shop"
 *   required
 *   showCreateLink
 * />
 * ```
 */
export function ShopSelectionStep({
  value,
  onChange,
  required = true,
  error,
  label = "Shop",
  helperText = "Select which shop this belongs to",
  showCreateLink = true,
  createLinkUrl = "/seller/my-shops/create",
}: ShopSelectionStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          {helperText && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {helperText}
            </p>
          )}
        </div>

        {showCreateLink && (
          <Link
            href={createLinkUrl}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Create Shop
          </Link>
        )}
      </div>

      {/* Shop Selector */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        <ShopSelector
          value={value}
          onChange={(shopId: string | undefined) => onChange(shopId || "")}
        />
      </div>

      {/* Error Display */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
        <div className="flex items-start gap-3">
          <Store className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">About Shops</p>
            <p>
              Shops help organize your products and auctions. If you only have
              one shop, it will be automatically selected. You can create
              multiple shops for different product categories or brands.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopSelectionStep;
