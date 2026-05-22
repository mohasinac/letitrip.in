"use client";

import { Button, CheckoutSuccessView, Div, Heading, Text } from "@mohasinac/appkit/client";

export function CheckoutSuccessRouteClient() {
  return (
    <CheckoutSuccessView
      labels={{ title: "Order Confirmed" }}
      renderHero={() => (
        <Div className="rounded-xl border border-success/20 bg-success-surface" padding="md">
          <Heading level={2} className="mb-2 text-lg font-semibold text-success">
            Thank you for your order
          </Heading>
          <Text className="text-success">Your order has been placed successfully.</Text>
        </Div>
      )}
      renderOrderCard={() => (
        <Div surface="card" padding="md">
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">Order details will appear here.</Text>
        </Div>
      )}
      renderActions={() => (
        <Button type="button" className="w-full sm:w-auto">
          Continue Shopping
        </Button>
      )}
    />
  );
}
