"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import { API_ENDPOINTS } from "@/constants";
import { useCheckoutReadQueries } from "@mohasinac/feat-cart";
import type {
  AddressDocument,
  CartDocument,
  CartItemDocument,
} from "@/db/schema";

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
  unavailableItems?: UnavailableItem[];
}

export interface UnavailableItem {
  productId: string;
  productTitle: string;
  requestedQty: number;
  availableQty: number;
}

export interface PreflightResponse {
  available: CartItemDocument[];
  unavailable: UnavailableItem[];
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
  excludedProductIds?: string[];
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
  excludedProductIds?: string[];
}

interface UseCheckoutOptions {
  onPlaceCodOrderSuccess?: (result: PlaceOrderResponse) => void;
  onPlaceCodOrderError?: () => void;
}

/**
 * useCheckout
 * Bundles address + cart queries, COD place-order mutation, preflight mutation,
 * and Razorpay payment mutations — all wrapped so components never import
 * services directly.
 */
export function useCheckout(options?: UseCheckoutOptions) {
  const queryClient = useQueryClient();

  const { addressQuery, cartQuery } = useCheckoutReadQueries<
    AddressDocument,
    CartApiResponse
  >({
    addressesEndpoint: API_ENDPOINTS.ADDRESSES.LIST,
    cartEndpoint: API_ENDPOINTS.CART.GET,
    addressesQueryKey: ["addresses"],
    cartQueryKey: ["cart"],
  });

  const preflightMutation = useMutation<PreflightResponse, Error, string>({
    mutationFn: (addressId) =>
      apiClient.post(API_ENDPOINTS.CHECKOUT.PREFLIGHT, { addressId }),
  });

  const placeCodOrderMutation = useMutation<
    PlaceOrderResponse,
    Error,
    PlaceOrderPayload
  >({
    mutationFn: (data) =>
      apiClient.post(API_ENDPOINTS.CHECKOUT.PLACE_ORDER, data),
    onSuccess: async (result) => {
      // Clear stale cart and orders cache after a successful order
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      options?.onPlaceCodOrderSuccess?.(result);
    },
    onError: options?.onPlaceCodOrderError,
  });

  // Razorpay mutations — must stay client-side (browser Razorpay SDK)
  const createPaymentOrderMutation = useMutation<
    CreateRazorpayOrderResponse,
    Error,
    CreateRazorpayOrderPayload
  >({
    mutationFn: (data) =>
      apiClient.post(API_ENDPOINTS.PAYMENT.CREATE_ORDER, data),
  });

  const verifyPaymentMutation = useMutation<
    PlaceOrderResponse,
    Error,
    VerifyPaymentPayload
  >({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.PAYMENT.VERIFY, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    addressQuery,
    cartQuery,
    preflightMutation,
    placeCodOrderMutation,
    createPaymentOrderMutation,
    verifyPaymentMutation,
  };
}
