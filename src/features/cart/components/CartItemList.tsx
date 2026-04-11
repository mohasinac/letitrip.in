"use client";

import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { CartItemRow } from "./CartItemRow";
import { Heading, Text, Span, Button } from "@mohasinac/appkit/ui";

import { useRouter } from "@/i18n/navigation";
import type { CartItemDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;

interface CartItemListProps {
  items: CartItemDocument[];
  updatingItemId: string | null;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

interface SellerGroup {
  sellerId: string;
  sellerName: string;
  items: CartItemDocument[];
}

function groupBySeller(items: CartItemDocument[]): SellerGroup[] {
  const map = new Map<string, SellerGroup>();
  for (const item of items) {
    const existing = map.get(item.sellerId);
    if (existing) {
      existing.items.push(item);
    } else {
      map.set(item.sellerId, {
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        items: [item],
      });
    }
  }
  return Array.from(map.values());
}

export function CartItemList({
  items,
  updatingItemId,
  onUpdateQuantity,
  onRemove,
}: CartItemListProps) {
  const t = useTranslations("cart");
  const router = useRouter();
  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <Span className="text-6xl mb-4 block">🛒</Span>
        <Heading level={2} className="text-xl font-bold mb-2">
          {t("empty")}
        </Heading>
        <Text size="sm" variant="secondary" className="mb-6">
          {t("emptyDesc")}
        </Text>
        <Button
          variant="primary"
          onClick={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
        >
          {t("startShopping")}
        </Button>
      </div>
    );
  }

  const groups = groupBySeller(items);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div
          key={group.sellerId}
          className={`rounded-xl border ${themed.border} overflow-hidden`}
        >
          {/* Seller header */}
          <div
            className={`flex items-center gap-2 px-4 py-2.5 border-b ${themed.border} ${themed.bgSecondary}`}
          >
            <Span className="text-base">🏪</Span>
            <Text size="sm" weight="semibold">
              {t("soldBy", { name: group.sellerName })}
            </Text>
            <Text size="xs" variant="secondary" className="ml-auto">
              {t("sellerItems", { count: group.items.length })}
            </Text>
          </div>

          {/* Items */}
          <div className="divide-y divide-inherit">
            {group.items.map((item) => (
              <CartItemRow
                key={item.itemId}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
                isUpdating={updatingItemId === item.itemId}
                hideSeller
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
