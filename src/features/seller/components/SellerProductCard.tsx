"use client";

import { useTranslations } from "next-intl";
import { Badge, Button, MediaImage, Span, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import type { AdminProduct } from "@/components";

interface SellerProductCardProps {
  product: AdminProduct;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
}

export function SellerProductCard({
  product,
  onEdit,
  onDelete,
}: SellerProductCardProps) {
  const tActions = useTranslations("actions");
  const { themed, flex } = THEME_CONSTANTS;

  return (
    <div
      className={`rounded-xl overflow-hidden border ${themed.border} ${themed.bgPrimary} h-full`}
    >
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <MediaImage
          src={product.video?.thumbnailUrl || product.mainImage || undefined}
          alt={product.title}
          size="card"
          fallback="📦"
        />
        {product.video?.url && (
          <div
            className={`absolute inset-0 ${flex.center} pointer-events-none`}
          >
            <Span
              className={`bg-black/50 text-white rounded-full w-8 h-8 ${flex.center} text-sm leading-none`}
            >
              ▶
            </Span>
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <Text size="sm" weight="semibold" className="truncate">
          {product.title}
        </Text>
        <div className={`${flex.between} gap-2`}>
          <Text size="sm" weight="bold">
            {formatCurrency(product.price)}
          </Text>
          <Badge
            variant={
              product.status === "published"
                ? "success"
                : product.status === "out_of_stock"
                  ? "warning"
                  : "default"
            }
            className="text-xs capitalize"
          >
            {product.status.replace(/_/g, " ")}
          </Badge>
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
            className="flex-1 text-xs py-1.5"
          >
            {tActions("edit")}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(product)}
            className="flex-1 text-xs py-1.5"
          >
            {tActions("delete")}
          </Button>
        </div>
      </div>
    </div>
  );
}
