"use client";

import Link from "next/link";
import { ROUTES, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { CartItemRow } from "./CartItemRow";
import type { CartItemDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;

interface CartItemListProps {
  items: CartItemDocument[];
  updatingItemId: string | null;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemList({
  items,
  updatingItemId,
  onUpdateQuantity,
  onRemove,
}: CartItemListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl mb-4 block">🛒</span>
        <h2 className={`text-xl font-bold mb-2 ${themed.textPrimary}`}>
          {UI_LABELS.CART.EMPTY}
        </h2>
        <p className={`text-sm mb-6 ${themed.textSecondary}`}>
          {UI_LABELS.CART.EMPTY_SUBTITLE}
        </p>
        <Link
          href={ROUTES.PUBLIC.PRODUCTS}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors text-sm"
        >
          {UI_LABELS.CART.START_SHOPPING}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CartItemRow
          key={item.itemId}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
          isUpdating={updatingItemId === item.itemId}
        />
      ))}
    </div>
  );
}
