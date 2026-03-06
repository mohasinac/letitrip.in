import React, { Suspense } from "react";
import { CheckoutSuccessView } from "@/features/cart";

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessView />
    </Suspense>
  );
}
