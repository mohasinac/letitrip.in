"use client";

import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useWishlistToggle } from "@/hooks";
import { PreOrderTag } from "@mohasinac/feat-pre-orders";
import type { ProductItem } from "@mohasinac/feat-products";
import {
  BaseListingCard,
  Button,
  MediaImage,
  Span,
  Text,
  TextLink,
} from "@/components";
import { formatCurrency } from "@/utils";

const { themed, flex, position } = THEME_CONSTANTS;

/** PreOrderCardData = ProductItem (products with isPreOrder==true) */
export type PreOrderCardData = ProductItem;

export interface PreOrderCardProps {
  product: PreOrderCardData;
  className?: string;
  variant?: "grid" | "list";
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  inWishlist?: boolean;
}

export function PreOrderCard({
  product,
  className = "",
  variant = "grid",
  selectable = false,
  isSelected = false,
  onSelect,
  inWishlist: initialInWishlist = false,
}: PreOrderCardProps) {
  const t = useTranslations("preOrders");
  const tWishlist = useTranslations("wishlist");
  const { inWishlist, toggle: toggleWishlist } = useWishlistToggle(
    product.id,
    initialInWishlist,
  );

  const href = ROUTES.PUBLIC.PRE_ORDER_DETAIL(product.id);
  const deliveryDate = (product as unknown as { preOrderDeliveryDate?: string })
    .preOrderDeliveryDate;

  return (
    <BaseListingCard
      isSelected={isSelected}
      variant={variant}
      className={className}
    >
      {/* ── IMAGE ── */}
      <BaseListingCard.Hero aspect="square" variant={variant}>
        <TextLink href={href} className={`${position.fill} block`}>
          <MediaImage
            src={product.mainImage}
            alt={product.title}
            size="card"
            fallback="📦"
          />
        </TextLink>

        {/* Pre-order badge */}
        <div className="absolute top-2 right-2">
          <Span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cobalt text-white">
            {t("preOrderBadge")}
          </Span>
        </div>

        {/* Selectable checkbox */}
        {selectable && (
          <BaseListingCard.Checkbox
            selected={isSelected}
            onSelect={(e) => {
              e.stopPropagation();
              onSelect?.(product.id, !isSelected);
            }}
          />
        )}
      </BaseListingCard.Hero>

      {/* ── INFO ── */}
      <BaseListingCard.Info variant={variant}>
        <TextLink href={href}>
          <Text
            size="sm"
            weight="medium"
            className={`line-clamp-2 ${themed.textPrimary}`}
          >
            {product.title}
          </Text>
        </TextLink>

        <div className={`${flex.between} items-center mt-1`}>
          <Text size="sm" weight="semibold" className={themed.textPrimary}>
            {formatCurrency(product.price, product.currency)}
          </Text>
          {deliveryDate && <PreOrderTag estimatedDate={deliveryDate} />}
        </div>

        <div className={`${flex.between} items-center mt-2`}>
          <Button
            variant="primary"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => {
              window.location.href = href;
            }}
          >
            {t("reserveNow")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist();
            }}
            className={`ml-2 text-base ${inWishlist ? "text-primary" : themed.textSecondary}`}
            aria-label={
              inWishlist
                ? tWishlist("removeFromWishlist")
                : tWishlist("addToWishlist")
            }
          >
            {inWishlist ? "♥" : "♡"}
          </Button>
        </div>
      </BaseListingCard.Info>
    </BaseListingCard>
  );
}
