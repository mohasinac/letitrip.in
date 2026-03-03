"use client";

import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { CartItemRow } from "./CartItemRow";
import { Button, Heading, Span, Text } from "@/components";
import { useRouter } from "@/i18n/navigation";
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
