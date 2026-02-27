"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { addressService, cartService, checkoutService } from "@/services";
import type { AddressDocument, CartDocument } from "@/db/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AddressListResponse {
  data: AddressDocument[];
}

export interface CartApiResponse {
  cart: CartDocument;
  itemCount: number;
  subtotal: number;
}

export interface PlaceOrderResponse {
  orderIds: string[];
  total: number;
  itemCount: number;
}

export interface CreateRazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface PlaceOrderPayload {
  addressId: string;
  paymentMethod: "cod" | "online";
}

interface UseCheckoutOptions {
  onPlaceCodOrderSuccess?: (result: PlaceOrderResponse) => void;
  onPlaceCodOrderError?: () => void;
}

/**
 * useCheckout
 * Bundles address + cart queries, COD place-order mutation, and exposes
 * Razorpay service helpers as passthrough functions.
 */
export function useCheckout(options?: UseCheckoutOptions) {
  const addressQuery = useApiQuery<AddressListResponse>({
    queryKey: ["addresses"],
    queryFn: () => addressService.list(),
  });

  const cartQuery = useApiQuery<CartApiResponse>({
    queryKey: ["cart"],
    queryFn: () => cartService.get(),
  });

  const placeCodOrderMutation = useApiMutation<
    PlaceOrderResponse,
    PlaceOrderPayload
  >({
    mutationFn: (data) => checkoutService.placeOrder(data),
    onSuccess: options?.onPlaceCodOrderSuccess,
    onError: options?.onPlaceCodOrderError,
  });

  return {
    addressQuery,
    cartQuery,
    placeCodOrderMutation,
    // Razorpay flow — called directly in event handlers
    createPaymentOrder:
      checkoutService.createPaymentOrder.bind(checkoutService),
    verifyPayment: checkoutService.verifyPayment.bind(checkoutService),
  };
}
