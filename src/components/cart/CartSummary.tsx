"use client";

import {
  CartSummary as CartSummaryBase,
  FormLabel,
  Price,
} from "@letitrip/react-library";
import { Loader2, ShoppingBag, Tag, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
  couponCode?: string;
  onApplyCoupon?: (code: string) => Promise<void>;
  onRemoveCoupon?: () => Promise<void>;
  onCheckout?: () => void;
  loading?: boolean;
}

export function CartSummary({
  subtotal,
  shipping,
  tax,
  discount,
  total,
  itemCount,
  couponCode,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  loading = false,
}: CartSummaryProps) {
  const router = useRouter();

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      router.push("/checkout");
    }
  };

  const defaultIcons = {
    loader: <Loader2 className="h-5 w-5 animate-spin" />,
    shoppingBag: <ShoppingBag className="h-5 w-5" />,
    tag: <Tag className="h-4 w-4 text-green-600" />,
    close: <X className="h-4 w-4" />,
  };

  return (
    <CartSummaryBase
      subtotal={subtotal}
      shipping={shipping}
      tax={tax}
      discount={discount}
      total={total}
      itemCount={itemCount}
      couponCode={couponCode}
      onApplyCoupon={onApplyCoupon}
      onRemoveCoupon={onRemoveCoupon}
      onCheckout={handleCheckout}
      loading={loading}
      PriceComponent={Price}
      FormLabelComponent={FormLabel}
      icons={defaultIcons}
    />
  );
}
