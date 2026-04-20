"use client";

import { CheckoutSuccessView } from "@mohasinac/appkit";
import { Button, Div, Heading, Text } from "@mohasinac/appkit";

export function CheckoutSuccessRouteClient() {
  return (
    <CheckoutSuccessView
      labels={{ title: "Order Confirmed" }}
      renderHero={() => (
        <Div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <Heading level={2} className="mb-2 text-lg font-semibold text-emerald-900">
            Thank you for your order
          </Heading>
          <Text className="text-emerald-800">Your order has been placed successfully.</Text>
        </Div>
      )}
      renderOrderCard={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-sm text-zinc-600">Order details will appear here.</Text>
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
