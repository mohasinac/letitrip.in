"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import type { CartItemDocument } from "@/db/schema";

const { themed, borderRadius } = THEME_CONSTANTS;

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
  const lineTotal = item.price * item.quantity;

  return (
    <div
      className={`flex gap-4 p-4 ${themed.bgPrimary} ${borderRadius.xl} border ${themed.border} ${isUpdating ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Product image */}
      <Link
        href={`${ROUTES.PUBLIC.PRODUCTS}/${item.productId}`}
        className="shrink-0"
      >
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
          {item.productImage ? (
            <Image
              src={item.productImage}
              alt={item.productTitle}
              fill
              className="object-cover hover:scale-105 transition-transform"
              sizes="96px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-2xl text-gray-400">
              📦
            </div>
          )}
        </div>
      </Link>

      {/* Item details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`${ROUTES.PUBLIC.PRODUCTS}/${item.productId}`}
          className={`text-sm font-medium ${themed.textPrimary} hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 transition-colors`}
        >
          {item.productTitle}
        </Link>
        <p className={`text-xs mt-0.5 ${themed.textSecondary}`}>
          {item.sellerName}
        </p>
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
          {formatCurrency(item.price)}
        </p>

        {/* Quantity controls + remove */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateQuantity(item.itemId, item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating}
              className={`w-7 h-7 flex items-center justify-center rounded-lg border ${themed.border} ${themed.textPrimary} hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold transition-colors`}
            >
              −
            </button>
            <span
              className={`w-8 text-center text-sm font-medium ${themed.textPrimary}`}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
              disabled={isUpdating}
              className={`w-7 h-7 flex items-center justify-center rounded-lg border ${themed.border} ${themed.textPrimary} hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold transition-colors`}
            >
              +
            </button>
          </div>

          <button
            onClick={() => onRemove(item.itemId)}
            disabled={isUpdating}
            className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 disabled:opacity-40 transition-colors font-medium"
          >
            {UI_LABELS.CART.REMOVE}
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="shrink-0 text-right">
        <p className={`text-sm font-bold ${themed.textPrimary}`}>
          {formatCurrency(lineTotal)}
        </p>
      </div>
    </div>
  );
}
