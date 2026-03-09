"use client";

import {
  Button,
  Caption,
  MediaImage,
  Span,
  Text,
  TextLink,
} from "@/components";
import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import type { CartItemDocument } from "@/db/schema";

const { themed, borderRadius, flex, position } = THEME_CONSTANTS;

interface CartItemRowProps {
  item: CartItemDocument;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}: CartItemRowProps) {
  const t = useTranslations("cart");
  const lineTotal = item.price * item.quantity;

  return (
    <div
      className={`flex gap-4 p-4 ${themed.bgPrimary} ${borderRadius.xl} border ${themed.border} ${isUpdating ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Product image */}
      <TextLink
        href={`${ROUTES.PUBLIC.PRODUCTS}/${item.productId}`}
        className="shrink-0"
      >
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-lg bg-zinc-100 dark:bg-slate-800">
          {item.productImage ? (
            <MediaImage
              src={item.productImage}
              alt={item.productTitle}
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
          href={`${ROUTES.PUBLIC.PRODUCTS}/${item.productId}`}
          className={`text-sm font-medium ${themed.textPrimary} hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 transition-colors`}
        >
          {item.productTitle}
        </TextLink>
        <Caption className="mt-0.5">{item.sellerName}</Caption>
        <Text className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
          {formatCurrency(item.price)}
        </Text>

        {/* Quantity controls + remove */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => onUpdateQuantity(item.itemId, item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating}
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
              onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
              disabled={isUpdating}
              className={`w-7 h-7 ${flex.center} rounded-lg border ${themed.border} ${themed.textPrimary} hover:bg-zinc-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold transition-colors`}
              aria-label={t("increaseQty")}
            >
              +
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => onRemove(item.itemId)}
            disabled={isUpdating}
            className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 disabled:opacity-40 transition-colors font-medium"
          >
            {t("remove")}
          </Button>
        </div>
      </div>

      {/* Line total */}
      <div className="shrink-0 text-right">
        <Text size="sm" weight="bold" className={themed.textPrimary}>
          {formatCurrency(lineTotal)}
        </Text>
      </div>
    </div>
  );
}
