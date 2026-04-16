/**
 * CheckoutView
 *
 * Extracted from src/app/[locale]/checkout/page.tsx
 * Two-step checkout: address selection ? order review ? payment
 * (COD, Razorpay online, or manual UPI via WhatsApp confirmation).
 *
 * Added flows:
 * - Unified OTP verification: buyer verifies identity via SMS (own phone) or
 *   email (third-party / no-phone fallback) when placing the order.
 * - Preflight stock check: before placing the order, a non-mutating preflight
 *   call detects out-of-stock items.  The PartialOrderDialog lets the buyer
 *   skip unavailable items and continue with the rest.
 */
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { StepperNav, Button } from "@mohasinac/appkit/ui";
import { CheckoutView as AppkitCheckoutView } from "@mohasinac/appkit/features/cart";
import { CheckoutAddressStep } from "./CheckoutAddressStep";
import { CheckoutOrderReview } from "./CheckoutOrderReview";
import type { CheckoutPaymentMethod } from "./CheckoutOrderReview";
import { OrderSummaryPanel } from "./OrderSummaryPanel";
import { CheckoutVerifyModal } from "./CheckoutVerifyModal";
import { PartialOrderDialog } from "./PartialOrderDialog";
import {
  useCheckout, useMessage, useRazorpay, useSiteSettings, useAuth, useAddressSelector, } from "@/hooks";
import { ROUTES, THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { Heading, Main } from "@mohasinac/appkit/ui";
import { SideDrawer, AddressForm } from "@/components";
import { formatCurrency } from "@mohasinac/appkit/utils";


"use client";

import type { SiteSettingsDocument } from "@/db/schema";
import type { UnavailableItem } from "@/hooks";

const { themed, page, spacing } = THEME_CONSTANTS;

// --- Types --------------------------------------------------------------------

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

// --- Skeleton -----------------------------------------------------------------

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

// --- View ---------------------------------------------------------------------

export function CheckoutView() {
  const router = useRouter();
  const { showError } = useMessage();
  const { openRazorpay } = useRazorpay();
  const t = useTranslations("checkout");

  // Site settings � read UPI VPA for manual UPI payment option
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

  // -- Core checkout state ---------------------------------------------------
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("cod");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [sellerNotes, setSellerNotes] = useState("");
  const [platformFee, setPlatformFee] = useState(0);
  const [addAddressOpen, setAddAddressOpen] = useState(false);

  // -- Partial order state ---------------------------------------------------
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

  // -- Inline add-address (avoids navigating away from checkout) ------------
  const queryClient = useQueryClient();
  const { createAddress: createNewAddress, isSaving: isSavingAddress } =
    useAddressSelector({
      onCreated: (id) => {
        setAddAddressOpen(false);
        setSelectedAddressId(id);
        // Refresh the checkout address list
        queryClient.invalidateQueries({ queryKey: ["addresses"] });
      },
    });

  // Derive values needed by hooks (must be above useCallback)
  const addresses = addrData ?? [];
  const items = cartData?.cart?.items ?? [];
  const subtotal = cartData?.subtotal ?? 0;
  const itemCount = cartData?.itemCount ?? 0;

  // -- Order execution -------------------------------------------------------

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

  const handleVerified = useCallback(() => {
    setShowVerifyModal(false);
    executeOrder(excludedProductIds);
  }, [executeOrder, excludedProductIds]);

  const handleVerifyClose = useCallback(() => {
    setShowVerifyModal(false);
    setIsPlacingOrder(false);
  }, []);

  // -- Early returns (after all hooks) ---------------------------------------

  if (addrLoading || cartLoading) return <CheckoutSkeleton />;

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

  // -- Navigation ------------------------------------------------------------

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

    // -- Preflight stock check ----------------------------------------------
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
          setIsPlacingOrder(false);
          return;
        }

        setExcludedProductIds(unavailableProductIds);
        setPendingOrderExec(() => () => {
          setShowPartialDialog(false);
          setShowVerifyModal(true);
        });
        return;
      }
    } catch {
      // Preflight is advisory � proceed to OTP if it fails
    }

    setShowVerifyModal(true);
  };

  // -- Partial dialog actions ------------------------------------------------

  const handlePartialContinue = () => {
    if (partialDialogState?.placedOrderId) {
      // Post-placement info mode � navigate to success
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
      {/* Unified checkout verification OTP modal (identity + consent) */}
      {selectedAddress && (
        <CheckoutVerifyModal
          isOpen={showVerifyModal}
          addressId={selectedAddress.id}
          addressPhone={selectedAddress.phone}
          buyerPhone={user?.phoneNumber ?? null}
          recipientName={selectedAddress.fullName}
          onVerified={handleVerified}
          onClose={handleVerifyClose}
        />
      )}

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

      {/* Inline add-address drawer */}
      <SideDrawer
        isOpen={addAddressOpen}
        onClose={() => setAddAddressOpen(false)}
        title={t("addNewAddress")}
        mode="create"
      >
        <AddressForm
          onSubmit={(data) => createNewAddress(data)}
          onCancel={() => setAddAddressOpen(false)}
          isLoading={isSavingAddress}
        />
      </SideDrawer>

      {/* Heading */}
      <Heading level={1} className="mb-6">
        {t("title")}
      </Heading>

      {/* Stepper */}
      <StepperNav steps={STEPS} currentStep={step} />

      <AppkitCheckoutView
        activeStep={step}
        onStepChange={(nextStep) => setStep(nextStep as 1 | 2)}
        totalSteps={2}
        className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start xl:grid-cols-3 2xl:grid-cols-3"
        renderStep={(currentStep) => (
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div>
                <CheckoutAddressStep
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  onSelect={setSelectedAddressId}
                  onAddNew={() => setAddAddressOpen(true)}
                  currentUserDisplayName={user?.displayName}
                />
                <div className="mt-6 flex justify-between items-center">
                  <Button
                    onClick={() => router.push(ROUTES.USER.CART)}
                    className={`text-sm font-medium ${themed.textSecondary} hover:text-primary transition-colors`}
                  >
                    ? {t("backToCart")}
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!selectedAddressId}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                  >
                    {t("stepReview")} ?
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && selectedAddress && (
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
                <div className="mt-6 flex justify-between items-center">
                  <Button
                    onClick={() => setStep(1)}
                    className={`text-sm font-medium ${themed.textSecondary} hover:text-primary transition-colors`}
                  >
                    ? {t("stepAddress")}
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
        )}
        renderOrderSummary={() => (
          <div className="mt-8 lg:mt-0">
            <OrderSummaryPanel itemCount={itemCount} subtotal={subtotal} />
          </div>
        )}
      />
    </Main>
  );
}

