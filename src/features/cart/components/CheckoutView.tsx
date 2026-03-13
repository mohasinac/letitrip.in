/**
 * CheckoutView
 *
 * Extracted from src/app/[locale]/checkout/page.tsx
 * Two-step checkout: address selection â†’ order review â†’ payment
 * (COD, Razorpay online, or manual UPI via WhatsApp confirmation).
 *
 * Added flows:
 * - Third-party consent OTP: if the shipping address belongs to someone else
 *   the buyer must verify via email before advancing to step 2.
 * - Preflight stock check: before placing the order, a non-mutating preflight
 *   call detects out-of-stock items.  The PartialOrderDialog lets the buyer
 *   skip unavailable items and continue with the rest.
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
import { ConsentOtpModal } from "./ConsentOtpModal";
import { PartialOrderDialog } from "./PartialOrderDialog";
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
import type { UnavailableItem } from "@/hooks";

const { themed, page, spacing } = THEME_CONSTANTS;

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

  // ── Core checkout state ───────────────────────────────────────────────────
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

  // ── Third-party consent state ─────────────────────────────────────────────
  const [consentVerifiedAddressIds, setConsentVerifiedAddressIds] = useState<
    Set<string>
  >(new Set());
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentModalData, setConsentModalData] = useState<{
    addressId: string;
    recipientName: string;
  } | null>(null);

  // ── Partial order state ───────────────────────────────────────────────────
  const [excludedProductIds, setExcludedProductIds] = useState<string[]>([]);
  const [showPartialDialog, setShowPartialDialog] = useState(false);
  const [partialDialogState, setPartialDialogState] = useState<{
    unavailableItems: UnavailableItem[];
    availableCount: number;
    placedOrderId?: string;
  } | null>(null);
  // Callback to invoke after the buyer confirms the partial-order preflight dialog
  const [pendingOrderExec, setPendingOrderExec] = useState<(() => void) | null>(
    null,
  );

  const {
    addressQuery: { data: addrData, isLoading: addrLoading },
    cartQuery: { data: cartData, isLoading: cartLoading },
    placeCodOrderMutation: { mutate: placeCodOrder },
    createPaymentOrderMutation: { mutateAsync: createPaymentOrder },
    verifyPaymentMutation: { mutateAsync: verifyPayment },
    preflightMutation: { mutateAsync: runPreflight },
  } = useCheckout({
    onPlaceCodOrderSuccess: (result) => {
      const primaryOrderId = result?.orderIds?.[0] ?? "";

      // If some items were unavailable at transaction time, show info dialog first
      if (result.unavailableItems && result.unavailableItems.length > 0) {
        setPartialDialogState({
          unavailableItems: result.unavailableItems,
          availableCount: result.itemCount ?? 0,
          placedOrderId: primaryOrderId,
        });
        setShowPartialDialog(true);
        return; // nav happens when buyer dismisses the dialog
      }

      if (paymentMethod === "upi_manual" && whatsappNumber) {
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

  const codDepositPercent =
    siteSettingsData?.commissions?.codDepositPercent ?? 10;
  const depositAmount =
    paymentMethod === "cod" || paymentMethod === "upi_manual"
      ? Math.round(subtotal * (codDepositPercent / 100) * 100) / 100
      : undefined;

  if (items.length === 0) {
    router.replace(ROUTES.USER.CART);
    return null;
  }

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? null;

  // ── Consent helpers ───────────────────────────────────────────────────────

  const handleConsentRequired = (addressId: string, recipientName: string) => {
    setConsentModalData({ addressId, recipientName });
    setShowConsentModal(true);
  };

  const handleConsentVerified = useCallback(() => {
    setShowConsentModal(false);
    if (consentModalData) {
      setConsentVerifiedAddressIds(
        (prev) => new Set([...prev, consentModalData.addressId]),
      );
    }
  }, [consentModalData]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (!selectedAddressId) {
      showError(ERROR_MESSAGES.CHECKOUT.ADDRESS_REQUIRED);
      return;
    }

    // Block step 2 if the selected address requires consent and it hasn't been verified
    const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
    if (selectedAddr) {
      const nameMatches =
        (selectedAddr.fullName ?? "").toLowerCase().trim() ===
        (user?.displayName ?? "").toLowerCase().trim();
      const requiresConsent = !nameMatches && !!user?.displayName;
      if (
        requiresConsent &&
        !consentVerifiedAddressIds.has(selectedAddressId)
      ) {
        handleConsentRequired(selectedAddressId, selectedAddr.fullName);
        return;
      }
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Order execution ───────────────────────────────────────────────────────

  const executeOrder = useCallback(
    async (excluded: string[] = []) => {
      if (!selectedAddressId) return;

      if (paymentMethod === "cod" || paymentMethod === "upi_manual") {
        placeCodOrder({
          addressId: selectedAddressId,
          paymentMethod,
          notes: sellerNotes || undefined,
          excludedProductIds: excluded.length > 0 ? excluded : undefined,
        });
      } else {
        try {
          const rzpOrder = (await createPaymentOrder({
            amount: subtotal,
            currency: "INR",
          })) as CreateRazorpayOrderResponse;

          if (rzpOrder.platformFee) setPlatformFee(rzpOrder.platformFee);

          const paymentResult = await openRazorpay({
            key: rzpOrder.keyId,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            order_id: rzpOrder.razorpayOrderId,
            name: "LetItRip",
            description: `Order of ${itemCount} item${itemCount !== 1 ? "s" : ""}`,
            theme: { color: "#6366f1" },
            handler: () => {},
          });

          const verifyResult = (await verifyPayment({
            razorpay_order_id: paymentResult.razorpay_order_id,
            razorpay_payment_id: paymentResult.razorpay_payment_id,
            razorpay_signature: paymentResult.razorpay_signature,
            addressId: selectedAddressId,
            notes: sellerNotes || undefined,
            excludedProductIds: excluded.length > 0 ? excluded : undefined,
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
    },
    [
      selectedAddressId,
      paymentMethod,
      placeCodOrder,
      createPaymentOrder,
      openRazorpay,
      verifyPayment,
      subtotal,
      itemCount,
      sellerNotes,
      router,
      showError,
    ],
  );

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showError(ERROR_MESSAGES.CHECKOUT.ADDRESS_REQUIRED);
      return;
    }

    setIsPlacingOrder(true);

    // ── Preflight stock check ──────────────────────────────────────────────
    try {
      const preflight = await runPreflight(selectedAddressId);
      if (preflight.unavailable.length > 0) {
        const unavailableProductIds = preflight.unavailable.map(
          (i) => i.productId,
        );
        setPartialDialogState({
          unavailableItems: preflight.unavailable,
          availableCount: preflight.available.length,
        });
        setShowPartialDialog(true);

        if (preflight.available.length === 0) {
          // Nothing to order — just show the dialog; stop here
          setIsPlacingOrder(false);
          return;
        }

        // Store the ids to exclude and a callback so the dialog can proceed
        setExcludedProductIds(unavailableProductIds);
        setPendingOrderExec(() => () => {
          setShowPartialDialog(false);
          setShowOtpModal(true);
        });
        return; // wait for buyer to confirm partial dialog
      }
    } catch {
      // Preflight is advisory — if it fails, proceed to OTP (server transaction will re-check)
    }

    setShowOtpModal(true);
  };

  const handleOtpVerified = useCallback(() => {
    setShowOtpModal(false);
    executeOrder(excludedProductIds);
  }, [executeOrder, excludedProductIds]);

  const handleOtpClose = useCallback(() => {
    setShowOtpModal(false);
    setIsPlacingOrder(false);
  }, []);

  // ── Partial dialog actions ────────────────────────────────────────────────

  const handlePartialContinue = () => {
    if (partialDialogState?.placedOrderId) {
      // Post-placement info mode — navigate to success
      const id = partialDialogState.placedOrderId;
      setShowPartialDialog(false);
      if (paymentMethod === "upi_manual" && whatsappNumber) {
        const total = cartData?.subtotal ?? 0;
        const msg = encodeURIComponent(
          `Hi! I've placed Order #${id} on LetItRip and paid via UPI. Please confirm. Thank you!`,
        );
        window.open(
          `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${msg}`,
          "_blank",
        );
      }
      router.push(`${ROUTES.USER.CHECKOUT_SUCCESS}?orderId=${id}`);
    } else if (pendingOrderExec) {
      // Pre-placement: buyer confirmed to skip unavailable items
      pendingOrderExec();
      setPendingOrderExec(null);
    }
  };

  const handlePartialViewCart = () => {
    setShowPartialDialog(false);
    setIsPlacingOrder(false);
    router.push(ROUTES.USER.CART);
  };

  return (
    <Main className={`${page.container.lg} py-8`}>
      {/* Phone OTP modal (identity verification before payment) */}
      <CheckoutOtpModal
        isOpen={showOtpModal}
        phoneNumber={user?.phoneNumber ?? null}
        onVerified={handleOtpVerified}
        onClose={handleOtpClose}
      />

      {/* Email consent OTP modal (third-party shipping address) */}
      <ConsentOtpModal
        isOpen={showConsentModal}
        addressId={consentModalData?.addressId ?? ""}
        recipientName={consentModalData?.recipientName ?? ""}
        onVerified={handleConsentVerified}
        onClose={() => setShowConsentModal(false)}
      />

      {/* Partial order dialog (preflight or post-placement) */}
      <PartialOrderDialog
        isOpen={showPartialDialog}
        unavailableItems={partialDialogState?.unavailableItems ?? []}
        availableCount={partialDialogState?.availableCount ?? 0}
        placedOrderId={partialDialogState?.placedOrderId}
        onContinue={handlePartialContinue}
        onViewCart={handlePartialViewCart}
        onClose={() => {
          setShowPartialDialog(false);
          setIsPlacingOrder(false);
        }}
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
                currentUserDisplayName={user?.displayName}
                onConsentRequired={handleConsentRequired}
                consentVerifiedAddressIds={consentVerifiedAddressIds}
              />
              {/* Next button */}
              <div className="mt-6 flex justify-between items-center">
                <Button
                  onClick={() => router.push(ROUTES.USER.CART)}
                  className={`text-sm font-medium ${themed.textSecondary} hover:text-indigo-600 transition-colors`}
                >
                  â† {t("backToCart")}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!selectedAddressId}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                >
                  {t("stepReview")} â†’
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
                  â† {t("stepAddress")}
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
