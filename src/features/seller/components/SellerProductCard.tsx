"use client";
import { useTranslations } from "next-intl";
import { Span, Text, Button, Row } from "@mohasinac/appkit/ui";
import { BaseListingCard, MediaImage } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@mohasinac/appkit/utils";


import type { AdminProduct } from "@/components";

interface SellerProductCardProps {
  product: AdminProduct;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
}

const STATUS_STYLES: Record<string, string> = {
  published:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  draft: "bg-zinc-100 text-zinc-600 dark:bg-slate-700 dark:text-zinc-400",
  out_of_stock:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  discontinued: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  sold: "bg-primary/10 text-primary dark:bg-primary/20",
};

function StockBar({ available, total }: { available: number; total: number }) {
  if (total <= 0) return null;
  const pct = Math.min(100, Math.round((available / total) * 100));
  const color =
    pct > 50 ? "bg-emerald-500" : pct > 10 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-0.5">
      <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <Text size="xs" variant="secondary">
        {available} / {total} in stock
      </Text>
    </div>
  );
}

export function SellerProductCard({
  product,
  onEdit,
  onDelete,
}: SellerProductCardProps) {
  const tActions = useTranslations("actions");
  const { themed, flex } = THEME_CONSTANTS;

  const sold = Math.max(0, product.stockQuantity - product.availableQuantity);
  const revenue = sold * product.price;

  return (
    <BaseListingCard>
      <BaseListingCard.Hero aspect="square">
        <MediaImage
          src={product.video?.thumbnailUrl || product.mainImage || undefined}
          alt={product.title}
          size="card"
          fallback="??"
        />
        {product.video?.url && (
          <div
            className={`absolute inset-0 ${flex.center} pointer-events-none`}
          >
            <Span
              className={`bg-black/50 text-white rounded-full w-8 h-8 ${flex.center} text-sm leading-none`}
            >
              ?
            </Span>
          </div>
        )}
        <Span
          className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${STATUS_STYLES[product.status] ?? STATUS_STYLES.draft}`}
        >
          {product.status.replace(/_/g, " ")}
        </Span>
      </BaseListingCard.Hero>
      <BaseListingCard.Info className="gap-2">
        <Text size="sm" weight="semibold" className="truncate">
          {product.title}
        </Text>
        <div className={`${flex.between} gap-2`}>
          <Text size="sm" weight="bold">
            {formatCurrency(product.price)}
          </Text>
          {revenue > 0 && (
            <Text size="xs" variant="secondary" className="text-right">
              {formatCurrency(revenue)} sold
            </Text>
          )}
        </div>
        <StockBar
          available={product.availableQuantity}
          total={product.stockQuantity}
        />
        <Row wrap gap="sm" className="pt-1 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
            className="flex-1 min-w-0 text-xs py-1.5 px-2 sm:text-xs sm:px-2"
          >
            {tActions("edit")}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(product)}
            className="flex-1 min-w-0 text-xs py-1.5 px-2 sm:text-xs sm:px-2"
          >
            {tActions("delete")}
          </Button>
        </Row>
      </BaseListingCard.Info>
    </BaseListingCard>
  );
}

