"use client";

import { useCallback } from "react";
import {
  Button,
  CartItemRow,
  CartSummary,
  CartView,
  Div,
  Heading,
  Text,
  useGuestCart,
} from "@mohasinac/appkit/client";
import type { CartItem } from "@mohasinac/appkit/client";

function guestItemsToCartItems(
  items: ReturnType<typeof useGuestCart>["items"],
): CartItem[] {
  return items.map((item) => ({
    id: item.productId,
    productId: item.productId,
    quantity: item.quantity,
    meta: {
      productId: item.productId,
      title: item.productTitle ?? item.productId,
      image: item.productImage,
      price: item.price ?? 0,
      currency: "INR",
    },
  }));
}

export function CartRouteClient() {
  const { items, remove, updateQuantity } = useGuestCart();

  const cartItems = guestItemsToCartItems(items);
  const subtotal = cartItems.reduce((sum, i) => sum + i.meta.price * i.quantity, 0);
  const isEmpty = cartItems.length === 0;

  const handleQtyChange = useCallback(
    (id: string, qty: number) => {
      if (qty <= 0) {
        remove(id);
      } else {
        updateQuantity(id, qty);
      }
    },
    [remove, updateQuantity],
  );

  const handleRemove = useCallback(
    (id: string) => {
      remove(id);
    },
    [remove],
  );

  return (
    <CartView
      labels={{ title: "Cart" }}
      isEmpty={isEmpty}
      renderItems={() => (
        <Div className="space-y-3">
          {cartItems.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onQtyChange={handleQtyChange}
              onRemove={handleRemove}
            />
          ))}
        </Div>
      )}
      renderSummary={() => (
        <CartSummary
          labels={{ title: "Summary" }}
          renderBreakdown={() => (
            <Text className="text-sm text-zinc-600 dark:text-zinc-300">
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
            </Text>
          )}
          renderTotal={() => (
            <Text className="font-semibold text-zinc-900 dark:text-zinc-100">
              Subtotal: &#x20B9;{subtotal.toFixed(2)}
            </Text>
          )}
        />
      )}
      renderCheckoutButton={(onCheckout) => (
        <Button
          type="button"
          onClick={onCheckout}
          className="mt-3 w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Checkout
        </Button>
      )}
      renderEmpty={() => (
        <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <Heading level={2} className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Your cart is empty
          </Heading>
          <Text className="text-zinc-600 dark:text-zinc-300">Add products from the marketplace to continue.</Text>
        </Div>
      )}
    />
  );
}
