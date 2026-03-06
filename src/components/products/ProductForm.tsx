/**
 * ProductForm Component
 * Path: src/components/admin/products/ProductForm.tsx
 *
 * Drawer form for creating/editing products in admin panel.
 */

"use client";

import {
  FormField,
  Checkbox,
  ImageUpload,
  Heading,
  Text,
  Alert,
} from "@/components";
import { CategorySelectorCreate } from "@/features/categories";
import { AddressSelectorCreate } from "@/features/user";
import { useMediaUpload } from "@/hooks";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import type { AdminProduct } from "./Product.types";
import { PRODUCT_STATUS_OPTIONS } from "./Product.types";

const { spacing } = THEME_CONSTANTS;

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
  const t = useTranslations("adminProducts");
  const { upload } = useMediaUpload();
  const update = (partial: Partial<AdminProduct>) => {
    onChange({ ...product, ...partial });
  };

  return (
    <div className={spacing.stack}>
      {/* Basic Info */}
      <FormField
        name="title"
        label={t("formTitle")}
        type="text"
        value={product.title || ""}
        onChange={(value) => update({ title: value })}
        disabled={isReadonly}
        placeholder="Enter product title"
      />

      <FormField
        name="description"
        label={t("formDescription")}
        type="textarea"
        value={product.description || ""}
        onChange={(value) => update({ description: value })}
        disabled={isReadonly}
        placeholder="Enter product description"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CategorySelectorCreate
          label={t("formCategory")}
          value={product.categoryId || product.category || ""}
          onChange={(id) => update({ categoryId: id, category: id })}
          disabled={isReadonly}
        />
        <FormField
          name="subcategory"
          label={t("formSubcategory")}
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
          label={t("formBrand")}
          type="text"
          value={product.brand || ""}
          onChange={(value) => update({ brand: value })}
          disabled={isReadonly}
          placeholder="e.g. Apple"
        />
        <FormField
          name="status"
          label={t("formStatus")}
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
          label={t("formPrice")}
          type="number"
          value={String(product.price ?? "")}
          onChange={(value) => update({ price: Number(value) })}
          disabled={isReadonly}
          placeholder="0"
        />
        <FormField
          name="stockQuantity"
          label={t("formStock")}
          type="number"
          value={String(product.stockQuantity ?? "")}
          onChange={(value) => update({ stockQuantity: Number(value) })}
          disabled={isReadonly}
          placeholder="0"
        />
      </div>

      {/* Media */}
      {!isReadonly && (
        <ImageUpload
          currentImage={product.mainImage}
          onUpload={(file) => upload(file, "products")}
          onChange={(url) => update({ mainImage: url })}
          label={t("formMainImage")}
          helperText="Recommended: 800x800px (1:1)"
        />
      )}
      {isReadonly && product.mainImage && (
        <FormField
          name="mainImage"
          label={t("formMainImage")}
          type="text"
          value={product.mainImage}
          onChange={() => {}}
          disabled
        />
      )}

      {/* Tags */}
      <FormField
        name="tags"
        label={t("formTags")}
        type="text"
        value={(product.tags || []).join(", ")}
        onChange={(value) =>
          update({
            tags: value
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          })
        }
        disabled={isReadonly}
        placeholder={t("formTagsPlaceholder")}
      />

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Checkbox
          label={t("formFeatured")}
          checked={!!product.featured}
          onChange={(e) => update({ featured: e.target.checked })}
          disabled={isReadonly}
        />
        <Checkbox
          label={t("formIsPromoted")}
          checked={!!product.isPromoted}
          onChange={(e) => update({ isPromoted: e.target.checked })}
          disabled={isReadonly}
        />
      </div>

      {/* Condition & Shipping */}
      <Heading level={4} className={spacing.margin.top.md}>
        {t("sectionConditionShipping")}
      </Heading>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          name="condition"
          label={t("formCondition")}
          type="select"
          value={product.condition || "new"}
          onChange={(value) =>
            update({
              condition: value as AdminProduct["condition"],
            })
          }
          disabled={isReadonly}
          options={[
            { value: "new", label: t("formConditionNew") },
            { value: "used", label: t("formConditionUsed") },
            { value: "refurbished", label: t("formConditionRefurbished") },
            { value: "broken", label: t("formConditionBroken") },
          ]}
        />
        <FormField
          name="shippingPaidBy"
          label={t("formShippingPaidBy")}
          type="select"
          value={product.shippingPaidBy || "buyer"}
          onChange={(value) =>
            update({
              shippingPaidBy: value as AdminProduct["shippingPaidBy"],
            })
          }
          disabled={isReadonly}
          options={[
            { value: "buyer", label: t("formShippingPaidByBuyer") },
            { value: "seller", label: t("formShippingPaidBySeller") },
          ]}
        />
      </div>

      {/* Insurance */}
      <Checkbox
        label={t("formInsurance")}
        checked={!!product.insurance}
        onChange={(e) =>
          update({
            insurance: e.target.checked,
            insuranceCost: e.target.checked
              ? product.insuranceCost || 0
              : undefined,
          })
        }
        disabled={isReadonly}
      />
      {product.insurance && (
        <>
          <Alert variant="info" title={t("formInsuranceHelp")}>
            {t("formInsuranceHelp")}
          </Alert>
          <FormField
            name="insuranceCost"
            label={t("formInsuranceCost")}
            type="number"
            value={String(product.insuranceCost ?? "")}
            onChange={(value) => update({ insuranceCost: Number(value) })}
            disabled={isReadonly}
            placeholder="0"
          />
        </>
      )}

      {/* Auction fields */}
      <Heading level={4} className={spacing.margin.top.md}>
        {t("sectionAuctionSettings")}
      </Heading>

      <Checkbox
        label={t("formIsAuction")}
        checked={!!product.isAuction}
        onChange={(e) => update({ isAuction: e.target.checked })}
        disabled={isReadonly}
      />

      {product.isAuction && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              name="startingBid"
              label={t("formStartingBid")}
              type="number"
              value={String(product.startingBid ?? "")}
              onChange={(value) => update({ startingBid: Number(value) })}
              disabled={isReadonly}
              placeholder="0"
            />
            <FormField
              name="auctionEndDate"
              label={t("formAuctionEndDate")}
              type="text"
              value={product.auctionEndDate || ""}
              onChange={(value) => update({ auctionEndDate: value })}
              disabled={isReadonly}
              placeholder="YYYY-MM-DDTHH:mm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              name="reservePrice"
              label={t("formReservePrice")}
              type="number"
              value={String(product.reservePrice ?? "")}
              onChange={(value) =>
                update({ reservePrice: Number(value) || undefined })
              }
              disabled={isReadonly}
              placeholder="0"
              helpText={t("formReservePriceHelp")}
            />
            <FormField
              name="buyNowPrice"
              label={t("formBuyNowPrice")}
              type="number"
              value={String(product.buyNowPrice ?? "")}
              onChange={(value) =>
                update({ buyNowPrice: Number(value) || undefined })
              }
              disabled={isReadonly}
              placeholder="0"
              helpText={t("formBuyNowPriceHelp")}
            />
          </div>

          <FormField
            name="minBidIncrement"
            label={t("formMinBidIncrement")}
            type="number"
            value={String(product.minBidIncrement ?? "")}
            onChange={(value) =>
              update({ minBidIncrement: Number(value) || undefined })
            }
            disabled={isReadonly}
            placeholder="0"
            helpText={t("formMinBidIncrementHelp")}
          />

          {/* Auction shipping payer */}
          <FormField
            name="auctionShippingPaidBy"
            label={t("formAuctionShippingPaidBy")}
            type="select"
            value={product.auctionShippingPaidBy || "winner"}
            onChange={(value) =>
              update({
                auctionShippingPaidBy:
                  value as AdminProduct["auctionShippingPaidBy"],
              })
            }
            disabled={isReadonly}
            options={[
              { value: "winner", label: t("formAuctionShippingPaidByWinner") },
              { value: "seller", label: t("formAuctionShippingPaidBySeller") },
            ]}
          />

          {/* Advanced Auction Options */}
          <Text
            variant="secondary"
            weight="semibold"
            className={spacing.margin.top.sm}
          >
            {t("sectionAuctionAdvanced")}
          </Text>

          <Checkbox
            label={t("formAutoExtendable")}
            checked={!!product.autoExtendable}
            onChange={(e) => update({ autoExtendable: e.target.checked })}
            disabled={isReadonly}
          />
          {product.autoExtendable && (
            <>
              <Alert variant="info" title={t("formAutoExtendableHelp")}>
                {t("formAutoExtendableHelp")}
              </Alert>
              <FormField
                name="auctionExtensionMinutes"
                label={t("formAuctionExtensionMinutes")}
                type="number"
                value={String(product.auctionExtensionMinutes ?? 5)}
                onChange={(value) =>
                  update({ auctionExtensionMinutes: Number(value) || 5 })
                }
                disabled={isReadonly}
                placeholder="5"
                helpText={t("formAuctionExtensionMinutesHelp")}
              />
            </>
          )}
        </>
      )}

      {/* Shipping & Returns */}
      <AddressSelectorCreate
        label={t("formPickupAddress")}
        value={product.pickupAddressId || ""}
        onChange={(id) => update({ pickupAddressId: id })}
        disabled={isReadonly}
      />

      <FormField
        name="shippingInfo"
        label={t("formShipping")}
        type="textarea"
        value={product.shippingInfo || ""}
        onChange={(value) => update({ shippingInfo: value })}
        disabled={isReadonly}
        placeholder="Shipping information..."
      />

      <FormField
        name="returnPolicy"
        label={t("formReturnPolicy")}
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
          label={t("formSeller")}
          type="text"
          value={product.sellerName}
          onChange={() => {}}
          disabled
        />
      )}
    </div>
  );
}
