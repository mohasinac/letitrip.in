"use client";
// audit-auth-gates-ok — checkout page is protected by server-side layout auth redirect

import { useCallback, useState, useEffect, useMemo } from "react";
import {
  AddressForm,
  Button,
  CheckoutAddressStep,
  CheckoutView,
  Div,
  Heading,
  Input,
  Row,
  SideDrawer,
  Span,
  Stack,
  Text,
  useAddresses,
  useAuth,
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
import { UI_LABELS } from "@/constants";

const __P = {
  p3: "p-3",
  p6: "p-6",
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
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).Razorpay) {
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
  cart: { items: unknown[]; appliedCoupons?: AppliedCoupon[] };
  subtotal: number;
  itemCount: number;
}

type CheckoutStep = "address" | "otp-consent" | "otp" | "payment" | "processing";

// --- Shared class strings ----------------------------------------------------

const STEP_CARD_CLS = "rounded-xl border border-zinc-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900";
const STEP_SUBLABEL_CLS = "text-sm text-zinc-500 dark:text-zinc-400";
const CLS_APPLIED_COUPON_ROW = "rounded-lg bg-success-surface border border-success px-3 py-2";
const PRIMARY_BTN_CLS = "w-full rounded-lg bg-[var(--appkit-color-primary)] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50";

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
    <Text className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
      Step {activeStep + 1} of {totalSteps}:{" "}
      <Span weight="medium" className="text-zinc-700 dark:text-zinc-300">
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
        <Div
          key={address.id}
          onClick={select}
          className={`cursor-pointer rounded-xl border p-4 transition ${
            isSelected
              ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-slate-800"
              : "border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          }`}
        >
          <Text className="font-medium text-zinc-900 dark:text-zinc-100">
            {address.label ?? address.fullName}
          </Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            {address.addressLine1}
            {address.addressLine2 ? `, ${address.addressLine2}` : ""}
          </Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            {address.city}, {address.state} {address.postalCode}
          </Text>
        </Div>
      )}
      renderEmptyState={() => (
        <Div className={`rounded-xl border border-dashed border-zinc-300 dark:border-slate-600 ${__P.p6} text-center`}>
          <Text className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            No saved addresses yet.
          </Text>
          <Button
            type="button"
            onClick={() => setAddAddressDrawerOpen(true)}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
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
      <Heading level={2} className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {CK.OTP_CONSENT_HEADING}
      </Heading>
      <Text className={STEP_SUBLABEL_CLS}>
        {CK.OTP_CONSENT_SUBLABEL}
      </Text>
      <Text className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
        {CK.OTP_CONSENT_BODY_PREFIX}{" "}
        <Span weight="medium" className="text-zinc-800 dark:text-zinc-200">{maskedDisplay}</Span>.
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
          <Div className={`rounded-lg border border-warning/30 bg-warning-surface ${__P.p3}`}>
            <Text className="mb-1 text-xs font-semibold text-warning uppercase tracking-wide">
              {CK.ADMIN_BYPASS_PANEL_LABEL}
            </Text>
            <Text className="mb-2 text-xs text-warning">
              {CK.ADMIN_BYPASS_CONSENT_DESC}
            </Text>
            <Button
              type="button"
              onClick={handleAdminBypass}
              disabled={isProcessingPayment}
              className="w-full border border-warning/40 bg-warning-surface text-warning hover:opacity-80 text-sm"
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
      <Heading level={2} className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {CK.OTP_ENTRY_HEADING}
      </Heading>
      <Text className={STEP_SUBLABEL_CLS}>
        {CK.OTP_ENTRY_SUBLABEL}
      </Text>
      <Text className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        {CK.OTP_ENTRY_BODY_PREFIX}{" "}
        <Span weight="medium" className="text-zinc-800 dark:text-zinc-200">{maskedEmail}</Span>.{" "}
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
          className="tracking-widest text-center text-xl"
        />
        {otpError && (
          <Text className="text-sm text-error">{otpError}</Text>
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
          className="w-full text-sm text-zinc-600 dark:text-zinc-400 underline"
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
  handlePayOnline,
  handlePlaceCodOrder,
  handleAdminBypass,
}: {
  step: CheckoutStep;
  actionError: string;
  isProcessingPayment: boolean;
  cartIsEmpty: boolean;
  adminBypassEnabled: boolean;
  handlePayOnline: () => Promise<void>;
  handlePlaceCodOrder: () => Promise<void>;
  handleAdminBypass: () => Promise<void>;
}) {
  return (
    <Div className={STEP_CARD_CLS}>
      {step !== "processing" && (
        <Text className={STEP_SUBLABEL_CLS}>
          {CK.PAYMENT_SUBLABEL}
        </Text>
      )}
      <Heading level={2} className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {step === "processing" ? CK.PAYMENT_PROCESSING_HEADING : CK.PAYMENT_HEADING}
      </Heading>
      {step === "processing" ? (
        <Div className="h-20 animate-pulse rounded-lg bg-zinc-100 dark:bg-slate-800" />
      ) : (
        <Stack gap="md">
          {actionError && (
            <Text className="text-sm text-error">{actionError}</Text>
          )}
          <Button
            type="button"
            onClick={handlePayOnline}
            disabled={isProcessingPayment || cartIsEmpty}
            className={PRIMARY_BTN_CLS}
          >
            {CK.PAYMENT_ONLINE_BTN}
          </Button>
          <Button
            type="button"
            onClick={handlePlaceCodOrder}
            disabled={isProcessingPayment || cartIsEmpty}
            className="w-full border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-slate-700"
          >
            {CK.PAYMENT_COD_BTN}
          </Button>
          {adminBypassEnabled && (
            <Div className={`mt-1 rounded-lg border border-warning/30 bg-warning-surface ${__P.p3}`}>
              <Text className="mb-2 text-xs font-semibold text-warning uppercase tracking-wide">
                {CK.ADMIN_BYPASS_PANEL_LABEL}
              </Text>
              <Button
                type="button"
                onClick={handleAdminBypass}
                disabled={isProcessingPayment || cartIsEmpty}
                className="w-full border border-warning/40 bg-warning-surface text-warning hover:opacity-80 text-sm"
              >
                {CK.ADMIN_BYPASS_PAYMENT_BTN}
              </Button>
              <Text className="mt-1.5 text-xs text-warning">
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
      <Heading level={3} className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Coupon
      </Heading>
      {effectiveCoupons.length > 0 && (
        <Stack gap="xs" className="mb-3">
          {effectiveCoupons.map((c) => (
            <Row key={c.code} justify="between" className={CLS_APPLIED_COUPON_ROW}>
              <Div>
                <Text className="text-sm font-medium text-success">{c.code}</Text>
                <Text className="text-xs text-success">
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
          className="h-9 text-sm flex-1"
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
        <Text className="mt-1.5 text-xs text-error">{couponError}</Text>
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
      <Heading level={3} className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {CK.ORDER_SUMMARY_HEADING}
      </Heading>
      {selectedAddress && (
        <Div className={`mb-3 rounded-lg bg-zinc-50 dark:bg-slate-800 ${__P.p3}`}>
          <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">
            {CK.SHIPPING_TO}
          </Text>
          <Text className="text-sm text-zinc-900 dark:text-zinc-100">
            {selectedAddress.fullName}
          </Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            {selectedAddress.addressLine1}, {selectedAddress.city}
          </Text>
        </Div>
      )}
      <Div className="flex justify-between items-center text-sm text-zinc-600 dark:text-zinc-400 mb-1">
        <Text>Subtotal</Text>
        <Text>{formattedSubtotal}</Text>
      </Div>
      {totalDiscount > 0 && (
        <Div className="flex justify-between items-center text-sm text-success mb-1">
          <Text>Coupon discount</Text>
          <Text>−₹{(totalDiscount / 100).toFixed(2)}</Text>
        </Div>
      )}
      <Div className="flex justify-between items-center border-t border-zinc-200 dark:border-slate-700 pt-3">
        <Text className="font-semibold text-zinc-900 dark:text-zinc-100">{CK.ORDER_SUMMARY_TOTAL}</Text>
        <Text className="font-semibold text-zinc-900 dark:text-zinc-100">{formattedTotal}</Text>
      </Div>
      {step === "address" && (
        <Button
          type="button"
          onClick={handleAdvanceToVerification}
          disabled={!selectedAddress || addressesLoading}
          className="mt-4 w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {CK.ADDRESS_CONTINUE_BTN}
        </Button>
      )}
      {actionError && step === "address" && (
        <Text className="mt-2 text-sm text-error">{actionError}</Text>
      )}
    </Div>
  );
}

// --- Component ---------------------------------------------------------------

export function CheckoutRouteClient({ adminBypassEnabled = false }: { adminBypassEnabled?: boolean }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const { data: addresses, isLoading: addressesLoading } = useAddresses({
    enabled: !!user?.uid,
  });

  const { data: cartData } = useCartQuery<ServerCartResponse>({
    endpoint: "/api/cart",
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
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      });
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
    } catch {
      setCouponError("Failed to apply coupon. Please try again.");
    } finally {
      setIsCouponLoading(false);
    }
  }, [couponCode, effectiveCoupons, showToast]);

  const handleRemoveCoupon = useCallback(
    async (code: string) => {
      setLocalCoupons((prev) => (prev ?? effectiveCoupons).filter((c) => c.code !== code));
      try {
        await fetch("/api/cart/coupon", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
          credentials: "include",
        });
      } catch { /* best-effort */ }
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
      setMaskedEmail(result.maskedEmail);
      setStep("otp");
      showToast(CK.OTP_SENT_TOAST, "success");
    } catch (err) {
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
      const createRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: subtotal }),
        credentials: "include",
      });
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
          name: (user as unknown as Record<string, unknown>).displayName as string | undefined,
        },
      });

      // 4. Verify payment and place orders
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: rzpResponse.razorpay_order_id,
          razorpay_payment_id: rzpResponse.razorpay_payment_id,
          razorpay_signature: rzpResponse.razorpay_signature,
          addressId: selectedAddress.id,
        }),
        credentials: "include",
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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddress.id,
          paymentMethod: "cod",
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? "Order placement failed",
        );
      }
      const codData = await res.json().catch(() => ({}));
      const firstCodOrderId = (codData?.data?.orderIds as string[] | undefined)?.[0];
      showToast("Order placed successfully! Cash on delivery confirmed.", "success");
      router.push(firstCodOrderId ? `${String(ROUTES.USER.CHECKOUT_SUCCESS)}?orderId=${firstCodOrderId}` : String(ROUTES.USER.CHECKOUT_SUCCESS));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Order failed. Please retry.";
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
      const res = await fetch("/api/admin/checkout-bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedAddress.id }),
        credentials: "include",
      });
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
        onClick: handleSendOtp,
        grow: true,
      }];
    }
    if (step === "otp") {
      return [{
        id: ACTION_ID.VERIFY_OTP,
        label: isVerifyingOtp ? CK.OTP_VERIFYING_BTN : CK.OTP_VERIFY_BTN,
        variant: "primary" as const,
        disabled: isVerifyingOtp || otpCode.length < 6,
        onClick: handleVerifyOtp,
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
              {renderCouponSection({ couponCode, setCouponCode, couponError, isCouponLoading, effectiveCoupons, handleApplyCoupon, handleRemoveCoupon })}
              {renderPaymentStep({ step, actionError, isProcessingPayment, cartIsEmpty, adminBypassEnabled, handlePayOnline, handlePlaceCodOrder, handleAdminBypass })}
            </Stack>
          );
        }}
        renderOrderSummary={() => renderOrderSummary({ selectedAddress, formattedSubtotal, formattedTotal, totalDiscount, step, addressesLoading, actionError, handleAdvanceToVerification })}
      />
    </Div>
  );
}
