"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
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
  paymentMethod: "cod" | "online" | "upi_manual";
  notes?: string;
}

interface CreateRazorpayOrderPayload {
  amount: number;
  currency?: string;
  receipt?: string;
}

interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  addressId: string;
  notes?: string;
}

interface UseCheckoutOptions {
  onPlaceCodOrderSuccess?: (result: PlaceOrderResponse) => void;
  onPlaceCodOrderError?: () => void;
}

/**
 * useCheckout
 * Bundles address + cart queries, COD place-order mutation, and Razorpay
 * payment mutations — all wrapped so components never import services directly.
 */
export function useCheckout(options?: UseCheckoutOptions) {
  const queryClient = useQueryClient();

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
    onSuccess: async (result) => {
      // Clear stale cart and orders cache after a successful order
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      options?.onPlaceCodOrderSuccess?.(result);
    },
    onError: options?.onPlaceCodOrderError,
  });

  // Razorpay mutations — must stay client-side (browser Razorpay SDK)
  const createPaymentOrderMutation = useApiMutation<
    CreateRazorpayOrderResponse,
    CreateRazorpayOrderPayload
  >({
    mutationFn: (data) => checkoutService.createPaymentOrder(data),
  });

  const verifyPaymentMutation = useApiMutation<
    PlaceOrderResponse,
    VerifyPaymentPayload
  >({
    mutationFn: (data) => checkoutService.verifyPayment(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    addressQuery,
    cartQuery,
    placeCodOrderMutation,
    createPaymentOrderMutation,
    verifyPaymentMutation,
  };
}
