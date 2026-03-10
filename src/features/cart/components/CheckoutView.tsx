/**
 * CheckoutView
 *
 * Extracted from src/app/[locale]/checkout/page.tsx
 * Two-step checkout: address selection → order review → payment
 * (COD, Razorpay online, or manual UPI via WhatsApp confirmation).
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { StepperNav } from "@/components";
import { CheckoutAddressStep } from "./CheckoutAddressStep";
import { CheckoutOrderReview } from "./CheckoutOrderReview";
import type { CheckoutPaymentMethod } from "./CheckoutOrderReview";
import { OrderSummaryPanel } from "./OrderSummaryPanel";
import { CheckoutOtpModal } from "./CheckoutOtpModal";
import {
  useCheckout,
  useMessage,
  useRazorpay,
  useSiteSettings,
  useAuth,
} from "@/hooks";
import { ROUTES, THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { Button, Heading, Main } from "@/components";
import { formatCurrency } from "@/utils";
import type { SiteSettingsDocument } from "@/db/schema";

const { themed, typography, page, spacing } = THEME_CONSTANTS;

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
  platformFee?: number;
  baseAmount?: number;
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
      <div className="lg:grid lg:grid-cols-3 lg:gap-8 xl:grid-cols-3 2xl:grid-cols-3">
        <div className={`lg:col-span-2 ${spacing.stack}`}>
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

  // Site settings — read UPI VPA for manual UPI payment option
  const { data: siteSettingsData } = useSiteSettings<{
    contact?: SiteSettingsDocument["contact"];
    payment?: SiteSettingsDocument["payment"];
    commissions?: SiteSettingsDocument["commissions"];
  }>();
  const upiVpa = siteSettingsData?.contact?.upiVpa;
  const whatsappNumber = siteSettingsData?.contact?.whatsappNumber;

  const STEPS = [
    { number: 1, label: t("stepAddress") },
    { number: 2, label: t("stepReview") },
  ];

  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("cod");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [sellerNotes, setSellerNotes] = useState("");
  const [platformFee, setPlatformFee] = useState(0);

  const {
    addressQuery: { data: addrData, isLoading: addrLoading },
    cartQuery: { data: cartData, isLoading: cartLoading },
    placeCodOrderMutation: { mutate: placeCodOrder },
    createPaymentOrderMutation: { mutateAsync: createPaymentOrder },
    verifyPaymentMutation: { mutateAsync: verifyPayment },
  } = useCheckout({
    onPlaceCodOrderSuccess: (result) => {
      const primaryOrderId = result?.orderIds?.[0] ?? "";
      if (paymentMethod === "upi_manual" && whatsappNumber) {
        // Open WhatsApp with pre-filled payment confirmation message
        const msg = encodeURIComponent(
          `Hi! I've placed Order #${primaryOrderId} on LetItRip and paid ` +
            `${formatCurrency(result.total)} via UPI to ${upiVpa ?? "our UPI ID"}. ` +
            `Please confirm my payment. Thank you!`,
        );
        window.open(
          `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${msg}`,
          "_blank",
        );
      }
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

  // Deposit amount for COD/UPI payments — 10% by default, configurable via site settings.
  const codDepositPercent =
    siteSettingsData?.commissions?.codDepositPercent ?? 10;
  const depositAmount =
    paymentMethod === "cod" || paymentMethod === "upi_manual"
      ? Math.round(subtotal * (codDepositPercent / 100) * 100) / 100
      : undefined;

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

  /** Executes the actual order placement — called after OTP is verified. */
  const executeOrder = useCallback(async () => {
    if (!selectedAddressId) return;

    if (paymentMethod === "cod") {
      placeCodOrder({
        addressId: selectedAddressId,
        paymentMethod: "cod",
        notes: sellerNotes || undefined,
      });
    } else if (paymentMethod === "upi_manual") {
      placeCodOrder({
        addressId: selectedAddressId,
        paymentMethod: "upi_manual",
        notes: sellerNotes || undefined,
      });
      // WhatsApp redirect is handled in onPlaceCodOrderSuccess
    } else {
      // Online: Razorpay flow
      try {
        const rzpOrder = (await createPaymentOrder({
          amount: subtotal,
          currency: "INR",
        })) as CreateRazorpayOrderResponse;

        // Capture the platform fee returned by the server for display
        if (rzpOrder.platformFee) setPlatformFee(rzpOrder.platformFee);

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

        const verifyResult = (await verifyPayment({
          razorpay_order_id: paymentResult.razorpay_order_id,
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_signature: paymentResult.razorpay_signature,
          addressId: selectedAddressId,
          notes: sellerNotes || undefined,
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
  }, [
    selectedAddressId,
    paymentMethod,
    placeCodOrder,
    createPaymentOrder,
    openRazorpay,
    verifyPayment,
    subtotal,
    itemCount,
    sellerNotes,
    setPlatformFee,
    router,
    showError,
  ]);

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      showError(ERROR_MESSAGES.CHECKOUT.ADDRESS_REQUIRED);
      return;
    }
    setIsPlacingOrder(true);
    setShowOtpModal(true);
  };

  const handleOtpVerified = useCallback(() => {
    setShowOtpModal(false);
    executeOrder();
  }, [executeOrder]);

  const handleOtpClose = useCallback(() => {
    setShowOtpModal(false);
    setIsPlacingOrder(false);
  }, []);

  return (
    <Main className={`${page.container.lg} py-8`}>
      <CheckoutOtpModal
        isOpen={showOtpModal}
        phoneNumber={user?.phoneNumber ?? null}
        onVerified={handleOtpVerified}
        onClose={handleOtpClose}
      />
      {/* Heading */}
      <Heading level={1} className="mb-6">
        {t("title")}
      </Heading>

      {/* Stepper */}
      <StepperNav steps={STEPS} currentStep={step} />

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start xl:grid-cols-3 2xl:grid-cols-3">
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
                upiVpa={upiVpa}
                platformFee={platformFee}
                depositAmount={depositAmount}
                notes={sellerNotes}
                onNotesChange={setSellerNotes}
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
                  {isPlacingOrder
                    ? t("placingOrder")
                    : paymentMethod === "upi_manual"
                      ? t("placeAndWhatsapp")
                      : t("placeOrder")}
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
