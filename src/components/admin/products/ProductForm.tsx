/**
 * ProductForm Component
 * Path: src/components/admin/products/ProductForm.tsx
 *
 * Drawer form for creating/editing products in admin panel.
 */

"use client";

import {
  FormField,
  CategorySelectorCreate,
  AddressSelectorCreate,
} from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type { AdminProduct } from "./types";
import { PRODUCT_STATUS_OPTIONS } from "./types";

const { spacing, themed } = THEME_CONSTANTS;
const LABELS = UI_LABELS.ADMIN.PRODUCTS;

interface ProductFormProps {
  product: Partial<AdminProduct>;
  onChange: (updated: Partial<AdminProduct>) => void;
  isReadonly?: boolean;
}

export function ProductForm({
  product,
  onChange,
  isReadonly = false,
}: ProductFormProps) {
  const update = (partial: Partial<AdminProduct>) => {
    onChange({ ...product, ...partial });
  };

  return (
    <div className={spacing.stack}>
      {/* Basic Info */}
      <FormField
        name="title"
        label={LABELS.TITLE_LABEL}
        type="text"
        value={product.title || ""}
        onChange={(value) => update({ title: value })}
        disabled={isReadonly}
        placeholder="Enter product title"
      />

      <FormField
        name="description"
        label={LABELS.DESCRIPTION_LABEL}
        type="textarea"
        value={product.description || ""}
        onChange={(value) => update({ description: value })}
        disabled={isReadonly}
        placeholder="Enter product description"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CategorySelectorCreate
          label={LABELS.CATEGORY_LABEL}
          value={product.categoryId || product.category || ""}
          onChange={(id) => update({ categoryId: id, category: id })}
          disabled={isReadonly}
        />
        <FormField
          name="subcategory"
          label={LABELS.SUBCATEGORY_LABEL}
          type="text"
          value={product.subcategory || ""}
          onChange={(value) => update({ subcategory: value })}
          disabled={isReadonly}
          placeholder="e.g. Smartphones"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          name="brand"
          label={LABELS.BRAND_LABEL}
          type="text"
          value={product.brand || ""}
          onChange={(value) => update({ brand: value })}
          disabled={isReadonly}
          placeholder="e.g. Apple"
        />
        <FormField
          name="status"
          label={LABELS.STATUS_LABEL}
          type="select"
          value={product.status || "draft"}
          onChange={(value) =>
            update({ status: value as AdminProduct["status"] })
          }
          disabled={isReadonly}
          options={PRODUCT_STATUS_OPTIONS}
        />
      </div>

      {/* Pricing & Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          name="price"
          label={LABELS.PRICE_LABEL}
          type="number"
          value={String(product.price ?? "")}
          onChange={(value) => update({ price: Number(value) })}
          disabled={isReadonly}
          placeholder="0"
        />
        <FormField
          name="stockQuantity"
          label={LABELS.STOCK_LABEL}
          type="number"
          value={String(product.stockQuantity ?? "")}
          onChange={(value) => update({ stockQuantity: Number(value) })}
          disabled={isReadonly}
          placeholder="0"
        />
      </div>

      {/* Media */}
      <FormField
        name="mainImage"
        label={LABELS.MAIN_IMAGE_LABEL}
        type="text"
        value={product.mainImage || ""}
        onChange={(value) => update({ mainImage: value })}
        disabled={isReadonly}
        placeholder="https://..."
      />

      {/* Tags */}
      <FormField
        name="tags"
        label={LABELS.TAGS_LABEL}
        type="text"
        value={(product.tags || []).join(", ")}
        onChange={(value) =>
          update({
            tags: value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
        disabled={isReadonly}
        placeholder={LABELS.TAGS_PLACEHOLDER}
      />

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!product.featured}
            onChange={(e) => update({ featured: e.target.checked })}
            disabled={isReadonly}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className={`text-sm ${themed.textPrimary}`}>
            {LABELS.FEATURED_LABEL}
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!product.isPromoted}
            onChange={(e) => update({ isPromoted: e.target.checked })}
            disabled={isReadonly}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className={`text-sm ${themed.textPrimary}`}>
            {LABELS.IS_PROMOTED_LABEL}
          </span>
        </label>
      </div>

      {/* Auction fields */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={!!product.isAuction}
          onChange={(e) => update({ isAuction: e.target.checked })}
          disabled={isReadonly}
          className="w-4 h-4 rounded border-gray-300"
        />
        <span className={`text-sm ${themed.textPrimary}`}>
          {LABELS.IS_AUCTION_LABEL}
        </span>
      </label>

      {product.isAuction && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            name="startingBid"
            label={LABELS.STARTING_BID_LABEL}
            type="number"
            value={String(product.startingBid ?? "")}
            onChange={(value) => update({ startingBid: Number(value) })}
            disabled={isReadonly}
            placeholder="0"
          />
          <FormField
            name="auctionEndDate"
            label={LABELS.AUCTION_END_DATE_LABEL}
            type="text"
            value={product.auctionEndDate || ""}
            onChange={(value) => update({ auctionEndDate: value })}
            disabled={isReadonly}
            placeholder="YYYY-MM-DDTHH:mm"
          />
        </div>
      )}

      {/* Shipping & Returns */}
      <AddressSelectorCreate
        label={LABELS.PICKUP_ADDRESS}
        value={product.pickupAddressId || ""}
        onChange={(id) => update({ pickupAddressId: id })}
        disabled={isReadonly}
      />

      <FormField
        name="shippingInfo"
        label={LABELS.SHIPPING_LABEL}
        type="textarea"
        value={product.shippingInfo || ""}
        onChange={(value) => update({ shippingInfo: value })}
        disabled={isReadonly}
        placeholder="Shipping information..."
      />

      <FormField
        name="returnPolicy"
        label={LABELS.RETURN_POLICY_LABEL}
        type="textarea"
        value={product.returnPolicy || ""}
        onChange={(value) => update({ returnPolicy: value })}
        disabled={isReadonly}
        placeholder="Return policy details..."
      />

      {/* Seller info (read-only display in edit) */}
      {product.sellerName && (
        <FormField
          name="sellerName"
          label={LABELS.SELLER_LABEL}
          type="text"
          value={product.sellerName}
          onChange={() => {}}
          disabled
        />
      )}
    </div>
  );
}
