"use client";

import { CheckoutView } from "@mohasinac/appkit";
import { Button, Div, Heading, Input, Stack, Text } from "@mohasinac/appkit";

export function CheckoutRouteClient() {
  return (
    <CheckoutView
      labels={{ title: "Checkout" }}
      renderStepIndicator={(activeStep, totalSteps) => (
        <Text className="mb-4 text-sm text-zinc-600">
          Step {activeStep + 1} of {totalSteps}
        </Text>
      )}
      renderStep={(activeStep) => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Heading level={2} className="mb-3 text-lg font-semibold text-zinc-900">
            {activeStep === 0 ? "Shipping" : activeStep === 1 ? "Payment" : "Review"}
          </Heading>
          <Stack gap="md">
            <Input placeholder="Full name" />
            <Input placeholder="Phone number" />
            <Input placeholder="Address line" />
            <Text className="text-sm text-zinc-600">
              This route is now wired to appkit checkout shell; transactional bindings are next.
            </Text>
          </Stack>
        </Div>
      )}
      renderOrderSummary={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Heading level={3} className="mb-2 text-base font-semibold text-zinc-900">
            Order Summary
          </Heading>
          <Text className="mb-3 text-sm text-zinc-600">No checkout items yet.</Text>
          <Button type="button" className="w-full">
            Place Order
          </Button>
        </Div>
      )}
    />
  );
}