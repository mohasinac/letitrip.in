"use client";

import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import { Badge } from "@/components";
import type { ProductDocument } from "@/db/schema";

const { themed, spacing } = THEME_CONSTANTS;

interface ProductInfoProps {
  title: string;
  description: string;
  price: number;
  currency: string;
  status: ProductDocument["status"];
  featured: boolean;
  isAuction?: boolean;
  currentBid?: number;
  startingBid?: number;
  bidCount?: number;
  auctionEndDate?: Date;
  stockQuantity: number;
  availableQuantity: number;
  brand?: string;
  category: string;
  subcategory?: string;
  sellerName: string;
  tags: string[];
  specifications?: ProductDocument["specifications"];
  features?: string[];
  shippingInfo?: string;
  returnPolicy?: string;
  onAddToCart?: () => void;
  isAddingToCart?: boolean;
}

export function ProductInfo({
  title,
  description,
  price,
  currency,
  status,
  featured,
  isAuction,
  currentBid,
  startingBid,
  bidCount,
  auctionEndDate,
  stockQuantity,
  availableQuantity,
  brand,
  category,
  subcategory,
  sellerName,
  tags,
  specifications,
  features,
  shippingInfo,
  returnPolicy,
  onAddToCart,
  isAddingToCart = false,
}: ProductInfoProps) {
  const isOutOfStock =
    status === "out_of_stock" || status === "sold" || availableQuantity === 0;
  const displayPrice = isAuction ? (currentBid ?? startingBid ?? price) : price;

  return (
    <div className={spacing.stack}>
      {/* Title + badges */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {featured && (
            <Badge variant="warning">
              {UI_LABELS.PRODUCTS_PAGE.FEATURED_BADGE}
            </Badge>
          )}
          {isAuction && (
            <Badge variant="info">{UI_LABELS.PRODUCTS_PAGE.AUCTION}</Badge>
          )}
        </div>
        <h1 className={`text-2xl font-bold ${themed.textPrimary}`}>{title}</h1>
      </div>

      {/* Price */}
      <div>
        {isAuction ? (
          <div className="space-y-0.5">
            <p className={`text-sm ${themed.textSecondary}`}>
              {currentBid
                ? UI_LABELS.PRODUCT_DETAIL.CURRENT_BID
                : UI_LABELS.PRODUCT_DETAIL.STARTING_BID}
            </p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(displayPrice ?? price)}
            </p>
            {bidCount !== undefined && (
              <p className={`text-sm ${themed.textSecondary}`}>
                {UI_LABELS.PRODUCT_DETAIL.TOTAL_BIDS(bidCount)}
              </p>
            )}
            {auctionEndDate && (
              <p className={`text-sm ${themed.textSecondary}`}>
                {UI_LABELS.PRODUCT_DETAIL.AUCTION_ENDS}{" "}
                <span className={themed.textPrimary}>
                  {formatDate(auctionEndDate)}
                </span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(price)}
          </p>
        )}
      </div>

      {/* Stock */}
      {!isOutOfStock && availableQuantity > 0 && (
        <p
          className={`text-sm text-emerald-600 dark:text-emerald-400 font-medium`}
        >
          {UI_LABELS.PRODUCT_DETAIL.AVAILABLE_STOCK(availableQuantity)}
        </p>
      )}

      {/* Metadata row */}
      <div
        className={`flex flex-wrap gap-x-6 gap-y-1 text-sm ${themed.textSecondary}`}
      >
        {brand && (
          <span>
            <span className="font-medium">
              {UI_LABELS.PRODUCT_DETAIL.BRAND}:
            </span>{" "}
            {brand}
          </span>
        )}
        {category && (
          <span>
            <span className="font-medium">
              {UI_LABELS.PRODUCT_DETAIL.CATEGORY}:
            </span>{" "}
            {subcategory ? `${category} › ${subcategory}` : category}
          </span>
        )}
        {sellerName && (
          <span>
            <span className="font-medium">
              {UI_LABELS.PRODUCT_DETAIL.SELLER}:
            </span>{" "}
            {sellerName}
          </span>
        )}
      </div>

      {/* Add to cart button - rendered by parent as slot */}
      {onAddToCart !== undefined && (
        <div className="pt-1">
          {isOutOfStock ? (
            <div className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl text-center font-medium text-sm cursor-not-allowed">
              {status === "sold"
                ? UI_LABELS.PRODUCTS_PAGE.SOLD
                : UI_LABELS.PRODUCTS_PAGE.OUT_OF_STOCK}
            </div>
          ) : isAuction ? (
            <button
              onClick={onAddToCart}
              disabled={isAddingToCart}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors"
            >
              {UI_LABELS.PRODUCT_DETAIL.PLACE_BID}
            </button>
          ) : (
            <button
              onClick={onAddToCart}
              disabled={isAddingToCart}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors"
            >
              {isAddingToCart
                ? UI_LABELS.LOADING.DEFAULT
                : UI_LABELS.PRODUCT_DETAIL.ADD_TO_CART}
            </button>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <div>
          <h2 className={`font-semibold mb-2 ${themed.textPrimary}`}>
            {UI_LABELS.PRODUCT_DETAIL.DESCRIPTION}
          </h2>
          <p className={`text-sm leading-relaxed ${themed.textSecondary}`}>
            {description}
          </p>
        </div>
      )}

      {/* Features */}
      {features && features.length > 0 && (
        <div>
          <h2 className={`font-semibold mb-2 ${themed.textPrimary}`}>
            {UI_LABELS.PRODUCT_DETAIL.FEATURES}
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {features.map((f, idx) => (
              <li key={idx} className={`text-sm ${themed.textSecondary}`}>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Specifications */}
      {specifications && specifications.length > 0 && (
        <div>
          <h2 className={`font-semibold mb-2 ${themed.textPrimary}`}>
            {UI_LABELS.PRODUCT_DETAIL.SPECIFICATIONS}
          </h2>
          <div
            className={`rounded-xl border ${themed.border} divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden`}
          >
            {specifications.map((spec, idx) => (
              <div key={idx} className="flex items-start px-4 py-2.5 text-sm">
                <span
                  className={`w-1/3 font-medium ${themed.textPrimary} shrink-0`}
                >
                  {spec.name}
                </span>
                <span className={themed.textSecondary}>
                  {spec.value}
                  {spec.unit ? ` ${spec.unit}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping / Return Policy */}
      {(shippingInfo || returnPolicy) && (
        <div className="space-y-3">
          {shippingInfo && (
            <div>
              <h2 className={`font-semibold mb-1 ${themed.textPrimary}`}>
                {UI_LABELS.PRODUCT_DETAIL.SHIPPING}
              </h2>
              <p className={`text-sm ${themed.textSecondary}`}>
                {shippingInfo}
              </p>
            </div>
          )}
          {returnPolicy && (
            <div>
              <h2 className={`font-semibold mb-1 ${themed.textPrimary}`}>
                {UI_LABELS.PRODUCT_DETAIL.RETURN_POLICY}
              </h2>
              <p className={`text-sm ${themed.textSecondary}`}>
                {returnPolicy}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`text-xs px-2.5 py-1 rounded-full ${themed.bgSecondary} ${themed.textSecondary} border ${themed.border}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
