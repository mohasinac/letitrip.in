"use client";

import { PaymentMethod as LibraryPaymentMethod } from "@letitrip/react-library";
import { Banknote, CreditCard, Globe } from "lucide-react";

interface PaymentMethodProps {
  selected: "razorpay" | "paypal" | "cod";
  onSelect: (method: "razorpay" | "paypal" | "cod") => void;
  availableGateways?: string[];
  isInternational?: boolean;
}

export function PaymentMethod(props: PaymentMethodProps) {
  return (
    <LibraryPaymentMethod
      {...props}
      icons={{
        creditCard: CreditCard,
        globe: Globe,
        banknote: Banknote,
      }}
    />
  );
}
