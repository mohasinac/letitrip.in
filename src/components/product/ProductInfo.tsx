"use client";

import { logError } from "@/lib/error-logger";
import { FormLabel, Price, useCart } from "@letitrip/react-library";
import { ProductInfo as LibraryProductInfo } from "@letitrip/react-library";
import type { ProductInfoProps as LibraryProductInfoProps } from "@letitrip/react-library";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Product = LibraryProductInfoProps["product"];

export interface ProductInfoProps {
  product: Product;
  quantity?: number;
  isFavorite?: boolean;
}

export function ProductInfo({ product, quantity, isFavorite }: ProductInfoProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const handleAddToCart = async (qty: number) => {
    try {
      await addItem(product.id, qty, undefined, {
        name: product.name,
        price: product.salePrice,
        image: product.image || "",
        shopId: product.shop_id,
        shopName: product.shop_name,
      });
    } catch (error) {
      logError(error as Error, {
        component: "ProductInfo.handleAddToCart",
        metadata: { productId: product.id },
      });
      throw error;
    }
  };

  const handleBuyNow = async (qty: number) => {
    await handleAddToCart(qty);
    router.push("/checkout");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          url: globalThis.location?.href || "",
        });
      } catch (error) {
        logError(error as Error, { component: "ProductInfo.handleShare" });
        throw error;
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(globalThis.location?.href || "");
    }
  };

  const handleShopClick = (shopId: string) => {
    router.push(`/shops/${shopId}`);
  };

  return (
    <LibraryProductInfo
      product={product}
      quantity={quantity}
      isFavorite={isFavorite}
      onAddToCart={handleAddToCart}
      onBuyNow={handleBuyNow}
      onShare={handleShare}
      onShopClick={handleShopClick}
      PriceComponent={Price}
      FormLabelComponent={FormLabel}
      onCartSuccess={(msg) => toast.success(msg)}
      onCartError={(msg) => toast.error(msg)}
      onShareSuccess={(msg) => toast.success(msg)}
    />
  );
}

export default ProductInfo;
