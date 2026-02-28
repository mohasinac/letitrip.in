import React, { Suspense } from "react";
import { CheckoutSuccessView } from "@/components";

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessView />
    </Suspense>
  );
}
