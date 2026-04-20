"use client";

import { Button, CartView, Div, Heading, Text } from "@mohasinac/appkit/client";

export function CartRouteClient() {
  return (
    <CartView
      labels={{ title: "Cart" }}
      isEmpty
      renderItems={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">Your cart is currently empty.</Text>
        </Div>
      )}
      renderSummary={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Heading level={3} className="mb-2 text-base font-semibold text-zinc-900">
            Summary
          </Heading>
          <Text className="text-sm text-zinc-600">Subtotal: INR 0</Text>
        </Div>
      )}
      renderCheckoutButton={() => (
        <Button type="button" className="mt-3 w-full">
          Checkout
        </Button>
      )}
      renderEmpty={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-6">
          <Heading level={2} className="mb-2 text-lg font-semibold text-zinc-900">
            Your cart is empty
          </Heading>
          <Text className="text-zinc-600">Add products from the marketplace to continue.</Text>
        </Div>
      )}
    />
  );
}
