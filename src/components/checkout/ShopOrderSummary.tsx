"use client";

import {
  OptimizedImage,
  Price,
  ShopOrderSummary as ShopOrderSummaryBase,
  type AppliedCoupon,
  type ShopOrderItem,
} from "@letitrip/react-library";
import { Loader2, Store, Tag, X } from "lucide-react";

interface ShopOrderSummaryProps {
  shopId: string;
  shopName: string;
  items: ShopOrderItem[];
  onApplyCoupon?: (shopId: string, code: string) => Promise<void>;
  onRemoveCoupon?: (shopId: string) => Promise<void>;
  appliedCoupon?: AppliedCoupon | null;
}

export function ShopOrderSummary({
  shopId,
  shopName,
  items,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
}: ShopOrderSummaryProps) {
  const defaultIcons = {
    store: <Store className="w-5 h-5" />,
    tag: <Tag className="w-4 h-4" />,
    close: <X className="w-4 h-4" />,
    loader: <Loader2 className="w-4 h-4 animate-spin" />,
  };

  return (
    <ShopOrderSummaryBase
      shopId={shopId}
      shopName={shopName}
      items={items}
      onApplyCoupon={onApplyCoupon}
      onRemoveCoupon={onRemoveCoupon}
      appliedCoupon={appliedCoupon}
      ImageComponent={OptimizedImage as any}
      PriceComponent={Price}
      icons={defaultIcons}
    />
  );
}
