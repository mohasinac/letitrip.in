"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AddressDocument, CartDocument } from "@/db/schema";
import {
  CheckoutStepper,
  CheckoutAddressStep,
  CheckoutOrderReview,
  OrderSummaryPanel,
} from "@/components";
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  API_ENDPOINTS,
  ROUTES,
  UI_LABELS,
  THEME_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/constants";

const { themed, spacing, typography } = THEME_CONSTANTS;

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddressListResponse {
  data: AddressDocument[];
}

interface CartApiResponse {
  cart: CartDocument;
  itemCount: number;
  subtotal: number;
}

interface PlaceOrderResponse {
  orderIds: string[];
  total: number;
  itemCount: number;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CheckoutSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div
        className={`h-8 w-64 rounded-lg mb-8 ${THEME_CONSTANTS.themed.bgSecondary}`}
      />
      <div
        className={`h-6 w-full rounded-lg mb-8 ${THEME_CONSTANTS.themed.bgSecondary}`}
      />
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-24 rounded-xl ${THEME_CONSTANTS.themed.bgSecondary}`}
            />
          ))}
        </div>
        <div
          className={`mt-8 lg:mt-0 h-48 rounded-xl ${THEME_CONSTANTS.themed.bgSecondary}`}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: UI_LABELS.CHECKOUT.STEP_ADDRESS },
  { number: 2, label: UI_LABELS.CHECKOUT.STEP_REVIEW },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { showError } = useMessage();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  // Fetch addresses
  const { data: addrData, isLoading: addrLoading } =
    useApiQuery<AddressListResponse>({
      queryKey: ["addresses"],
      queryFn: () => apiClient.get(API_ENDPOINTS.ADDRESSES.LIST),
    });

  // Fetch cart
  const { data: cartData, isLoading: cartLoading } =
    useApiQuery<CartApiResponse>({
      queryKey: ["cart"],
      queryFn: () => apiClient.get(API_ENDPOINTS.CART.GET),
    });

  // Place order mutation
  const { mutate: placeOrder, isLoading: isPlacingOrder } = useApiMutation<
    PlaceOrderResponse,
    { addressId: string; paymentMethod: "cod" | "online" }
  >({
    mutationFn: (data) =>
      apiClient.post(API_ENDPOINTS.CHECKOUT.PLACE_ORDER, data),
    onSuccess: (result) => {
      const primaryOrderId = result?.orderIds?.[0] ?? "";
      router.push(`${ROUTES.USER.CHECKOUT_SUCCESS}?orderId=${primaryOrderId}`);
    },
    onError: () => {
      showError(ERROR_MESSAGES.CHECKOUT.FAILED);
    },
  });

  if (addrLoading || cartLoading) return <CheckoutSkeleton />;

  const addresses = addrData?.data ?? [];
  const items = cartData?.cart?.items ?? [];
  const subtotal = cartData?.subtotal ?? 0;
  const itemCount = cartData?.itemCount ?? 0;

  // Redirect to cart if it's empty
  if (items.length === 0) {
    router.replace(ROUTES.USER.CART);
    return null;
  }

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? null;

  const handleNext = () => {
    if (!selectedAddressId) {
      showError(ERROR_MESSAGES.CHECKOUT.ADDRESS_REQUIRED);
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      showError(ERROR_MESSAGES.CHECKOUT.ADDRESS_REQUIRED);
      return;
    }
    placeOrder({ addressId: selectedAddressId, paymentMethod });
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Heading */}
      <h1 className={`${typography.h2} ${themed.textPrimary} mb-6`}>
        {UI_LABELS.CHECKOUT.TITLE}
      </h1>

      {/* Stepper */}
      <CheckoutStepper steps={STEPS} currentStep={step} />

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
        {/* Main content */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div>
              <CheckoutAddressStep
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelect={setSelectedAddressId}
              />
              {/* Next button */}
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => router.push(ROUTES.USER.CART)}
                  className={`text-sm font-medium ${themed.textSecondary} hover:text-indigo-600 transition-colors`}
                >
                  ← {UI_LABELS.CHECKOUT.BACK_TO_CART}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedAddressId}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                >
                  {UI_LABELS.CHECKOUT.STEP_REVIEW} →
                </button>
              </div>
            </div>
          )}

          {step === 2 && selectedAddress && (
            <div>
              <CheckoutOrderReview
                items={items}
                address={selectedAddress}
                subtotal={subtotal}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                onChangeAddress={() => setStep(1)}
              />
              {/* Place order button */}
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className={`text-sm font-medium ${themed.textSecondary} hover:text-indigo-600 transition-colors`}
                >
                  ← {UI_LABELS.CHECKOUT.STEP_ADDRESS}
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                >
                  {isPlacingOrder
                    ? UI_LABELS.CHECKOUT.PLACING_ORDER
                    : UI_LABELS.CHECKOUT.PLACE_ORDER}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="mt-8 lg:mt-0">
          <OrderSummaryPanel itemCount={itemCount} subtotal={subtotal} />
        </div>
      </div>
    </main>
  );
}
