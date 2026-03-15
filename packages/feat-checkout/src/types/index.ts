import type { PaymentGateway } from "@mohasinac/feat-payments";
import type { UserAddress } from "@mohasinac/feat-account";

export { UserAddress };

export type CheckoutStep =
  | "address"
  | "shipping"
  | "payment"
  | "review"
  | "confirmation";

export interface ShippingOption {
  id: string;
  label: string;
  description?: string;
  price: number;
  currency?: string;
  estimatedDays?: number;
}

export interface CheckoutState {
  step: CheckoutStep;
  address?: UserAddress;
  shippingOption?: ShippingOption;
  paymentGateway?: PaymentGateway;
  couponCode?: string;
  notes?: string;
}

export interface CheckoutSummary {
  subtotal: number;
  shippingCost: number;
  discount?: number;
  tax?: number;
  total: number;
  currency: string;
}

export interface PlaceOrderInput {
  address: UserAddress;
  shippingOptionId: string;
  paymentGateway: PaymentGateway;
  couponCode?: string;
  notes?: string;
}
