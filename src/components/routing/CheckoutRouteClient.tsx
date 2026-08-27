"use client";
import { normalizeError, checkEmiEligibility, computeBuyerEmiQuote, computeCodHandlingFee, useSiteSettings, CouponHelpDetails } from "@mohasinac/appkit/client";
import type { JsonValue, BuyerEmiSettings, BuyerFacingFees, OutOfStockPolicy, StoreAddonsValue, PricedCartLine, CartPriceBreakdownStore } from "@mohasinac/appkit/client";
import { StoreAddonsPicker, CartPriceBreakdown, hasAnyStoreAddon, clientLineTotal } from "@mohasinac/appkit/client";
import { Banknote } from "lucide-react";

import { useCallback, useState, useEffect, useMemo } from "react";
import {
  Alert,
  CART_LANE,
  CART_LANE_LABELS,
  activeLane,
  isLockedLane,
  laneItems,
  type LaneAssignable,
} from "@mohasinac/appkit/client";
import {
  AddressForm,
  Button,
  CheckoutAddressStep,
  CheckoutView,
  Div,
  FieldCheckbox,
  FieldSelect,
  Heading,
  Input,
  Row,
  SideDrawer,
  Span,
  Stack,
  Text,
  TextLink,
  useAddresses,
  useAuth,
  useAuthGate,
  useBottomActions,
  useCartQuery,
  useCreateAddress,
  useToast,
  ROUTES,
  ACTION_ID,
} from "@mohasinac/appkit/client";
import type { Address, AddressFormData } from "@mohasinac/appkit/client";
import { ACTIONS } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  sendCheckoutValueOtpAction,
  verifyCheckoutValueOtpAction,
} from "@/actions/checkout.actions";
import { API_ROUTES, UI_LABELS, PAYMENT_ICONS, CashIcon, RazorpayIcon } from "@/constants";
// Deep import (not the @/components barrel): CheckoutRouteClient is itself
// re-exported from that barrel, so importing it back would be circular.
import { BrandBadgeImage } from "@/components/layout/BrandBadgeImage";
import {
  createCheckoutOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  type CheckoutPricingPreview,
} from "@/lib/api/payment-client";
import { usePricingPreview, type PricingPreviewStatus } from "@/lib/hooks/usePricingPreview";
import { applyCartCoupon, removeCartCoupon, persistCartAddons } from "@/lib/api/cart-client";
import { applyCheckoutBypass } from "@/lib/api/admin-client";

const __P = {
  p3: "p-[var(--appkit-space-3)]",
  p6: "p-[var(--appkit-space-6)]",
} as const;

const CK = UI_LABELS.CHECKOUT;

// --- Razorpay helpers --------------------------------------------------------

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as unknown as Record<string, JsonValue>).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function openRazorpayModal(opts: {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  name: string;
  prefill?: { email?: string; name?: string };
}): Promise<RazorpayResponse> {
  return new Promise((resolve, reject) => {
     
    const Rzp = (window as any).Razorpay;
    const rzp = new Rzp({
      key: opts.keyId,
      order_id: opts.razorpayOrderId,
      amount: opts.amount,
      currency: opts.currency,
      name: opts.name,
      prefill: opts.prefill ?? {},
      handler: (response: RazorpayResponse) => resolve(response),
    });
    rzp.on("payment.failed", (res: { error: { description: string } }) => {
      reject(new Error(res.error?.description ?? "Payment failed"));
    });
    rzp.open();
  });
}

// --- Types -------------------------------------------------------------------

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  couponId?: string;
  scope?: "admin" | "seller";
  sellerId?: string;
  applicableItemIds?: string[];
}

/**
 * One line of the server cart, as it arrives over the wire.
 *
 * Typed rather than left as `JsonArray`: this used to be cast
 * `as unknown as LaneAssignable[]` and then re-cast a second time to read
 * `price`/`quantity`, which meant the file had no type-level knowledge of the
 * cart at all — a renamed field would have compiled and silently priced
 * everything at zero. `PricedCartLine` is the exact set of fields the shared
 * pricing rule reads, so `clientLineTotal(line)` type-checks against it.
 */
interface CheckoutCartLine extends LaneAssignable, PricedCartLine {
  itemId?: string;
  productId: string;
  storeId?: string;
  storeName?: string;
}

interface ServerCartResponse {
  cart: {
    items: CheckoutCartLine[];
    appliedCoupons?: AppliedCoupon[];
    /** Per-store add-on selections — seeds the pickers so a cart choice persists here. */
    storeAddons?: Record<string, StoreAddonsValue>;
    /**
     * When non-empty, only these lines are being bought. `previewCheckoutPricing`
     * honours it, so anything derived here must too or the page quotes a
     * subtotal higher than the buyer will be charged.
     */
    selectedItemIds?: string[] | null;
  };
  subtotal: number;
  itemCount: number;
}

type CheckoutStep = "address" | "extras" | "value-otp" | "payment" | "processing";

/**
 * A seller this checkout will produce an order for, with everything the extras
 * step needs to render its card. `fees` is null until the pricing preview lands
 * — the card renders regardless, because the add-on checkboxes are the point
 * and they do not need a fee total to be usable.
 */
interface CheckoutAddonStore {
  storeId: string;
  storeName: string;
  subtotal: number;
  fees: CartPriceBreakdownStore | null;
}

// --- Shared class strings ----------------------------------------------------

const STEP_CARD_CLS = "rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] p-[var(--appkit-space-6)]";
const STEP_SUBLABEL_CLS = "text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)]";
const CLS_APPLIED_COUPON_ROW = "rounded-lg bg-success-surface border border-success px-[var(--appkit-space-3)] py-[var(--appkit-space-2)]";
const PRIMARY_BTN_CLS = "w-full rounded-lg bg-[var(--appkit-color-primary)] px-[var(--appkit-space-4)] py-[var(--appkit-space-3)] text-[length:var(--appkit-text-sm)] font-semibold text-white hover:opacity-90 disabled:opacity-50";

/** EMI amounts from computeBuyerEmiQuote are decimal rupees — format as INR. */
function formatEmiRupees(amount: number): string {
  return amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

const ORDER_PLACEMENT_FAILED_MSG = "Order placement failed";
const ORDER_FAILED_RETRY_MSG = "Order failed. Please retry.";

interface UnavailableCheckoutItem {
  productId: string;
  productTitle: string;
  requestedQty: number;
  availableQty: number;
}

/** Toast copy for items dropped by the "skip_items" out-of-stock policy. */
function unavailableItemsToastMsg(items: UnavailableCheckoutItem[]): string {
  return items.length === 1
    ? `"${items[0].productTitle}" became unavailable and was not included in your order.`
    : `${items.length} items became unavailable and were not included in your order.`;
}

/** Reads `data.unavailableItems` off a parsed checkout/verify response body, if present. */
function readUnavailableItems(payload: unknown): UnavailableCheckoutItem[] | undefined {
  const items = (payload as { data?: { unavailableItems?: UnavailableCheckoutItem[] } } | undefined)
    ?.data?.unavailableItems;
  return items && items.length > 0 ? items : undefined;
}

/** Encapsulates EMI tenure selection, eligibility, schedule preview, and order placement. */
function useEmiCheckout({
  emiSettings,
  showEmi,
  subtotal,
  cartIsEmpty,
  selectedAddress,
  outOfStockPolicy,
  router,
  showToast,
  setStep,
  setActionError,
  setIsProcessingPayment,
  ensureValueOtpGate,
}: {
  emiSettings: BuyerEmiSettings | null;
  showEmi: boolean;
  subtotal: number;
  cartIsEmpty: boolean;
  selectedAddress: Address | null;
  outOfStockPolicy: OutOfStockPolicy;
  router: ReturnType<typeof useRouter>;
  showToast: ReturnType<typeof useToast>["showToast"];
  setStep: (step: CheckoutStep) => void;
  setActionError: (msg: string) => void;
  setIsProcessingPayment: (v: boolean) => void;
  ensureValueOtpGate: (method: "razorpay" | "cash" | "emi") => boolean;
}) {
  const [emiTenure, setEmiTenure] = useState<number>(emiSettings?.tenureOptions?.[0] ?? 3);
  const emiEligible = useMemo(
    () => (emiSettings ? checkEmiEligibility(subtotal, true, emiSettings).eligible : false),
    [emiSettings, subtotal],
  );
  const emiVisible = showEmi && !!emiSettings && emiEligible && !cartIsEmpty;
  const emiSchedule = useMemo(
    () => (emiVisible && emiSettings ? computeBuyerEmiQuote(subtotal, emiTenure, emiSettings) : null),
    [emiVisible, emiSettings, subtotal, emiTenure],
  );

  const handlePlaceEmiOrder = useCallback(async () => {
    if (!selectedAddress) return;
    if (!ensureValueOtpGate("emi")) return;
    setIsProcessingPayment(true);
    setActionError("");
    setStep("processing");
    try {
      const res = await createCheckoutOrder({
        addressId: selectedAddress.id,
        paymentMethod: "emi",
        emiTenureMonths: emiTenure,
        outOfStockPolicy,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? ORDER_PLACEMENT_FAILED_MSG);
      }
      const emiData = await res.json().catch(() => ({}));
      const firstEmiOrderId = (emiData?.data?.orderIds as string[] | undefined)?.[0];
      const unavailableItems = readUnavailableItems(emiData);
      if (unavailableItems) {
        showToast(unavailableItemsToastMsg(unavailableItems), "info");
      }
      showToast("Order placed successfully! Your EMI schedule is confirmed.", "success");
      router.push(firstEmiOrderId ? `${String(ROUTES.USER.CHECKOUT_SUCCESS)}?orderId=${firstEmiOrderId}` : String(ROUTES.USER.CHECKOUT_SUCCESS));
    } catch (err) {
      void normalizeError(err);
      const msg = err instanceof Error ? err.message : ORDER_FAILED_RETRY_MSG;
      setActionError(msg);
      showToast(msg, "error");
      setStep("payment");
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedAddress, emiTenure, outOfStockPolicy, router, showToast, setStep, setActionError, setIsProcessingPayment, ensureValueOtpGate]);

  return { emiTenure, setEmiTenure, emiVisible, emiSchedule, handlePlaceEmiOrder };
}

// The debounced pricing-preview fetcher that used to live here now lives in
// `@/lib/hooks/usePricingPreview`, shared with the cart page. Two independent
// fetchers were free to drift into showing different totals for the same cart,
// and add-on selections are no longer request parameters at all — the server
// reads them per store off the cart document.

// --- Sub-renderers -----------------------------------------------------------

function renderAddressDrawer({
  addAddressDrawerOpen,
  setAddAddressDrawerOpen,
  handleAddressFormSubmit,
  isCreatingAddress,
}: {
  addAddressDrawerOpen: boolean;
  setAddAddressDrawerOpen: (v: boolean) => void;
  handleAddressFormSubmit: (data: AddressFormData) => void;
  isCreatingAddress: boolean;
}) {
  return (
    <SideDrawer
      isOpen={addAddressDrawerOpen}
      onClose={() => setAddAddressDrawerOpen(false)}
      title="Add new address"
      mode="create"
    >
      <AddressForm
        onSubmit={handleAddressFormSubmit}
        onCancel={() => setAddAddressDrawerOpen(false)}
        isLoading={isCreatingAddress}
        submitLabel="Save address"
      />
    </SideDrawer>
  );
}

function renderStepIndicator(activeStep: number, totalSteps: number) {
  return (
    <Text className="mb-4" color="muted" size="sm">
      Step {activeStep + 1} of {totalSteps}:{" "}
      <Span weight="medium" color="muted">
        {CK.STEP_LABELS[activeStep] ?? ""}
      </Span>
    </Text>
  );
}

function renderAddressStep({
  addresses,
  selectedAddress,
  handleSelectAddress,
  setAddAddressDrawerOpen,
}: {
  addresses: Address[];
  selectedAddress: Address | null;
  handleSelectAddress: (_id: string, address: Address) => void;
  setAddAddressDrawerOpen: (v: boolean) => void;
}) {
  return (
    <CheckoutAddressStep
      labels={{ title: CK.SELECT_ADDRESS }}
      addresses={addresses}
      selectedAddressId={selectedAddress?.id ?? null}
      getAddressId={(a) => a.id}
      onSelectAddress={handleSelectAddress}
      renderAddressCard={(address, { isSelected, select }) => (
        <Div border="default"
          key={address.id}
          onClick={select}
          className={`cursor-pointer transition ${ isSelected ? "border-[var(--appkit-color-text)] bg-[var(--appkit-color-surface)] dark:border-[var(--appkit-color-text)] dark:bg-[var(--appkit-color-surface-elevated)]" : "bg-[var(--appkit-color-surface)] dark:bg-[var(--appkit-color-surface-elevated)]" }`} rounded="xl" padding="md"
        >
          <Text weight="medium" color="primary">
            {address.label ?? address.fullName}
          </Text>
          <Text size="sm" color="muted">
            {address.addressLine1}
            {address.addressLine2 ? `, ${address.addressLine2}` : ""}
          </Text>
          <Text size="sm" color="muted">
            {address.city}, {address.state} {address.postalCode}
          </Text>
        </Div>
      )}
      renderEmptyState={() => (
        <Div className={`border-dashed ${__P.p6} text-center`} border="strong" rounded="xl">
          <Text className="mb-3" color="muted" size="sm">
            No saved addresses yet.
          </Text>
          <Button
            type="button"
            onClick={() => setAddAddressDrawerOpen(true)}
            className="bg-[var(--appkit-color-surface)] text-[var(--appkit-color-text)] hover:bg-surface-hover"
          >
            + Add new address
          </Button>
        </Div>
      )}
      renderAddNew={() => (
        <Div className="mt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setAddAddressDrawerOpen(true)}
          >
            + Add new address
          </Button>
        </Div>
      )}
    />
  );
}

function renderValueOtpStep({
  maskedEmail,
  maskedPhone,
  channel,
  whatsappAvailable,
  otpCode,
  setOtpCode,
  otpError,
  isVerifying,
  isSending,
  handleVerify,
  handleResend,
  handleSendWhatsapp,
}: {
  maskedEmail: string;
  maskedPhone: string;
  channel: "email" | "whatsapp";
  whatsappAvailable: boolean;
  otpCode: string;
  setOtpCode: (v: string) => void;
  otpError: string;
  isVerifying: boolean;
  isSending: boolean;
  handleVerify: () => Promise<void>;
  handleResend: () => Promise<void>;
  handleSendWhatsapp: () => Promise<void>;
}) {
  const destination = channel === "whatsapp" ? maskedPhone || "your WhatsApp number" : maskedEmail || "your registered email";
  return (
    <Div className={STEP_CARD_CLS}>
      <Heading level={2} className="mb-1" color="primary" size="lg" weight="semibold">
        Verify this order
      </Heading>
      <Text className={STEP_SUBLABEL_CLS}>
        High-value orders need a quick verification step
      </Text>
      <Text className="mb-4" color="muted" size="sm">
        {channel === "whatsapp" ? "We sent a 6-digit code via WhatsApp to " : "We sent a 6-digit code to "}
        <Span weight="medium" color="primary">{destination}</Span>.{" "}
        Enter it below to continue.
      </Text>
      <Stack gap="md">
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit code"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          className="tracking-widest text-center text-[length:var(--appkit-text-xl)]"
        />
        {otpError && (
          <Text className="text-error" size="sm">{otpError}</Text>
        )}
        <Button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying || otpCode.length < 6}
          className={PRIMARY_BTN_CLS}
        >
          {isVerifying ? "Verifying…" : "Verify & continue"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleResend}
          disabled={isSending}
          textSize="sm" className="w-full text-[var(--appkit-color-text-muted)] underline"
        >
          {isSending ? "Resending…" : "Resend code"}
        </Button>
        {whatsappAvailable && channel === "email" && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleSendWhatsapp}
            disabled={isSending}
            textSize="sm" className="w-full text-[var(--appkit-color-text-muted)] underline"
          >
            Send via WhatsApp instead
          </Button>
        )}
      </Stack>
    </Div>
  );
}

function renderPaymentStep({
  step,
  actionError,
  isProcessingPayment,
  cartIsEmpty,
  adminBypassEnabled,
  showCashOption,
  showRazorpay,
  showCod,
  emiVisible,
  emiSettings,
  emiTenure,
  setEmiTenure,
  emiSchedule,
  outOfStockPolicy,
  setOutOfStockPolicy,
  codSettings,
  subtotal,
  manualPaymentConsent,
  setManualPaymentConsent,
  handlePayOnline,
  handlePlaceCodOrder,
  handlePlaceCashOrder,
  handlePlaceEmiOrder,
  handleAdminBypass,
}: {
  step: CheckoutStep;
  actionError: string;
  isProcessingPayment: boolean;
  cartIsEmpty: boolean;
  adminBypassEnabled: boolean;
  showCashOption: boolean;
  showRazorpay: boolean;
  showCod: boolean;
  emiVisible: boolean;
  emiSettings: BuyerEmiSettings | null;
  emiTenure: number;
  setEmiTenure: (v: number) => void;
  emiSchedule: ReturnType<typeof computeBuyerEmiQuote> | null;
  outOfStockPolicy: OutOfStockPolicy;
  setOutOfStockPolicy: (v: OutOfStockPolicy) => void;
  codSettings: BuyerFacingFees | null;
  subtotal: number;
  manualPaymentConsent: boolean;
  setManualPaymentConsent: (v: boolean) => void;
  handlePayOnline: () => Promise<void>;
  handlePlaceCodOrder: () => Promise<void>;
  handlePlaceCashOrder: () => Promise<void>;
  handlePlaceEmiOrder: () => Promise<void>;
  handleAdminBypass: () => Promise<void>;
}) {
  return (
    <Div className={STEP_CARD_CLS}>
      {step !== "processing" && (
        <Text className={STEP_SUBLABEL_CLS}>
          {CK.PAYMENT_SUBLABEL}
        </Text>
      )}
      <Heading level={2} className="mb-4" color="primary" size="lg" weight="semibold">
        {step === "processing" ? CK.PAYMENT_PROCESSING_HEADING : CK.PAYMENT_HEADING}
      </Heading>
      {step === "processing" ? (
        <Div className="h-20 animate-pulse" surface="subtle" rounded="lg" />
      ) : (
        <Stack gap="md">
          {actionError && (
            <Text className="text-error" size="sm">{actionError}</Text>
          )}
          <FieldSelect
            name="outOfStockPolicy"
            label={CK.OUT_OF_STOCK_POLICY_LABEL}
            value={outOfStockPolicy}
            onChange={(v) => setOutOfStockPolicy(v as OutOfStockPolicy)}
            options={[
              { value: "skip_items", label: CK.OUT_OF_STOCK_POLICY_SKIP_ITEMS },
              { value: "cancel_order", label: CK.OUT_OF_STOCK_POLICY_CANCEL_ORDER },
            ]}
          />
          {/* The per-store add-on pickers used to live here. They moved to the
              Extras & fees step, which is reachable before payment and shows
              each seller's fees next to its own checkboxes. */}
          {showCashOption && (
            <Stack gap="sm">
              <Div border="default" padding="md" rounded="lg" surface="subtle">
                <Text weight="semibold" size="sm" className="mb-2">
                  {CK.MANUAL_PAYMENT_GUIDE_HEADING}
                </Text>
                <Stack gap="xs">
                  <Text size="sm" color="muted">1. {CK.MANUAL_PAYMENT_GUIDE_STEP1}</Text>
                  <Text size="sm" color="muted">2. {CK.MANUAL_PAYMENT_GUIDE_STEP2}</Text>
                  <Text size="sm" color="muted">3. {CK.MANUAL_PAYMENT_GUIDE_STEP3}</Text>
                  <Text size="sm" color="muted">{CK.MANUAL_PAYMENT_GUIDE_OOS}</Text>
                  <Text size="sm" color="muted">
                    {CK.MANUAL_PAYMENT_GUIDE_REFUND}{" "}
                    <TextLink href={String(ROUTES.PUBLIC.REFUND_POLICY)} target="_blank" size="sm" variant="muted">
                      {CK.MANUAL_PAYMENT_GUIDE_REFUND_LINK}
                    </TextLink>
                  </Text>
                </Stack>
              </Div>
              <FieldCheckbox
                name="manualPaymentConsent"
                label={CK.MANUAL_PAYMENT_CONSENT_LABEL}
                checked={manualPaymentConsent}
                onChange={setManualPaymentConsent}
              />
              <Button
                type="button"
                onClick={handlePlaceCashOrder}
                disabled={isProcessingPayment || cartIsEmpty || !manualPaymentConsent}
                className={PRIMARY_BTN_CLS}
              >
                <Row gap="xs" align="center" justify="center">
                  <BrandBadgeImage src={PAYMENT_ICONS.upi} alt="UPI" className="h-4 w-10" />
                  <CashIcon className="h-4 w-4" />
                  <Span>{isProcessingPayment ? "Placing order…" : "Pay via UPI / Cash"}</Span>
                </Row>
              </Button>
            </Stack>
          )}
          {showRazorpay && (
            <Button
              type="button"
              onClick={handlePayOnline}
              disabled={isProcessingPayment || cartIsEmpty}
              className={PRIMARY_BTN_CLS}
            >
              <Row gap="xs" align="center" justify="center">
                <RazorpayIcon className="h-4 w-4" />
                <Span>{CK.PAYMENT_ONLINE_BTN}</Span>
              </Row>
            </Button>
          )}
          {showCod && (
            <Div>
              {codSettings && subtotal > 0 && (() => {
                const codHandlingFee = computeCodHandlingFee(subtotal, codSettings);
                const depositAmount = Math.round(subtotal * ((codSettings.codDepositPercent ?? 0) / 100) * 100) / 100;
                const payNow = depositAmount + codHandlingFee;
                const payOnDelivery = Math.max(0, subtotal - depositAmount);
                return (
                  <Row gap="xs" align="center" className="mb-2">
                    <Banknote size={14} className="text-[var(--appkit-color-text-muted)]" />
                    <Text size="sm" color="muted">
                      {CK.COD_HANDLING_FEE_LABEL}: {formatEmiRupees(codHandlingFee)} · {CK.COD_PAY_NOW_LABEL}: {formatEmiRupees(payNow)} · {CK.COD_PAY_ON_DELIVERY_LABEL}: {formatEmiRupees(payOnDelivery)}
                    </Text>
                  </Row>
                );
              })()}
              <Button
                type="button"
                onClick={handlePlaceCodOrder}
                disabled={isProcessingPayment || cartIsEmpty}
                className="w-full border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] dark:bg-[var(--appkit-color-surface-elevated)] text-[var(--appkit-color-text)] hover:bg-[var(--appkit-color-bg)] dark:hover:bg-[var(--appkit-color-surface-elevated)]"
              >
                <Row gap="xs" align="center" justify="center">
                  <CashIcon className="h-4 w-4" />
                  <Span>{CK.PAYMENT_COD_BTN}</Span>
                </Row>
              </Button>
            </Div>
          )}
          {emiVisible && emiSettings && (
            <Div className={`${__P.p3} border border-[var(--appkit-color-primary-200)] dark:border-[var(--appkit-color-primary-800)]`} surface="subtle" rounded="lg">
              <Text className="mb-2" weight="semibold">{CK.PAYMENT_EMI_BTN}</Text>
              <FieldSelect
                name="emiTenure"
                label={CK.EMI_TENURE_LABEL}
                value={String(emiTenure)}
                onChange={(v) => setEmiTenure(Number(v))}
                options={emiSettings.tenureOptions.map((m) => ({
                  value: String(m),
                  label: `${m} months`,
                }))}
              />
              {emiSchedule && (
                <Text className="mt-2" size="sm" color="muted">
                  {CK.EMI_TOKEN_LABEL}: {formatEmiRupees(emiSchedule.tokenAmount)} · {formatEmiRupees(emiSchedule.installments[0]?.amount ?? 0)} {CK.EMI_INSTALLMENT_LABEL}
                </Text>
              )}
              <Button
                type="button"
                onClick={handlePlaceEmiOrder}
                disabled={isProcessingPayment || cartIsEmpty}
                className={`mt-3 ${PRIMARY_BTN_CLS}`}
              >
                {CK.PAYMENT_EMI_BTN}
              </Button>
              <TextLink href={String(ROUTES.PUBLIC.HOW_EMI_WORKS)} className="mt-2 inline-block" size="xs" variant="muted">
                {CK.EMI_LEARN_MORE}
              </TextLink>
            </Div>
          )}
          {adminBypassEnabled && (
            <Div className={`mt-1 border border-warning/30 ${__P.p3}`} surface="warning-surface" rounded="lg">
              <Text className="mb-2 text-warning tracking-wide" size="xs" weight="semibold" transform="uppercase">
                {CK.ADMIN_BYPASS_PANEL_LABEL}
              </Text>
              <Button
                type="button"
                onClick={handleAdminBypass}
                disabled={isProcessingPayment || cartIsEmpty}
              textSize="sm" className="w-full border border-warning/40 bg-[var(--appkit-color-warning-surface)] text-warning hover:opacity-80"
              >
                {CK.ADMIN_BYPASS_PAYMENT_BTN}
              </Button>
              <Text className="mt-1.5 text-warning" size="xs">
                {CK.ADMIN_BYPASS_PAYMENT_NOTE}
              </Text>
            </Div>
          )}
        </Stack>
      )}
    </Div>
  );
}

/** One fee line inside a seller's extras card. Rendered only when charged. */
function SellerFeeLine({ label, amount }: { label: string; amount: number }) {
  if (amount <= 0) return null;
  return (
    <Row align="center" justify="between" gap="sm" className="min-w-0">
      <Text size="xs" color="muted" truncate={1} className="min-w-0">{label}</Text>
      <Text size="xs" color="muted" className="flex-shrink-0 tabular-nums">{formatEmiRupees(amount)}</Text>
    </Row>
  );
}

/**
 * One seller's card on the Extras & fees step: what this seller is charging,
 * and the add-ons the buyer can choose for THEM specifically.
 *
 * Read-only by design — deliberately not `SellerGroupSection` from the cart,
 * which carries selection checkboxes, quantity steppers, remove and
 * move-to-wishlist. Every one of those is a cart mutation with no meaning at
 * checkout, and each would force a re-preview round trip.
 *
 * Per CLAUDE.md § "Buyer-Facing Fees": per-store detail belongs on the seller
 * card, and the Order Summary breakdown stays aggregate. Two views of the same
 * numbers at two different granularities, never the same view twice.
 */
function renderSellerExtrasCard({
  store,
  multiStore,
  addons,
  onStoreAddonsChange,
  codSettings,
  previewFailed,
}: {
  store: CheckoutAddonStore;
  multiStore: boolean;
  addons: StoreAddonsValue;
  onStoreAddonsChange: (storeId: string, next: StoreAddonsValue) => void;
  codSettings: BuyerFacingFees | null;
  previewFailed: boolean;
}) {
  // A store with nothing selected forms no order group and is charged nothing,
  // so its extras are shown disabled with the reason rather than hidden — a
  // silently absent control reads as the feature having vanished.
  const nothingSelected = store.subtotal <= 0;
  const fees = store.fees;
  return (
    <Div key={store.storeId} surface="card" padding="md" rounded="lg" border="default">
      <Row align="center" justify="between" gap="sm" className="min-w-0 mb-2">
        <Text size="sm" weight="semibold" color="primary" truncate={1} className="min-w-0">
          {multiStore ? store.storeName : CK.EXTRAS_FEES_HEADING}
        </Text>
        <Text size="sm" color="primary" className="flex-shrink-0 tabular-nums">
          {formatEmiRupees(store.subtotal)}
        </Text>
      </Row>
      {fees && (
        <Stack gap="none" className="mb-2">
          <SellerFeeLine label="Shipping" amount={fees.shippingFee} />
          <SellerFeeLine label="COD handling fee" amount={fees.codHandlingFee} />
          <SellerFeeLine label="WhatsApp updates" amount={fees.whatsappNotifyFee} />
          <SellerFeeLine label="Gift wrap" amount={fees.giftWrapFee} />
          <SellerFeeLine label="Shipment protection" amount={fees.shipmentProtectionFee} />
          <SellerFeeLine label="GST" amount={fees.gstAmount} />
        </Stack>
      )}
      {previewFailed && (
        <Text size="xs" color="error" className="mb-2">{CK.SELLER_FEES_UNAVAILABLE_NOTE}</Text>
      )}
      {hasAnyStoreAddon(codSettings) ? (
        <StoreAddonsPicker
          storeId={store.storeId}
          storeSubtotal={store.subtotal}
          value={addons}
          onChange={onStoreAddonsChange}
          rates={codSettings}
          disabled={nothingSelected}
          disabledReason={nothingSelected ? CK.EXTRAS_NOTHING_SELECTED_NOTE : undefined}
          showGiftMessage
        />
      ) : (
        <Text size="xs" color="muted">{CK.EXTRAS_NO_ADDONS_NOTE}</Text>
      )}
    </Div>
  );
}

/**
 * Step 2 — Add-ons & fees.
 *
 * Its seller list comes from the CART, not from the pricing preview, which is
 * why it is interactive on first paint. Deriving it from the preview (as the
 * old inline add-ons block did) meant the controls could not exist until a
 * network round trip had completed, and vanished entirely and silently if that
 * request ever failed.
 */
function renderExtrasStep({
  addonStores,
  storeAddons,
  onStoreAddonsChange,
  codSettings,
  previewStatus,
  cartIsEmpty,
}: {
  addonStores: CheckoutAddonStore[];
  storeAddons: Record<string, StoreAddonsValue>;
  onStoreAddonsChange: (storeId: string, next: StoreAddonsValue) => void;
  codSettings: BuyerFacingFees | null;
  previewStatus: PricingPreviewStatus;
  cartIsEmpty: boolean;
}) {
  return (
    <Div className={STEP_CARD_CLS}>
      <Text className={STEP_SUBLABEL_CLS}>{CK.EXTRAS_SUBLABEL}</Text>
      <Heading level={2} className="mb-4" color="primary" size="lg" weight="semibold">
        {CK.EXTRAS_HEADING}
      </Heading>
      {cartIsEmpty || addonStores.length === 0 ? (
        <Stack gap="xs">
          <Text size="sm" weight="semibold" color="primary">{CK.NOTHING_PAYABLE_HEADING}</Text>
          <Text size="sm" color="muted">{CK.NOTHING_PAYABLE_BODY}</Text>
          <TextLink href={String(ROUTES.USER.CART)} size="sm">{CK.NOTHING_PAYABLE_CTA}</TextLink>
        </Stack>
      ) : (
        <Stack gap="md">
          {addonStores.length > 1 && (
            <Text size="sm" color="muted">{CK.EXTRAS_INTRO}</Text>
          )}
          {addonStores.map((store) =>
            renderSellerExtrasCard({
              store,
              multiStore: addonStores.length > 1,
              addons: storeAddons[store.storeId] ?? {},
              onStoreAddonsChange,
              codSettings,
              previewFailed: previewStatus === "error",
            }),
          )}
          {previewStatus === "loading" && (
            <Text size="xs" color="muted">{CK.FEES_CALCULATING_NOTE}</Text>
          )}
        </Stack>
      )}
    </Div>
  );
}

function renderCouponSection({
  couponCode,
  setCouponCode,
  couponError,
  isCouponLoading,
  effectiveCoupons,
  handleApplyCoupon,
  handleRemoveCoupon,
}: {
  couponCode: string;
  setCouponCode: (v: string) => void;
  couponError: string;
  isCouponLoading: boolean;
  effectiveCoupons: AppliedCoupon[];
  handleApplyCoupon: () => void;
  handleRemoveCoupon: (code: string) => void;
}) {
  return (
    <Div className={STEP_CARD_CLS}>
      <Heading level={3} className="mb-3" color="primary" size="base" weight="semibold">
        Coupon
      </Heading>
      {effectiveCoupons.length > 0 && (
        <Stack gap="xs" className="mb-3">
          {effectiveCoupons.map((c) => (
            <Row key={c.code} justify="between" className={CLS_APPLIED_COUPON_ROW}>
              <Div>
                <Text className="text-success" size="sm" weight="medium">{c.code}</Text>
                <Text className="text-success" size="xs">
                  −₹{c.discountAmount.toFixed(2)} off
                </Text>
              </Div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                action={ACTIONS.CHECKOUT["remove-coupon"]}
                onClick={() => handleRemoveCoupon(c.code)}
                className="text-error"
              />
            </Row>
          ))}
        </Stack>
      )}
      <Row gap="sm">
        <Input
          type="text"
          placeholder={effectiveCoupons.length ? "Add another coupon" : "Coupon code"}
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
          className="h-9 text-[length:var(--appkit-text-sm)] flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleApplyCoupon}
          disabled={isCouponLoading || !couponCode.trim()}
          className="h-9"
        >
          {isCouponLoading ? "…" : "Apply"}
        </Button>
      </Row>
      {couponError && (
        <Text className="mt-1.5 text-error" size="xs">{couponError}</Text>
      )}
      <Div paddingY="y-sm">
        <CouponHelpDetails showRevalidationNote />
      </Div>
    </Div>
  );
}

// `OrderSummaryLine` used to live here, private to this file. It is now part of
// <CartPriceBreakdown> in appkit, shared with the cart page — the two surfaces
// render the same fee lines, so a new line added to one has to appear in both.

function renderOrderSummary({
  selectedAddress,
  subtotalValue,
  formattedTotal,
  totalDiscount,
  step,
  addressesLoading,
  actionError,
  handleAdvance,
  pricingPreview,
  isLoadingPreview,
  previewStatus,
  hasPayableFigures,
  cartIsEmpty,
}: {
  selectedAddress: Address | null;
  formattedTotal: string;
  /** Raw subtotal — the breakdown needs a number, not a formatted string. */
  subtotalValue: number;
  totalDiscount: number;
  step: CheckoutStep;
  addressesLoading: boolean;
  actionError: string;
  /** Advances one step — to extras from address, to payment from extras. */
  handleAdvance: () => void;
  pricingPreview: CheckoutPricingPreview | null;
  isLoadingPreview: boolean;
  previewStatus: PricingPreviewStatus;
  /** True only when the preview succeeded AND priced at least one store. */
  hasPayableFigures: boolean;
  cartIsEmpty: boolean;
}) {
  const isAdvanceStep = step === "address" || step === "extras";
  return (
    <Div surface="card" padding="sm">
      <Heading level={3} className="mb-3" color="primary" size="base" weight="semibold">
        {CK.ORDER_SUMMARY_HEADING}
      </Heading>
      {selectedAddress && (
        <Div className={`mb-3 ${__P.p3}`} rounded="lg" surface="muted">
          <Text className="mb-1" color="muted" size="xs" weight="medium" transform="uppercase">
            {CK.SHIPPING_TO}
          </Text>
          <Text size="sm" color="primary">
            {selectedAddress.fullName}
          </Text>
          <Text size="sm" color="muted">
            {selectedAddress.addressLine1}, {selectedAddress.city}
          </Text>
        </Div>
      )}
      {/* Shared with the cart's expandable preview — one implementation, so a
          new fee line can't appear in one place and not the other. */}
      {/* `hasPayableFigures`, not `pricingPreview`, decides whether the server
          numbers are shown. An empty lane comes back as a fully-zeroed but
          TRUTHY preview object, which used to render a confident ₹0.00 Total. */}
      <CartPriceBreakdown
        preview={hasPayableFigures ? pricingPreview : null}
        fallbackSubtotal={Math.max(0, subtotalValue - totalDiscount)}
        isLoading={isLoadingPreview}
        errorNote={previewStatus === "error" ? CK.FEES_UNAVAILABLE_NOTE : undefined}
        unavailableNote={
          selectedAddress ? CK.FEES_CALCULATING_NOTE : CK.FEES_PENDING_NOTE
        }
      />
      {!hasPayableFigures && (
        <Row border="default" className="border-t" padding="t-sm" align="center" justify="between">
          <Text weight="semibold" color="primary">{CK.ORDER_SUMMARY_TOTAL}</Text>
          <Text weight="semibold" color="primary">{formattedTotal}</Text>
        </Row>
      )}
      {isAdvanceStep && (
        <Button
          type="button"
          onClick={handleAdvance}
          disabled={!selectedAddress || addressesLoading || cartIsEmpty}
          className="mt-4 w-full bg-[var(--appkit-color-text)] text-[var(--appkit-color-bg)] hover:bg-[var(--appkit-color-text)] dark:bg-[var(--appkit-color-bg)] dark:text-[var(--appkit-color-text)]"
        >
          {step === "address" ? CK.ADDRESS_CONTINUE_BTN : CK.EXTRAS_CONTINUE_BTN}
        </Button>
      )}
      {actionError && isAdvanceStep && (
        <Text className="mt-2 text-error" size="sm">{actionError}</Text>
      )}
    </Div>
  );
}

/**
 * Tier PP — high-value checkout OTP gate (distinct purpose from the
 * shipping-consent OTP above). Extracted into its own hook (mirroring
 * `useEmiCheckout`) so `CheckoutRouteClient` itself stays under the
 * LARGE_COMPONENT audit threshold.
 */
function useValueOtpCheckout({
  subtotal,
  showToast,
  setStep,
  setActionError,
  selectedAddress,
}: {
  subtotal: number;
  showToast: ReturnType<typeof useToast>["showToast"];
  setStep: (step: CheckoutStep) => void;
  setActionError: (msg: string) => void;
  selectedAddress: Address | null;
}) {
  const { data: siteSettings } = useSiteSettings<{
    payment?: { otpCheckoutThreshold?: number };
    notificationChannels?: { whatsapp?: { otpEnabled?: boolean } };
  }>();
  const [valueOtpVerified, setValueOtpVerified] = useState(false);
  const [valueOtpMaskedEmail, setValueOtpMaskedEmail] = useState("");
  const [valueOtpMaskedPhone, setValueOtpMaskedPhone] = useState("");
  const [valueOtpChannel, setValueOtpChannel] = useState<"email" | "whatsapp">("email");
  const [valueOtpCode, setValueOtpCode] = useState("");
  const [valueOtpError, setValueOtpError] = useState("");
  const [isSendingValueOtp, setIsSendingValueOtp] = useState(false);
  const [isVerifyingValueOtp, setIsVerifyingValueOtp] = useState(false);

  // Whole-checkout-total threshold, skipped for COD (evaluated per-payment-
  // method at call sites via ensureValueOtpGate, not here).
  const otpThreshold = siteSettings?.payment?.otpCheckoutThreshold;
  const requiresValueOtp =
    typeof otpThreshold === "number" && otpThreshold > 0 && subtotal >= otpThreshold;

  // WhatsApp is an opt-in alternative to email, never the default — only
  // offered when the admin has it configured AND the selected address has a
  // phone number to send it to.
  const whatsappOtpAvailable =
    siteSettings?.notificationChannels?.whatsapp?.otpEnabled === true && Boolean(selectedAddress?.phone);

  const handleSendValueOtp = useCallback(
    async (channel: "email" | "whatsapp" = "email") => {
      setIsSendingValueOtp(true);
      setActionError("");
      try {
        const result = await sendCheckoutValueOtpAction(channel, channel === "whatsapp" ? selectedAddress?.id : undefined);
        if (!result.ok) {
          setActionError(result.error);
          showToast(result.error, "error");
          return;
        }
        setValueOtpChannel(channel);
        if (result.data.skipped) {
          setValueOtpVerified(true);
          setStep("payment");
          showToast("Verification is temporarily unavailable — continuing without it.", "info");
          return;
        }
        setValueOtpMaskedEmail(result.data.maskedEmail ?? "");
        setValueOtpMaskedPhone(result.data.maskedPhone ?? "");
        showToast(
          channel === "whatsapp" ? "Verification code sent via WhatsApp." : "Verification code sent.",
          "success",
        );
      } catch (err) {
        void normalizeError(err);
        const msg = err instanceof Error ? err.message : "Failed to send verification code";
        setActionError(msg);
        showToast(msg, "error");
      } finally {
        setIsSendingValueOtp(false);
      }
    },
    [showToast, setActionError, setStep, selectedAddress],
  );

  const handleVerifyValueOtp = useCallback(async () => {
    if (!valueOtpCode) return;
    setIsVerifyingValueOtp(true);
    setValueOtpError("");
    try {
      await verifyCheckoutValueOtpAction(valueOtpCode);
      setValueOtpVerified(true);
      showToast("Order verified.", "success");
      setStep("payment");
    } catch (err) {
      void normalizeError(err);
      const msg = err instanceof Error ? err.message : "Invalid code. Please check and try again.";
      setValueOtpError(msg);
      showToast(msg, "error");
    } finally {
      setIsVerifyingValueOtp(false);
    }
  }, [valueOtpCode, showToast, setStep]);

  /**
   * Returns true when it's safe to proceed with placing the order for the
   * given payment method. When the gate applies and hasn't been satisfied
   * yet, sends the OTP, switches to the "value-otp" step, and returns false
   * so the caller aborts — `handleVerifyValueOtp` above resumes to "payment"
   * once verified, and the buyer just clicks the payment button again.
   */
  const ensureValueOtpGate = useCallback(
    (_method: "razorpay" | "cash" | "emi"): boolean => {
      if (!requiresValueOtp || valueOtpVerified) return true;
      setStep("value-otp");
      void handleSendValueOtp();
      return false;
    },
    [requiresValueOtp, valueOtpVerified, setStep, handleSendValueOtp],
  );

  return {
    valueOtpVerified,
    valueOtpMaskedEmail,
    valueOtpMaskedPhone,
    valueOtpChannel,
    whatsappOtpAvailable,
    valueOtpCode,
    setValueOtpCode,
    valueOtpError,
    isSendingValueOtp,
    isVerifyingValueOtp,
    handleSendValueOtp,
    handleVerifyValueOtp,
    ensureValueOtpGate,
  };
}

/** Admin checkout-bypass handler — extracted so `CheckoutRouteClient` itself stays under the LARGE_COMPONENT audit threshold. */
function useAdminBypassCheckout({
  selectedAddress,
  router,
  showToast,
  step,
  setStep,
  setActionError,
  setIsProcessingPayment,
}: {
  selectedAddress: Address | null;
  router: ReturnType<typeof useRouter>;
  showToast: ReturnType<typeof useToast>["showToast"];
  step: CheckoutStep;
  setStep: (step: CheckoutStep) => void;
  setActionError: (msg: string) => void;
  setIsProcessingPayment: (v: boolean) => void;
}) {
  return useCallback(async () => {
    if (!selectedAddress) return;
    setIsProcessingPayment(true);
    setActionError("");
    setStep("processing");
    try {
      const res = await applyCheckoutBypass({ addressId: selectedAddress.id });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? "Admin bypass failed",
        );
      }
      const data = await res.json().catch(() => ({}));
      const firstOrderId = (data?.data?.orderIds as string[] | undefined)?.[0];
      showToast(CK.ADMIN_BYPASS_TOAST, "success");
      router.push(firstOrderId ? `${String(ROUTES.USER.CHECKOUT_SUCCESS)}?orderId=${firstOrderId}` : String(ROUTES.USER.CHECKOUT_SUCCESS));
    } catch (err) {
      void normalizeError(err);
      const msg = err instanceof Error ? err.message : "Admin bypass failed. Please retry.";
      setActionError(msg);
      showToast(msg, "error");
      setStep(step === "processing" ? "payment" : step);
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedAddress, router, showToast, step, setStep, setActionError, setIsProcessingPayment]);
}

/** Extracted so `CheckoutRouteClient` itself stays under the LARGE_COMPONENT audit threshold. */
function usePaymentHandlers({
  selectedAddress,
  user,
  subtotal,
  outOfStockPolicy,
  router,
  showToast,
  setStep,
  setActionError,
  setIsProcessingPayment,
  ensureValueOtpGate,
}: {
  selectedAddress: Address | null;
  user: ReturnType<typeof useAuth>["user"];
  subtotal: number;
  outOfStockPolicy: OutOfStockPolicy;
  router: ReturnType<typeof useRouter>;
  showToast: ReturnType<typeof useToast>["showToast"];
  setStep: (step: CheckoutStep) => void;
  setActionError: (msg: string) => void;
  setIsProcessingPayment: (v: boolean) => void;
  ensureValueOtpGate: (method: "razorpay" | "cash" | "emi") => boolean;
}) {
  const handlePayOnline = useCallback(async () => {
    if (!selectedAddress || !user) return;
    if (!ensureValueOtpGate("razorpay")) return;
    setIsProcessingPayment(true);
    setActionError("");
    setStep("processing");
    try {
      const createRes = await createRazorpayOrder(subtotal);
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to create order");
      }
      const createData = (await createRes.json()) as { data: { razorpayOrderId: string; amount: number; currency: string; keyId: string } };
      const { razorpayOrderId, amount, currency, keyId } = createData.data;
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway");
      const rzpResponse = await openRazorpayModal({
        keyId, razorpayOrderId, amount, currency,
        name: process.env.NEXT_PUBLIC_SITE_NAME ?? "LetItRip",
        prefill: { email: user.email ?? undefined, name: (user as unknown as Record<string, JsonValue>).displayName as string | undefined },
      });
      const verifyRes = await verifyRazorpayPayment({
        razorpay_order_id: rzpResponse.razorpay_order_id,
        razorpay_payment_id: rzpResponse.razorpay_payment_id,
        razorpay_signature: rzpResponse.razorpay_signature,
        addressId: selectedAddress.id,
        outOfStockPolicy,
      });
      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Payment verification failed");
      }
      const verifyData = await verifyRes.json().catch(() => ({}));
      const firstOrderId = (verifyData?.data?.orderIds as string[] | undefined)?.[0];
      showToast("Payment successful! Your order has been placed.", "success");
      router.push(firstOrderId ? `${String(ROUTES.USER.CHECKOUT_SUCCESS)}?orderId=${firstOrderId}` : String(ROUTES.USER.CHECKOUT_SUCCESS));
    } catch (err) {
      void normalizeError(err);
      const msg = err instanceof Error ? err.message : "Payment failed. Please retry.";
      setActionError(msg);
      showToast(msg, "error");
      setStep("payment");
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedAddress, user, subtotal, router, showToast, outOfStockPolicy, ensureValueOtpGate]);

  const handlePlaceCodOrder = useCallback(async () => {
    if (!selectedAddress) return;
    setIsProcessingPayment(true);
    setActionError("");
    setStep("processing");
    try {
      const res = await createCheckoutOrder({ addressId: selectedAddress.id, paymentMethod: "cod", outOfStockPolicy });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? ORDER_PLACEMENT_FAILED_MSG);
      }
      const codData = await res.json().catch(() => ({}));
      const firstCodOrderId = (codData?.data?.orderIds as string[] | undefined)?.[0];
      showToast("Order placed successfully! Cash on delivery confirmed.", "success");
      router.push(firstCodOrderId ? `${String(ROUTES.USER.CHECKOUT_SUCCESS)}?orderId=${firstCodOrderId}` : String(ROUTES.USER.CHECKOUT_SUCCESS));
    } catch (err) {
      void normalizeError(err);
      const msg = err instanceof Error ? err.message : ORDER_FAILED_RETRY_MSG;
      setActionError(msg);
      showToast(msg, "error");
      setStep("payment");
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedAddress, router, showToast, outOfStockPolicy]);

  const handlePlaceCashOrder = useCallback(async () => {
    if (!selectedAddress) return;
    if (!ensureValueOtpGate("cash")) return;
    setIsProcessingPayment(true);
    setActionError("");
    setStep("processing");
    try {
      const res = await createCheckoutOrder({ addressId: selectedAddress.id, paymentMethod: "cash", outOfStockPolicy });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? ORDER_PLACEMENT_FAILED_MSG);
      }
      const cashData = await res.json().catch(() => ({}));
      const firstOrderId = (cashData?.data?.orderIds as string[] | undefined)?.[0];
      if (firstOrderId) {
        router.push(String(ROUTES.USER.ORDER_PAYMENT(firstOrderId)));
      } else {
        router.push(String(ROUTES.USER.CHECKOUT_SUCCESS));
      }
    } catch (err) {
      void normalizeError(err);
      const msg = err instanceof Error ? err.message : ORDER_FAILED_RETRY_MSG;
      setActionError(msg);
      showToast(msg, "error");
      setStep("payment");
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedAddress, router, showToast, outOfStockPolicy, ensureValueOtpGate]);

  return { handlePayOnline, handlePlaceCodOrder, handlePlaceCashOrder };
}

// --- Component ---------------------------------------------------------------

export function CheckoutRouteClient({
  adminBypassEnabled = false,
  showCashOption = true,
  showRazorpay = false,
  showCod = false,
  showCoupons = false,
  showEmi = false,
  emiSettings = null,
  codSettings = null,
}: {
  adminBypassEnabled?: boolean;
  showCashOption?: boolean;
  showRazorpay?: boolean;
  showCod?: boolean;
  showCoupons?: boolean;
  showEmi?: boolean;
  emiSettings?: BuyerEmiSettings | null;
  codSettings?: BuyerFacingFees | null;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { requireAuth } = useAuthGate();

  const { data: addresses, isLoading: addressesLoading } = useAddresses({
    enabled: !!user?.uid,
  });

  const { data: cartData } = useCartQuery<ServerCartResponse>({
    endpoint: API_ROUTES.CART.GET,
    queryKey: ["cart", user?.uid],
    enabled: !!user?.uid,
  });

  const [step, setStep] = useState<CheckoutStep>("address");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addAddressDrawerOpen, setAddAddressDrawerOpen] = useState(false);
  const { mutate: createAddress, isPending: isCreatingAddress } =
    useCreateAddress({
      onSuccess: (created) => {
        setSelectedAddress(created);
        setAddAddressDrawerOpen(false);
        showToast("Address added", "success");
      },
      onError: (err) => {
        showToast(
          err instanceof Error ? err.message : "Failed to add address",
          "error",
        );
      },
    });
  const handleAddressFormSubmit = useCallback(
    (data: AddressFormData) => {
      createAddress(data);
    },
    [createAddress],
  );
  const [actionError, setActionError] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [outOfStockPolicy, setOutOfStockPolicy] = useState<OutOfStockPolicy>("skip_items");
  const [manualPaymentConsent, setManualPaymentConsent] = useState(false);

  /**
   * Add-on selections, per store — was four cart-wide booleans, which meant one
   * tick billed the add-on against every seller in the cart.
   *
   * Seeded from the cart document so a choice made in the cart is still ticked
   * here, and written straight back to it: the cart doc is what the server
   * reads when the order is placed, so these controls stay authoritative for
   * Buy Now (which never passes through the cart page at all).
   */
  const [localStoreAddons, setLocalStoreAddons] = useState<Record<string, StoreAddonsValue> | null>(null);
  const serverStoreAddons = (cartData?.cart?.storeAddons ?? {}) as Record<string, StoreAddonsValue>;
  const storeAddons = localStoreAddons ?? serverStoreAddons;
  // Changes whenever a selection is persisted, so the pricing preview refetches
  // without needing to know the shape of what changed.
  const addonSignal = useMemo(
    () =>
      Object.entries(storeAddons)
        .map(([sid, a]) => `${sid}:${a.whatsappNotifyAddon ? 1 : 0}${a.giftWrapAddon ? 1 : 0}${a.shipmentProtectionAddon ? 1 : 0}`)
        .sort()
        .join("|"),
    [storeAddons],
  );

  const handleStoreAddonsChange = useCallback(
    (storeId: string, next: StoreAddonsValue) => {
      setLocalStoreAddons((prev) => ({ ...(prev ?? serverStoreAddons), [storeId]: next }));
      persistCartAddons(storeId, next).catch((err: unknown) => {
        void normalizeError(err);
        showToast("Could not update add-ons. Please try again.", "error");
      });
    },
    // serverStoreAddons is a fresh object each render; addonSignal tracks its
    // real content, so depending on that keeps the callback stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addonSignal, showToast],
  );

  // --- Coupon state ---
  const searchParams = useSearchParams();
  const serverAppliedCoupons: AppliedCoupon[] = cartData?.cart?.appliedCoupons ?? [];
  const [localCoupons, setLocalCoupons] = useState<AppliedCoupon[] | null>(null);
  const effectiveCoupons = localCoupons ?? serverAppliedCoupons;
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  const totalDiscount = effectiveCoupons.reduce((s, c) => s + c.discountAmount, 0);

  // Lane scoping. `cartData.subtotal` is the WHOLE cart, but only one lane is
  // payable at a time (auction > offer > standard) and the server-side
  // `assertCheckoutLane` will refuse anything else — so showing a blended
  // subtotal here would quote a number the buyer cannot actually pay.
  // `pricingPreview` is already lane-scoped server-side; this is the fallback
  // shown before it loads.
  const allCartItems: CheckoutCartLine[] = cartData?.cart?.items ?? [];
  const checkoutLane = activeLane(allCartItems);
  const laneScopedItems = (checkoutLane ? laneItems(allCartItems, checkoutLane) : []) as CheckoutCartLine[];
  const isLockedCheckoutLane = checkoutLane !== null && isLockedLane(checkoutLane);
  /**
   * Only the lines actually being bought. `previewCheckoutPricing` filters on
   * this too, so anything derived here that ignores it quotes a subtotal above
   * what the buyer is charged.
   */
  const selectedItemIds = cartData?.cart?.selectedItemIds ?? null;
  const payableItems = useMemo(() => {
    if (!selectedItemIds?.length) return laneScopedItems;
    const keep = new Set(selectedItemIds);
    return laneScopedItems.filter((line) => !line.itemId || keep.has(line.itemId));
    // laneScopedItems is rebuilt every render; its content is tracked by the
    // cart query's own identity, which is what changes when the cart changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartData?.cart?.items, checkoutLane, selectedItemIds]);
  // `cartData.subtotal` comes from `cartRepository.getSubtotal`, which ignores
  // selection, lockedPrice and lanes alike — so it is only usable as a rough
  // standard-lane figure. Everything else sums through the one shared pricing
  // rule (Recurrent Root Cause #75).
  const subtotal =
    checkoutLane === null || checkoutLane === CART_LANE.STANDARD
      ? (selectedItemIds?.length
          ? payableItems.reduce((sum, line) => sum + clientLineTotal(line), 0)
          : (cartData?.subtotal ?? 0))
      : payableItems.reduce((sum, line) => sum + clientLineTotal(line), 0);
  const cartIsEmpty = payableItems.length === 0;

  // Order Summary pricing preview — the true total including shipping, COD
  // handling fee, add-ons, and GST, matching what order placement actually
  // charges/records (see usePricingPreview above). Falls back to the plain
  // subtotal-minus-coupon estimate while the preview hasn't loaded yet.
  const previewPaymentMethod: "cod" | "online" | "upi_manual" | "cash" | "emi" =
    showCashOption ? "cash" : showCod ? "cod" : showRazorpay ? "online" : "emi";
  const couponSignal = effectiveCoupons.map((c) => `${c.code}:${c.discountAmount}`).join(",");
  const {
    preview: pricingPreview,
    isLoadingPreview,
    status: previewStatus,
  } = usePricingPreview({
    // Fires from the ADDRESS step, not just payment — the fee figures are the
    // whole point of the extras step and waiting until payment meant they
    // appeared after the buyer had already committed. Gated on an address
    // because GST needs the resolved state and shipping needs the store↔buyer
    // pair, so a preview without one is a number guaranteed to change; the
    // 300ms debounce is what keeps address-card clicking to one request.
    enabled: !!user?.uid && !!selectedAddress && !cartIsEmpty,
    addressId: selectedAddress?.id,
    paymentMethod: previewPaymentMethod,
    // Passed explicitly rather than letting the server default independently.
    // NOT taken from `?lane=` — assertCheckoutLane refuses anything but the
    // active lane at placement, so a URL-supplied lane would render a
    // payable-looking total for a lane the order will be refused on.
    lane: checkoutLane ?? undefined,
    addonSignal,
    couponSignal,
  });
  /**
   * True only when the server priced at least one store. An empty lane returns
   * a fully-zeroed but TRUTHY preview, so `preview ? … : fallback` rendered a
   * confident ₹0.00 for it.
   */
  const hasPayableFigures = previewStatus === "ready" && (pricingPreview?.stores.length ?? 0) > 0;
  const effectiveTotal = hasPayableFigures && pricingPreview
    ? pricingPreview.total
    : Math.max(0, subtotal - totalDiscount);

  /**
   * The sellers this checkout will produce orders for, derived from CART ITEMS.
   *
   * This came off `pricingPreview.stores` before, which is why the add-ons were
   * invisible: the preview only ran on the payment step, so there was no seller
   * list — and therefore no controls — until then, and none at all if the
   * request failed. The preview is still authoritative once it lands; it just
   * no longer decides whether the section exists.
   */
  const addonStores = useMemo<CheckoutAddonStore[]>(() => {
    const byStore = new Map<string, CheckoutAddonStore>();
    for (const line of payableItems) {
      if (!line.storeId) continue;
      const entry = byStore.get(line.storeId) ?? {
        storeId: line.storeId,
        storeName: line.storeName || line.storeId,
        subtotal: 0,
        fees: null,
      };
      entry.subtotal += clientLineTotal(line);
      byStore.set(line.storeId, entry);
    }
    const priced = new Map((pricingPreview?.stores ?? []).map((s) => [s.storeId, s]));
    return [...byStore.values()].map((s) => {
      const fees = priced.get(s.storeId) ?? null;
      // The server subtotal wins when present — it is what will actually be
      // billed, including a live listing price that has moved since the line
      // was added, which the client cannot see.
      return { ...s, subtotal: fees?.subtotal ?? s.subtotal, fees };
    });
  }, [payableItems, pricingPreview]);

  const {
    valueOtpMaskedEmail,
    valueOtpMaskedPhone,
    valueOtpChannel,
    whatsappOtpAvailable,
    valueOtpCode,
    setValueOtpCode,
    valueOtpError,
    isSendingValueOtp,
    isVerifyingValueOtp,
    handleSendValueOtp,
    handleVerifyValueOtp,
    ensureValueOtpGate,
  } = useValueOtpCheckout({ subtotal, showToast, setStep, setActionError, selectedAddress });

  const { emiTenure, setEmiTenure, emiVisible, emiSchedule, handlePlaceEmiOrder } = useEmiCheckout({
    emiSettings,
    showEmi,
    subtotal,
    cartIsEmpty,
    selectedAddress,
    outOfStockPolicy,
    router,
    showToast,
    setStep,
    setActionError,
    setIsProcessingPayment,
    ensureValueOtpGate,
  });

  const handleSelectAddress = useCallback(
    (_addressId: string, address: Address) => {
      setSelectedAddress(address);
    },
    [],
  );

  const handleAdvanceToExtras = useCallback(() => {
    if (!selectedAddress || cartIsEmpty) return;
    setActionError("");
    setStep("extras");
  }, [selectedAddress, cartIsEmpty]);

  const handleAdvanceToPayment = useCallback(() => {
    if (!selectedAddress || cartIsEmpty) return;
    setActionError("");
    setStep("payment");
  }, [selectedAddress, cartIsEmpty]);

  /**
   * Back, scoped to the two steps where nothing has been committed yet.
   *
   * Safe on the extras step because add-on toggles are persisted to the cart
   * document as they are made — stepping back loses nothing and costs no server
   * call. Deliberately unreachable from `processing` (an order is in flight)
   * and from `value-otp` (a code has been sent).
   */
  const handleStepBack = useCallback(() => {
    setActionError("");
    setStep((prev) => (prev === "payment" ? "extras" : prev === "extras" ? "address" : prev));
  }, []);

  const handleApplyCoupon = useCallback(async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (effectiveCoupons.some((c) => c.code === code)) {
      setCouponError("This coupon is already applied.");
      return;
    }
    setIsCouponLoading(true);
    setCouponError("");
    try {
      const res = await applyCartCoupon(code);
      const data = await res.json() as { data?: AppliedCoupon; error?: string };
      if (!res.ok) {
        setCouponError(data.error ?? "Invalid coupon code");
        return;
      }
      if (data.data) {
        setLocalCoupons((prev) => [...(prev ?? effectiveCoupons).filter((c) => c.code !== data.data!.code), data.data!]);
        setCouponCode("");
        showToast(`Coupon "${data.data.code}" applied! You saved ₹${data.data.discountAmount.toFixed(2)}.`, "success");
      }
    } catch (_err) {
      void normalizeError(_err);
      setCouponError("Failed to apply coupon. Please try again.");
    } finally {
      setIsCouponLoading(false);
    }
  }, [couponCode, effectiveCoupons, showToast]);

  const handleRemoveCoupon = useCallback(
    async (code: string) => {
      setLocalCoupons((prev) => (prev ?? effectiveCoupons).filter((c) => c.code !== code));
      try {
        await removeCartCoupon(code);
      } catch (_err) { void normalizeError(_err); /* best-effort */ }
      showToast("Coupon removed.", "info");
    },
    [effectiveCoupons, showToast],
  );

  // ?coupon=CODE deep-link auto-apply
  useEffect(() => {
    if (!user?.uid) return;
    const incoming = searchParams.get("coupon");
    if (!incoming) return;
    const code = incoming.trim().toUpperCase();
    if (!code) return;
    if (effectiveCoupons.some((c) => c.code === code)) return;
    setCouponCode(code);
    const t = setTimeout(() => { void handleApplyCoupon(); }, 0);
    return () => clearTimeout(t);
  }, [user?.uid, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const { handlePayOnline, handlePlaceCodOrder, handlePlaceCashOrder } = usePaymentHandlers({
    selectedAddress,
    user,
    subtotal,
    outOfStockPolicy,
    router,
    showToast,
    setStep,
    setActionError,
    setIsProcessingPayment,
    ensureValueOtpGate,
  });

  const handleAdminBypass = useAdminBypassCheckout({
    selectedAddress,
    router,
    showToast,
    step,
    setStep,
    setActionError,
    setIsProcessingPayment,
  });

  /**
   * `?lane=` is advisory. `AUCTION_CHECKOUT_URL` deep-links a buyer here from a
   * settlement email, and if that win has since been paid or forfeited they
   * used to land on an ordinary standard-lane checkout with no explanation at
   * all. It is validated against the real lane values and never fed to the
   * pricing preview — see the `lane:` comment above.
   */
  const requestedLane = searchParams.get("lane");
  const laneMismatch =
    !!requestedLane &&
    (Object.values(CART_LANE) as string[]).includes(requestedLane) &&
    checkoutLane !== null &&
    requestedLane !== checkoutLane;

  // --- Render -----------------------------------------------------------------

  // A map rather than a ternary so `value-otp` and `processing` say explicitly
  // that they are interstitials WITHIN payment rather than falling through to
  // whatever the last branch happened to be.
  const STEP_INDEX: Record<CheckoutStep, number> = {
    address: 0,
    extras: 1,
    payment: 2,
    "value-otp": 2,
    processing: 2,
  };
  const stepIndex = STEP_INDEX[step];

  const fmtOpts: Intl.NumberFormatOptions = { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 };
  const formattedTotal = effectiveTotal.toLocaleString("en-IN", fmtOpts);

  /**
   * Mobile bottom bar — one explicit branch per step.
   *
   * This used to END in an un-guarded `return [PAY_ONLINE]`, reached by every
   * step that wasn't address/value-otp/processing. Since `showRazorpay`
   * defaults to false, that offered "Pay Online (Razorpay)" — wired to the
   * Razorpay handler — on a site where Razorpay is switched off. The payment
   * branch now picks the CTA that matches an ENABLED method, and an
   * unrecognised step gets no bar at all rather than a plausible-looking wrong
   * one.
   */
  const bottomActions = useMemo(() => {
    // Built inside the memo: a fresh object at component scope would be a new
    // reference every render, so the memo would recompute every render and
    // re-publish the bar each time.
    const backAction = {
      id: ACTION_ID.CHECKOUT_BACK,
      label: CK.EXTRAS_BACK_BTN,
      variant: "ghost" as const,
      disabled: false,
      onClick: handleStepBack,
      grow: false,
    };
    if (step === "address") {
      return [{
        id: ACTION_ID.CONTINUE_TO_VERIFY,
        label: CK.ADDRESS_CONTINUE_BTN,
        variant: "primary" as const,
        disabled: !selectedAddress || addressesLoading || cartIsEmpty,
        onClick: handleAdvanceToExtras,
        grow: true,
      }];
    }
    if (step === "extras") {
      return [backAction, {
        id: ACTION_ID.CONTINUE_TO_PAYMENT,
        label: CK.EXTRAS_CONTINUE_BTN,
        variant: "primary" as const,
        disabled: !selectedAddress || cartIsEmpty,
        onClick: handleAdvanceToPayment,
        grow: true,
      }];
    }
    if (step === "value-otp") {
      return [{
        id: ACTION_ID.VERIFY_OTP,
        label: isVerifyingValueOtp ? "Verifying…" : "Verify & continue",
        variant: "primary" as const,
        disabled: isVerifyingValueOtp || valueOtpCode.length < 6,
        onClick: () => requireAuth(ACTION_ID.VERIFY_OTP, handleVerifyValueOtp),
        grow: true,
      }];
    }
    if (step === "processing") return [];
    if (step === "payment") {
      const disabled = isProcessingPayment || cartIsEmpty;
      const primary = showCashOption
        ? { id: ACTION_ID.PAY_COD, label: "Pay via UPI / Cash", onClick: handlePlaceCashOrder }
        : showRazorpay
          ? { id: ACTION_ID.PAY_ONLINE, label: CK.PAYMENT_ONLINE_BTN, onClick: handlePayOnline }
          : showCod
            ? { id: ACTION_ID.PAY_COD, label: CK.PAYMENT_COD_BTN, onClick: handlePlaceCodOrder }
            : emiVisible
              ? { id: ACTION_ID.PAY_COD, label: CK.PAYMENT_EMI_BTN, onClick: handlePlaceEmiOrder }
              : null;
      // No enabled payment method means no CTA — the in-page step already says
      // so, and a bar that does nothing is worse than no bar.
      if (!primary) return [backAction];
      return [backAction, { ...primary, variant: "primary" as const, disabled, grow: true }];
    }
    return [];

  }, [step, selectedAddress, addressesLoading, handleAdvanceToExtras, handleAdvanceToPayment, handleStepBack, isProcessingPayment, isVerifyingValueOtp, valueOtpCode.length, handleVerifyValueOtp, cartIsEmpty, handlePayOnline, handlePlaceCashOrder, handlePlaceCodOrder, handlePlaceEmiOrder, showCashOption, showRazorpay, showCod, emiVisible, requireAuth]);

  useBottomActions(
    bottomActions.length > 0
      ? { actions: bottomActions, infoLabel: formattedTotal }
      : {},
  );

  // --- Redirect unauthenticated users ----------------------------------------
  // Placed AFTER all hooks so React's hook ordering stays consistent across
  // renders (rules-of-hooks); guarding earlier would skip useMemo +
  // useBottomActions during the redirect frame.

  if (!authLoading && !user) {
    router.push(`${String(ROUTES.AUTH.LOGIN)}?returnTo=${String(ROUTES.USER.CHECKOUT)}`);
    return null;
  }

  return (
    <Div className="mx-auto w-full max-w-7xl">
      {renderAddressDrawer({ addAddressDrawerOpen, setAddAddressDrawerOpen, handleAddressFormSubmit, isCreatingAddress })}
      <CheckoutView
        labels={{ title: CK.TITLE }}
        totalSteps={3}
        activeStep={stepIndex}
        renderStepIndicator={(activeStep, totalSteps) => renderStepIndicator(activeStep, totalSteps)}
        renderStep={() => {
          if (step === "address") {
            return renderAddressStep({ addresses: addresses ?? [], selectedAddress, handleSelectAddress, setAddAddressDrawerOpen });
          }
          if (step === "extras") {
            return (
              <Stack gap="lg">
                {laneMismatch && <Alert variant="info">{CK.LANE_MISMATCH_NOTE}</Alert>}
                {renderExtrasStep({
                  addonStores,
                  storeAddons,
                  onStoreAddonsChange: handleStoreAddonsChange,
                  codSettings,
                  previewStatus,
                  cartIsEmpty,
                })}
              </Stack>
            );
          }
          if (step === "value-otp") {
            return renderValueOtpStep({
              maskedEmail: valueOtpMaskedEmail,
              maskedPhone: valueOtpMaskedPhone,
              channel: valueOtpChannel,
              whatsappAvailable: whatsappOtpAvailable,
              otpCode: valueOtpCode,
              setOtpCode: setValueOtpCode,
              otpError: valueOtpError,
              isVerifying: isVerifyingValueOtp,
              isSending: isSendingValueOtp,
              handleVerify: handleVerifyValueOtp,
              handleResend: () => handleSendValueOtp(valueOtpChannel),
              handleSendWhatsapp: () => handleSendValueOtp("whatsapp"),
            });
          }
          return (
            <Stack gap="lg">
              {isLockedCheckoutLane && (
                <Alert variant="info">
                  {`You're paying for your ${CART_LANE_LABELS[checkoutLane!].toLowerCase()}. The price is already agreed, so coupons don't apply and the rest of your cart stays where it is.`}
                </Alert>
              )}
              {/* Coupons are disabled on the locked lanes — the price was won
                  at auction or negotiated on an offer, so stacking a discount
                  on top would re-open a settled number. */}
              {showCoupons && !isLockedCheckoutLane && renderCouponSection({ couponCode, setCouponCode, couponError, isCouponLoading, effectiveCoupons, handleApplyCoupon, handleRemoveCoupon })}
              {renderPaymentStep({ step, actionError, isProcessingPayment, cartIsEmpty, adminBypassEnabled, showCashOption, showRazorpay, showCod, emiVisible, emiSettings, emiTenure, setEmiTenure, emiSchedule, outOfStockPolicy, setOutOfStockPolicy, codSettings, subtotal, manualPaymentConsent, setManualPaymentConsent, handlePayOnline, handlePlaceCodOrder, handlePlaceCashOrder, handlePlaceEmiOrder, handleAdminBypass })}
            </Stack>
          );
        }}
        renderOrderSummary={() => renderOrderSummary({ selectedAddress, formattedTotal, subtotalValue: subtotal, totalDiscount, step, addressesLoading, actionError, handleAdvance: step === "address" ? handleAdvanceToExtras : handleAdvanceToPayment, pricingPreview, isLoadingPreview, previewStatus, hasPayableFigures, cartIsEmpty })}
      />
    </Div>
  );
}
