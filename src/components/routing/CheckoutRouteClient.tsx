"use client";
import { normalizeError, checkEmiEligibility, computeEmiSchedule, type JsonArray } from "@mohasinac/appkit";
import type { JsonValue, EmiSettings } from "@mohasinac/appkit";

import { useCallback, useState, useEffect, useMemo } from "react";
import {
  AddressForm,
  Button,
  CheckoutAddressStep,
  CheckoutView,
  Div,
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
  sendConsentOtpAction,
  verifyConsentOtpAction,
} from "@/actions/checkout.actions";
import { API_ROUTES, UI_LABELS } from "@/constants";
import {
  createCheckoutOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "@/lib/api/payment-client";
import { applyCartCoupon, removeCartCoupon } from "@/lib/api/cart-client";
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

interface ServerCartResponse {
  cart: { items: JsonArray; appliedCoupons?: AppliedCoupon[] };
  subtotal: number;
  itemCount: number;
}

type CheckoutStep = "address" | "otp-consent" | "otp" | "payment" | "processing";

// --- Shared class strings ----------------------------------------------------

const STEP_CARD_CLS = "rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] p-[var(--appkit-space-6)]";
const STEP_SUBLABEL_CLS = "text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)]";
const CLS_APPLIED_COUPON_ROW = "rounded-lg bg-success-surface border border-success px-[var(--appkit-space-3)] py-[var(--appkit-space-2)]";
const PRIMARY_BTN_CLS = "w-full rounded-lg bg-[var(--appkit-color-primary)] px-[var(--appkit-space-4)] py-[var(--appkit-space-3)] text-[length:var(--appkit-text-sm)] font-semibold text-white hover:opacity-90 disabled:opacity-50";

/** EMI amounts from computeEmiSchedule are in paise — format as INR rupees. */
function formatEmiRupees(paise: number): string {
  return (paise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

const ORDER_PLACEMENT_FAILED_MSG = "Order placement failed";
const ORDER_FAILED_RETRY_MSG = "Order failed. Please retry.";

/** Encapsulates EMI tenure selection, eligibility, schedule preview, and order placement. */
function useEmiCheckout({
  emiSettings,
  showEmi,
  subtotal,
  cartIsEmpty,
  selectedAddress,
  router,
  showToast,
  setStep,
  setActionError,
  setIsProcessingPayment,
}: {
  emiSettings: EmiSettings | null;
  showEmi: boolean;
  subtotal: number;
  cartIsEmpty: boolean;
  selectedAddress: Address | null;
  router: ReturnType<typeof useRouter>;
  showToast: ReturnType<typeof useToast>["showToast"];
  setStep: (step: CheckoutStep) => void;
  setActionError: (msg: string) => void;
  setIsProcessingPayment: (v: boolean) => void;
}) {
  const [emiTenure, setEmiTenure] = useState<number>(emiSettings?.tenureOptions?.[0] ?? 3);
  const emiEligible = useMemo(
    () => (emiSettings ? checkEmiEligibility(subtotal, true, emiSettings).eligible : false),
    [emiSettings, subtotal],
  );
  const emiVisible = showEmi && !!emiSettings && emiEligible && !cartIsEmpty;
  const emiSchedule = useMemo(
    () => (emiVisible && emiSettings ? computeEmiSchedule(subtotal, emiTenure, emiSettings) : null),
    [emiVisible, emiSettings, subtotal, emiTenure],
  );

  const handlePlaceEmiOrder = useCallback(async () => {
    if (!selectedAddress) return;
    setIsProcessingPayment(true);
    setActionError("");
    setStep("processing");
    try {
      const res = await createCheckoutOrder({
        addressId: selectedAddress.id,
        paymentMethod: "emi",
        emiTenureMonths: emiTenure,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? ORDER_PLACEMENT_FAILED_MSG);
      }
      const emiData = await res.json().catch(() => ({}));
      const firstEmiOrderId = (emiData?.data?.orderIds as string[] | undefined)?.[0];
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
  }, [selectedAddress, emiTenure, router, showToast, setStep, setActionError, setIsProcessingPayment]);

  return { emiTenure, setEmiTenure, emiVisible, emiSchedule, handlePlaceEmiOrder };
}

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
            className="bg-zinc-900 text-white hover:bg-zinc-800 bg-[var(--appkit-color-surface)] text-[var(--appkit-color-text)]"
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

function renderOtpConsentStep({
  userEmail,
  isSendingOtp,
  isProcessingPayment,
  adminBypassEnabled,
  handleSendOtp,
  handleAdminBypass,
}: {
  userEmail: string;
  isSendingOtp: boolean;
  isProcessingPayment: boolean;
  adminBypassEnabled: boolean;
  handleSendOtp: () => Promise<void>;
  handleAdminBypass: () => Promise<void>;
}) {
  const maskedDisplay = userEmail
    ? `${userEmail[0]}***@${userEmail.split("@")[1] ?? ""}`
    : "your registered email";
  return (
    <Div className={STEP_CARD_CLS}>
      <Heading level={2} className="mb-1" color="primary" size="lg" weight="semibold">
        {CK.OTP_CONSENT_HEADING}
      </Heading>
      <Text className={STEP_SUBLABEL_CLS}>
        {CK.OTP_CONSENT_SUBLABEL}
      </Text>
      <Text className="mb-5" color="muted" size="sm">
        {CK.OTP_CONSENT_BODY_PREFIX}{" "}
        <Span weight="medium" color="primary">{maskedDisplay}</Span>.
      </Text>
      <Stack gap="md">
        <Button
          type="button"
          onClick={handleSendOtp}
          disabled={isSendingOtp}
          className={PRIMARY_BTN_CLS}
        >
          {isSendingOtp ? CK.OTP_SENDING_BTN : CK.OTP_SEND_BTN}
        </Button>
        {adminBypassEnabled && (
          <Div className={`border border-warning/30 ${__P.p3}`} surface="warning-surface" rounded="lg">
            <Text className="mb-1 text-warning tracking-wide" size="xs" weight="semibold" transform="uppercase">
              {CK.ADMIN_BYPASS_PANEL_LABEL}
            </Text>
            <Text className="mb-2 text-warning" size="xs">
              {CK.ADMIN_BYPASS_CONSENT_DESC}
            </Text>
            <Button
              type="button"
              onClick={handleAdminBypass}
              disabled={isProcessingPayment}
              textSize="sm" className="w-full border border-warning/40 bg-[var(--appkit-color-warning-surface)] text-warning hover:opacity-80"
            >
              {CK.ADMIN_BYPASS_CONSENT_BTN}
            </Button>
          </Div>
        )}
      </Stack>
    </Div>
  );
}

function renderOtpStep({
  maskedEmail,
  otpCode,
  setOtpCode,
  otpError,
  isVerifyingOtp,
  isSendingOtp,
  handleVerifyOtp,
  handleSendOtp,
}: {
  maskedEmail: string;
  otpCode: string;
  setOtpCode: (v: string) => void;
  otpError: string;
  isVerifyingOtp: boolean;
  isSendingOtp: boolean;
  handleVerifyOtp: () => Promise<void>;
  handleSendOtp: () => Promise<void>;
}) {
  return (
    <Div className={STEP_CARD_CLS}>
      <Heading level={2} className="mb-1" color="primary" size="lg" weight="semibold">
        {CK.OTP_ENTRY_HEADING}
      </Heading>
      <Text className={STEP_SUBLABEL_CLS}>
        {CK.OTP_ENTRY_SUBLABEL}
      </Text>
      <Text className="mb-4" color="muted" size="sm">
        {CK.OTP_ENTRY_BODY_PREFIX}{" "}
        <Span weight="medium" color="primary">{maskedEmail}</Span>.{" "}
        {CK.OTP_ENTRY_BODY_SUFFIX}
      </Text>
      <Stack gap="md">
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder={CK.OTP_PLACEHOLDER}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          className="tracking-widest text-center text-[length:var(--appkit-text-xl)]"
        />
        {otpError && (
          <Text className="text-error" size="sm">{otpError}</Text>
        )}
        <Button
          type="button"
          onClick={handleVerifyOtp}
          disabled={isVerifyingOtp || otpCode.length < 6}
          className={PRIMARY_BTN_CLS}
        >
          {isVerifyingOtp ? CK.OTP_VERIFYING_BTN : CK.OTP_VERIFY_BTN}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleSendOtp}
          disabled={isSendingOtp}
          textSize="sm" className="w-full text-[var(--appkit-color-text-muted)] underline"
        >
          {isSendingOtp ? CK.OTP_RESENDING_BTN : CK.OTP_RESEND_BTN}
        </Button>
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
  emiSettings: EmiSettings | null;
  emiTenure: number;
  setEmiTenure: (v: number) => void;
  emiSchedule: ReturnType<typeof computeEmiSchedule> | null;
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
          {showCashOption && (
            <Button
              type="button"
              onClick={handlePlaceCashOrder}
              disabled={isProcessingPayment || cartIsEmpty}
              className={PRIMARY_BTN_CLS}
            >
              {isProcessingPayment ? "Placing order…" : "Pay via UPI / Cash"}
            </Button>
          )}
          {showRazorpay && (
            <Button
              type="button"
              onClick={handlePayOnline}
              disabled={isProcessingPayment || cartIsEmpty}
              className={PRIMARY_BTN_CLS}
            >
              {CK.PAYMENT_ONLINE_BTN}
            </Button>
          )}
          {showCod && (
            <Button
              type="button"
              onClick={handlePlaceCodOrder}
              disabled={isProcessingPayment || cartIsEmpty}
              className="w-full border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] dark:bg-[var(--appkit-color-surface-elevated)] text-[var(--appkit-color-text)] hover:bg-[var(--appkit-color-bg)] dark:hover:bg-[var(--appkit-color-surface-elevated)]"
            >
              {CK.PAYMENT_COD_BTN}
            </Button>
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
                  −₹{(c.discountAmount / 100).toFixed(2)} off
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
    </Div>
  );
}

function renderOrderSummary({
  selectedAddress,
  formattedSubtotal,
  formattedTotal,
  totalDiscount,
  step,
  addressesLoading,
  actionError,
  handleAdvanceToVerification,
}: {
  selectedAddress: Address | null;
  formattedSubtotal: string;
  formattedTotal: string;
  totalDiscount: number;
  step: CheckoutStep;
  addressesLoading: boolean;
  actionError: string;
  handleAdvanceToVerification: () => void;
}) {
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
      <Row color="muted" textSize="sm" className="mb-1" align="center" justify="between">
        <Text>Subtotal</Text>
        <Text>{formattedSubtotal}</Text>
      </Row>
      {totalDiscount > 0 && (
        <Row textSize="sm" className="text-success mb-1" align="center" justify="between">
          <Text>Coupon discount</Text>
          <Text>−₹{(totalDiscount / 100).toFixed(2)}</Text>
        </Row>
      )}
      <Row border="default" className="border-t" padding="t-sm" align="center" justify="between">
        <Text weight="semibold" color="primary">{CK.ORDER_SUMMARY_TOTAL}</Text>
        <Text weight="semibold" color="primary">{formattedTotal}</Text>
      </Row>
      {step === "address" && (
        <Button
          type="button"
          onClick={handleAdvanceToVerification}
          disabled={!selectedAddress || addressesLoading}
          className="mt-4 w-full bg-[var(--appkit-color-text)] text-[var(--appkit-color-bg)] hover:bg-[var(--appkit-color-text)] dark:bg-[var(--appkit-color-bg)] dark:text-[var(--appkit-color-text)]"
        >
          {CK.ADDRESS_CONTINUE_BTN}
        </Button>
      )}
      {actionError && step === "address" && (
        <Text className="mt-2 text-error" size="sm">{actionError}</Text>
      )}
    </Div>
  );
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
}: {
  adminBypassEnabled?: boolean;
  showCashOption?: boolean;
  showRazorpay?: boolean;
  showCod?: boolean;
  showCoupons?: boolean;
  showEmi?: boolean;
  emiSettings?: EmiSettings | null;
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
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- Coupon state ---
  const searchParams = useSearchParams();
  const serverAppliedCoupons: AppliedCoupon[] = cartData?.cart?.appliedCoupons ?? [];
  const [localCoupons, setLocalCoupons] = useState<AppliedCoupon[] | null>(null);
  const effectiveCoupons = localCoupons ?? serverAppliedCoupons;
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  const totalDiscount = effectiveCoupons.reduce((s, c) => s + c.discountAmount, 0);
  const subtotal = cartData?.subtotal ?? 0;
  const effectiveTotal = Math.max(0, subtotal - totalDiscount);
  const cartIsEmpty = (cartData?.cart?.items?.length ?? 0) === 0;

  const { emiTenure, setEmiTenure, emiVisible, emiSchedule, handlePlaceEmiOrder } = useEmiCheckout({
    emiSettings,
    showEmi,
    subtotal,
    cartIsEmpty,
    selectedAddress,
    router,
    showToast,
    setStep,
    setActionError,
    setIsProcessingPayment,
  });

  const handleSelectAddress = useCallback(
    (_addressId: string, address: Address) => {
      setSelectedAddress(address);
    },
    [],
  );

  const handleAdvanceToVerification = useCallback(() => {
    if (!selectedAddress) return;
    setActionError("");
    setStep("otp-consent");
  }, [selectedAddress]);

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
        showToast(`Coupon "${data.data.code}" applied! You saved ₹${(data.data.discountAmount / 100).toFixed(2)}.`, "success");
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

  const handleSendOtp = useCallback(async () => {
    if (!selectedAddress) return;
    setIsSendingOtp(true);
    setActionError("");
    try {
      const result = await sendConsentOtpAction(selectedAddress.id);
      if (!result.ok) {
        const msg = result.error;
        setActionError(msg);
        showToast(msg, "error");
        return;
      }
      setMaskedEmail(result.data.maskedEmail);
      setStep("otp");
      showToast(CK.OTP_SENT_TOAST, "success");
    } catch (err) {
      void normalizeError(err);
      const msg = err instanceof Error ? err.message : "Failed to send OTP";
      setActionError(msg);
      showToast(msg, "error");
    } finally {
      setIsSendingOtp(false);
    }
  }, [selectedAddress, showToast]);

  const handleVerifyOtp = useCallback(async () => {
    if (!selectedAddress || !otpCode) return;
    setIsVerifyingOtp(true);
    setOtpError("");
    try {
      await verifyConsentOtpAction(selectedAddress.id, otpCode);
      setStep("payment");
      showToast(CK.OTP_VERIFIED_TOAST, "success");
    } catch (err) {
      void normalizeError(err);
      const msg = err instanceof Error ? err.message : CK.OTP_ERROR_DEFAULT;
      setOtpError(msg);
      showToast(msg, "error");
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [selectedAddress, otpCode, showToast]);

  const handlePayOnline = useCallback(async () => {
    if (!selectedAddress || !user) return;
    setIsProcessingPayment(true);
    setActionError("");
    setStep("processing");
    try {
      // 1. Create Razorpay order on server
      const createRes = await createRazorpayOrder(subtotal);
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? "Failed to create order",
        );
      }
      const createData = (await createRes.json()) as {
        data: {
          razorpayOrderId: string;
          amount: number;
          currency: string;
          keyId: string;
        };
      };
      const { razorpayOrderId, amount, currency, keyId } = createData.data;

      // 2. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway");

      // 3. Open Razorpay modal
      const rzpResponse = await openRazorpayModal({
        keyId,
        razorpayOrderId,
        amount,
        currency,
        name: process.env.NEXT_PUBLIC_SITE_NAME ?? "LetItRip",
        prefill: {
          email: user.email ?? undefined,
          name: (user as unknown as Record<string, JsonValue>).displayName as string | undefined,
        },
      });

      // 4. Verify payment and place orders
      const verifyRes = await verifyRazorpayPayment({
        razorpay_order_id: rzpResponse.razorpay_order_id,
        razorpay_payment_id: rzpResponse.razorpay_payment_id,
        razorpay_signature: rzpResponse.razorpay_signature,
        addressId: selectedAddress.id,
      });
      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? "Payment verification failed",
        );
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
  }, [selectedAddress, user, subtotal, router, showToast]);

  const handlePlaceCodOrder = useCallback(async () => {
    if (!selectedAddress) return;
    setIsProcessingPayment(true);
    setActionError("");
    setStep("processing");
    try {
      const res = await createCheckoutOrder({
        addressId: selectedAddress.id,
        paymentMethod: "cod",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? ORDER_PLACEMENT_FAILED_MSG,
        );
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
  }, [selectedAddress, router, showToast]);

  const handlePlaceCashOrder = useCallback(async () => {
    if (!selectedAddress) return;
    setIsProcessingPayment(true);
    setActionError("");
    setStep("processing");
    try {
      const res = await createCheckoutOrder({
        addressId: selectedAddress.id,
        paymentMethod: "cash",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? ORDER_PLACEMENT_FAILED_MSG,
        );
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
  }, [selectedAddress, router, showToast]);

  const handleAdminBypass = useCallback(async () => {
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
  }, [selectedAddress, router, showToast, step]);

  // --- Render -----------------------------------------------------------------

  const stepIndex =
    step === "address"
      ? 0
      : step === "otp-consent" || step === "otp"
        ? 1
        : 2;

  const fmtOpts: Intl.NumberFormatOptions = { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 };
  const formattedSubtotal = subtotal.toLocaleString("en-IN", fmtOpts);
  const formattedTotal = effectiveTotal.toLocaleString("en-IN", fmtOpts);

  // Mobile bottom bar — step-dependent primary CTA
  const bottomActions = useMemo(() => {
    if (step === "address") {
      return [{
        id: ACTION_ID.CONTINUE_TO_VERIFY,
        label: CK.ADDRESS_CONTINUE_BTN,
        variant: "primary" as const,
        disabled: !selectedAddress || addressesLoading,
        onClick: handleAdvanceToVerification,
        grow: true,
      }];
    }
    if (step === "otp-consent") {
      return [{
        id: ACTION_ID.SEND_OTP,
        label: isSendingOtp ? CK.OTP_SENDING_BTN : CK.OTP_SEND_BTN,
        variant: "primary" as const,
        disabled: isSendingOtp || isProcessingPayment,
        onClick: () => requireAuth(ACTION_ID.SEND_OTP, handleSendOtp),
        grow: true,
      }];
    }
    if (step === "otp") {
      return [{
        id: ACTION_ID.VERIFY_OTP,
        label: isVerifyingOtp ? CK.OTP_VERIFYING_BTN : CK.OTP_VERIFY_BTN,
        variant: "primary" as const,
        disabled: isVerifyingOtp || otpCode.length < 6,
        onClick: () => requireAuth(ACTION_ID.VERIFY_OTP, handleVerifyOtp),
        grow: true,
      }];
    }
    if (step === "processing") return [];
    return [{
      id: ACTION_ID.PAY_ONLINE,
      label: CK.PAYMENT_ONLINE_BTN,
      variant: "primary" as const,
      disabled: isProcessingPayment || cartIsEmpty,
      onClick: handlePayOnline,
      grow: true,
    }];
  }, [step, selectedAddress, addressesLoading, handleAdvanceToVerification, isSendingOtp, isProcessingPayment, handleSendOtp, isVerifyingOtp, otpCode.length, handleVerifyOtp, cartIsEmpty, handlePayOnline]);

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
          if (step === "otp-consent") {
            return renderOtpConsentStep({ userEmail: user?.email ?? "", isSendingOtp, isProcessingPayment, adminBypassEnabled, handleSendOtp, handleAdminBypass });
          }
          if (step === "otp") {
            return renderOtpStep({ maskedEmail, otpCode, setOtpCode, otpError, isVerifyingOtp, isSendingOtp, handleVerifyOtp, handleSendOtp });
          }
          return (
            <Stack gap="lg">
              {showCoupons && renderCouponSection({ couponCode, setCouponCode, couponError, isCouponLoading, effectiveCoupons, handleApplyCoupon, handleRemoveCoupon })}
              {renderPaymentStep({ step, actionError, isProcessingPayment, cartIsEmpty, adminBypassEnabled, showCashOption, showRazorpay, showCod, emiVisible, emiSettings, emiTenure, setEmiTenure, emiSchedule, handlePayOnline, handlePlaceCodOrder, handlePlaceCashOrder, handlePlaceEmiOrder, handleAdminBypass })}
            </Stack>
          );
        }}
        renderOrderSummary={() => renderOrderSummary({ selectedAddress, formattedSubtotal, formattedTotal, totalDiscount, step, addressesLoading, actionError, handleAdvanceToVerification })}
      />
    </Div>
  );
}
