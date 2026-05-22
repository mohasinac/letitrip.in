"use client";

import React, { useTransition } from "react";
import { Button, Stack, Text } from "@mohasinac/appkit/client";
import { addToCartAction } from "@/actions";
import type { ProductDocument } from "@mohasinac/appkit";

interface LiveItemActionsClientProps {
  product: ProductDocument;
}

export function LiveItemActionsClient({ product }: LiveItemActionsClientProps) {
  const [isPending, startTransition] = useTransition();

  function handleAddToCart() {
    startTransition(async () => {
      await addToCartAction({
        productId: product.id,
        productTitle: product.title,
        productImage: product.mainImage ?? product.images?.[0] ?? "",
        price: product.price,
        currency: product.currency ?? "INR",
        quantity: 1,
        storeId: product.storeId ?? "",
        storeName: product.storeName ?? "",
        listingType: "live",
      });
    });
  }

  if (!product.storeId) return null;

  return (
    <Stack gap="sm">
      {product.liveItem && !product.liveItem.vendorVerified && (
        <Text className="text-sm text-warning">
          Seller verification pending — purchase available once verified.
        </Text>
      )}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={isPending || !product.liveItem?.vendorVerified}
        aria-label={`Add ${product.title} to cart`}
      >
        {isPending ? "Adding…" : "Add to Cart"}
      </Button>
    </Stack>
  );
}
