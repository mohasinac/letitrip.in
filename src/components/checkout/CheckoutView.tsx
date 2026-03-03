/**
 * CheckoutView
 *
 * Extracted from src/app/[locale]/checkout/page.tsx
 * Two-step checkout: address selection → order review → payment (COD or Razorpay).
 */

"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { CheckoutStepper } from "./CheckoutStepper";
import { CheckoutAddressStep } from "./CheckoutAddressStep";
import { CheckoutOrderReview } from "./CheckoutOrderReview";
import { OrderSummaryPanel } from "./OrderSummaryPanel";
import { useCheckout, useMessage, useRazorpay } from "@/hooks";
import { ROUTES, THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { Button, Heading, Main } from "@/components";

const { themed, typography, page } = THEME_CONSTANTS;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlaceOrderResponse {
  orderIds: string[];
  total: number;
  itemCount: number;
}

interface CreateRazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
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

// ─── View ─────────────────────────────────────────────────────────────────────

export function CheckoutView() {
  const router = useRouter();
  const { showError } = useMessage();
  const { openRazorpay } = useRazorpay();
  const t = useTranslations("checkout");

  const STEPS = [
    { number: 1, label: t("stepAddress") },
    { number: 2, label: t("stepReview") },
  ];

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const {
    addressQuery: { data: addrData, isLoading: addrLoading },
    cartQuery: { data: cartData, isLoading: cartLoading },
    placeCodOrderMutation: { mutate: placeCodOrder },
    createPaymentOrder,
    verifyPayment,
  } = useCheckout({
    onPlaceCodOrderSuccess: (result) => {
      const primaryOrderId = result?.orderIds?.[0] ?? "";
      router.push(`${ROUTES.USER.CHECKOUT_SUCCESS}?orderId=${primaryOrderId}`);
    },
    onPlaceCodOrderError: () => {
      showError(ERROR_MESSAGES.CHECKOUT.FAILED);
      setIsPlacingOrder(false);
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

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showError(ERROR_MESSAGES.CHECKOUT.ADDRESS_REQUIRED);
      return;
    }

    setIsPlacingOrder(true);

    if (paymentMethod === "cod") {
      // COD: directly create orders via /api/checkout
      placeCodOrder({ addressId: selectedAddressId, paymentMethod: "cod" });
    } else {
      // Online: Razorpay flow
      try {
        // 1. Create Razorpay order on backend
        const rzpOrder = (await createPaymentOrder({
          amount: subtotal,
          currency: "INR",
        })) as CreateRazorpayOrderResponse;

        // 2. Open Razorpay checkout modal
        const paymentResult = await openRazorpay({
          key: rzpOrder.keyId,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          order_id: rzpOrder.razorpayOrderId,
          name: "LetItRip",
          description: `Order of ${itemCount} item${itemCount !== 1 ? "s" : ""}`,
          theme: { color: "#6366f1" },
          handler: () => {}, // handled via Promise resolve in hook
        });

        // 3. Verify payment & create orders
        const verifyResult = (await verifyPayment({
          razorpay_order_id: paymentResult.razorpay_order_id,
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_signature: paymentResult.razorpay_signature,
          addressId: selectedAddressId,
        })) as PlaceOrderResponse;

        const primaryOrderId = verifyResult?.orderIds?.[0] ?? "";
        router.push(
          `${ROUTES.USER.CHECKOUT_SUCCESS}?orderId=${primaryOrderId}`,
        );
      } catch (err: unknown) {
        const msg =
          err instanceof Error && err.message === "Payment cancelled by user"
            ? undefined
            : ERROR_MESSAGES.CHECKOUT.PAYMENT_FAILED;
        if (msg) showError(msg);
        setIsPlacingOrder(false);
      }
    }
  };

  return (
    <Main className={`${page.container.lg} py-8`}>
      {/* Heading */}
      <Heading level={1} className="mb-6">
        {t("title")}
      </Heading>

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
                <Button
                  onClick={() => router.push(ROUTES.USER.CART)}
                  className={`text-sm font-medium ${themed.textSecondary} hover:text-indigo-600 transition-colors`}
                >
                  ← {t("backToCart")}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!selectedAddressId}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                >
                  {t("stepReview")} →
                </Button>
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
                <Button
                  onClick={() => setStep(1)}
                  className={`text-sm font-medium ${themed.textSecondary} hover:text-indigo-600 transition-colors`}
                >
                  ← {t("stepAddress")}
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                >
                  {isPlacingOrder ? t("placingOrder") : t("placeOrder")}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="mt-8 lg:mt-0">
          <OrderSummaryPanel itemCount={itemCount} subtotal={subtotal} />
        </div>
      </div>
    </Main>
  );
}
