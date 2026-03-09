"use client";

import { Button, MediaImage, Span, Text, TextLink } from "@/components";
import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import type { GuestCartItem } from "@/utils";

const { themed, borderRadius, flex, position } = THEME_CONSTANTS;

interface GuestCartItemRowProps {
  item: GuestCartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function GuestCartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: GuestCartItemRowProps) {
  const t = useTranslations("cart");
  const lineTotal = item.price != null ? item.price * item.quantity : null;
  const productHref = ROUTES.PUBLIC.PRODUCT_DETAIL(item.productId);

  return (
    <div
      className={`flex gap-4 p-4 ${themed.bgPrimary} ${borderRadius.xl} border ${themed.border}`}
    >
      {/* Product image */}
      <TextLink href={productHref} className="shrink-0">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-lg bg-zinc-100 dark:bg-slate-800">
          {item.productImage ? (
            <MediaImage
              src={item.productImage}
              alt={item.productTitle ?? "Product"}
              size="thumbnail"
              className="hover:scale-105 transition-transform"
            />
          ) : (
            <div
              className={`${position.fill} ${flex.center} text-2xl text-zinc-400`}
            >
              📦
            </div>
          )}
        </div>
      </TextLink>

      {/* Item details */}
      <div className="flex-1 min-w-0">
        <TextLink
          href={productHref}
          className={`text-sm font-medium ${themed.textPrimary} hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 transition-colors`}
        >
          {item.productTitle ?? item.productId}
        </TextLink>

        {item.price != null && (
          <Text className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(item.price)}
          </Text>
        )}

        {/* Quantity controls + remove */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() =>
                onUpdateQuantity(item.productId, item.quantity - 1)
              }
              disabled={item.quantity <= 1}
              className={`w-7 h-7 ${flex.center} rounded-lg border ${themed.border} ${themed.textPrimary} hover:bg-zinc-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold transition-colors`}
              aria-label={t("decreaseQty")}
            >
              −
            </Button>
            <Span
              className={`w-8 text-center text-sm font-medium ${themed.textPrimary}`}
            >
              {item.quantity}
            </Span>
            <Button
              variant="ghost"
              onClick={() =>
                onUpdateQuantity(item.productId, item.quantity + 1)
              }
              className={`w-7 h-7 ${flex.center} rounded-lg border ${themed.border} ${themed.textPrimary} hover:bg-zinc-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold transition-colors`}
              aria-label={t("increaseQty")}
            >
              +
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => onRemove(item.productId)}
            className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors font-medium"
          >
            {t("remove")}
          </Button>
        </div>
      </div>

      {/* Line total */}
      {lineTotal != null && (
        <div className="shrink-0 text-right">
          <Text size="sm" weight="bold" className={themed.textPrimary}>
            {formatCurrency(lineTotal)}
          </Text>
        </div>
      )}
    </div>
  );
}
