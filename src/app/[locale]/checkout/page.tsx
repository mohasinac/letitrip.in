/**
 * Checkout Page
 *
 * Route: /checkout
 * Thin wrapper — all logic lives in CheckoutView.
 */

import { CheckoutView } from "@/features/cart";

export default function CheckoutPage() {
  return <CheckoutView />;
}
