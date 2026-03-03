"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import { Badge, Heading, Text, Span, Button, Ul, Li } from "@/components";
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
  const t = useTranslations("products");
  const isOutOfStock =
    status === "out_of_stock" || status === "sold" || availableQuantity === 0;
  const displayPrice = isAuction ? (currentBid ?? startingBid ?? price) : price;

  return (
    <div className={spacing.stack}>
      {/* Title + badges */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {featured && <Badge variant="warning">{t("featured")}</Badge>}
          {isAuction && <Badge variant="info">{t("auction")}</Badge>}
        </div>
        <Heading level={1} className="text-2xl font-bold">
          {title}
        </Heading>
      </div>

      {/* Price */}
      <div>
        {isAuction ? (
          <div className="space-y-0.5">
            <Text size="sm" variant="secondary">
              {currentBid ? t("currentBid") : t("startingBid")}
            </Text>
            <Text className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(displayPrice ?? price)}
            </Text>
            {bidCount !== undefined && (
              <Text size="sm" variant="secondary">
                {t("totalBids", { count: bidCount })}
              </Text>
            )}
            {auctionEndDate && (
              <Text size="sm" variant="secondary">
                {t("auctionEnds")}{" "}
                <Span variant="primary">{formatDate(auctionEndDate)}</Span>
              </Text>
            )}
          </div>
        ) : (
          <Text className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(price)}
          </Text>
        )}
      </div>

      {/* Stock */}
      {!isOutOfStock && availableQuantity > 0 && (
        <Text
          size="sm"
          className="text-emerald-600 dark:text-emerald-400 font-medium"
        >
          {t("availableStock", { qty: availableQuantity })}
        </Text>
      )}

      {/* Metadata row */}
      <div
        className={`flex flex-wrap gap-x-6 gap-y-1 text-sm ${themed.textSecondary}`}
      >
        {brand && (
          <Span variant="secondary">
            <Span weight="medium">{t("brand")}:</Span> {brand}
          </Span>
        )}
        {category && (
          <Span variant="secondary">
            <Span weight="medium">{t("category")}:</Span>{" "}
            {subcategory ? `${category} › ${subcategory}` : category}
          </Span>
        )}
        {sellerName && (
          <Span variant="secondary">
            <Span weight="medium">{t("seller")}:</Span> {sellerName}
          </Span>
        )}
      </div>

      {/* Add to cart button - rendered by parent as slot */}
      {onAddToCart !== undefined && (
        <div className="pt-1">
          {isOutOfStock ? (
            <div className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl text-center font-medium text-sm cursor-not-allowed">
              {status === "sold" ? t("sold") : t("outOfStock")}
            </div>
          ) : isAuction ? (
            <Button
              onClick={onAddToCart}
              disabled={isAddingToCart}
              isLoading={isAddingToCart}
              className="w-full"
            >
              {t("placeBid")}
            </Button>
          ) : (
            <Button
              onClick={onAddToCart}
              disabled={isAddingToCart}
              isLoading={isAddingToCart}
              className="w-full"
            >
              {t("addToCart")}
            </Button>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <div>
          <Heading level={2} className="font-semibold mb-2">
            {t("description")}
          </Heading>
          <Text size="sm" variant="secondary" className="leading-relaxed">
            {description}
          </Text>
        </div>
      )}

      {/* Features */}
      {features && features.length > 0 && (
        <div>
          <Heading level={2} className="font-semibold mb-2">
            {t("features")}
          </Heading>
          <Ul className="list-disc list-inside space-y-1">
            {features.map((f, idx) => (
              <Li key={idx} className={`text-sm ${themed.textSecondary}`}>
                {f}
              </Li>
            ))}
          </Ul>
        </div>
      )}

      {/* Specifications */}
      {specifications && specifications.length > 0 && (
        <div>
          <Heading level={2} className="font-semibold mb-2">
            {t("specifications")}
          </Heading>
          <div
            className={`rounded-xl border ${themed.border} divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden`}
          >
            {specifications.map((spec, idx) => (
              <div key={idx} className="flex items-start px-4 py-2.5 text-sm">
                <Span
                  weight="medium"
                  variant="primary"
                  className="w-1/3 shrink-0"
                >
                  {spec.name}
                </Span>
                <Span variant="secondary">
                  {spec.value}
                  {spec.unit ? ` ${spec.unit}` : ""}
                </Span>
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
              <Heading level={2} className="font-semibold mb-1">
                {t("shipping")}
              </Heading>
              <Text size="sm" variant="secondary">
                {shippingInfo}
              </Text>
            </div>
          )}
          {returnPolicy && (
            <div>
              <Heading level={2} className="font-semibold mb-1">
                {t("returnPolicy")}
              </Heading>
              <Text size="sm" variant="secondary">
                {returnPolicy}
              </Text>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Span
              key={tag}
              size="xs"
              variant="secondary"
              className={`px-2.5 py-1 rounded-full ${themed.bgSecondary} border ${themed.border}`}
            >
              {tag}
            </Span>
          ))}
        </div>
      )}
    </div>
  );
}
