"use client";
// audit-auth-gates-ok — checkout page is protected by server-side layout auth redirect

import { useCallback, useState } from "react";
import {
  AddressForm,
  Button,
  CheckoutAddressStep,
  CheckoutView,
  Div,
  Heading,
  Input,
  SideDrawer,
  Stack,
  Text,
  useAddresses,
  useAuth,
  useCartQuery,
  useCreateAddress,
  useToast,
  ROUTES,
} from "@mohasinac/appkit/client";
import type { Address, AddressFormData } from "@mohasinac/appkit/client";
import { useRouter } from "next/navigation";
import {
  sendConsentOtpAction,
  verifyConsentOtpAction,
} from "@/actions/checkout.actions";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

interface ServerCartResponse {
  cart: { items: unknown[] };
  subtotal: number;
  itemCount: number;
}

type CheckoutStep = "address" | "otp-consent" | "otp" | "payment" | "processing";

// --- Shared class strings ----------------------------------------------------

const STEP_CARD_CLS = "rounded-xl border border-zinc-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900";
const STEP_SUBLABEL_CLS = "text-sm text-zinc-500 dark:text-zinc-400";
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

const STEP_LABELS = ["Shipping Address", "Identity Verification", "Payment"];

function renderStepIndicator(activeStep: number, totalSteps: number) {
  return (
    <Text className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
      Step {activeStep + 1} of {totalSteps}:{" "}
      <span className="font-medium text-zinc-700 dark:text-zinc-300">
        {STEP_LABELS[activeStep] ?? ""}
      </span>
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
      labels={{ title: "Select Shipping Address" }}
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
        <Div className="rounded-xl border border-dashed border-zinc-300 dark:border-slate-600 p-6 text-center">
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
        Verify Your Identity
      </Heading>
      <Text className={STEP_SUBLABEL_CLS}>
        Step 2 of 3 — Identity Verification
      </Text>
      <Text className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
        To keep your account secure, we need to verify it's really you before placing this order.
        We'll send a one-time code to{" "}
        <span className="font-medium text-zinc-800 dark:text-zinc-200">{maskedDisplay}</span>.
      </Text>
      <Stack gap="md">
        <Button
          type="button"
          onClick={handleSendOtp}
          disabled={isSendingOtp}
          className={PRIMARY_BTN_CLS}
        >
          {isSendingOtp ? "Sending code…" : "Send verification code"}
        </Button>
        {adminBypassEnabled && (
          <Div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
            <Text className="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              Admin Test Mode
            </Text>
            <Text className="mb-2 text-xs text-amber-600 dark:text-amber-500">
              Skip email verification and place a test order without payment.
            </Text>
            <Button
              type="button"
              onClick={handleAdminBypass}
              disabled={isProcessingPayment}
              className="w-full border border-amber-400 dark:border-amber-600 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-sm"
            >
              Skip Verification — Admin Bypass
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
        Enter Verification Code
      </Heading>
      <Text className={STEP_SUBLABEL_CLS}>
        Step 2 of 3 — Identity Verification
      </Text>
      <Text className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        A 6-digit code was sent to{" "}
        <span className="font-medium text-zinc-800 dark:text-zinc-200">{maskedEmail}</span>.
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
          className="tracking-widest text-center text-xl"
        />
        {otpError && (
          <Text className="text-sm text-red-600">{otpError}</Text>
        )}
        <Button
          type="button"
          onClick={handleVerifyOtp}
          disabled={isVerifyingOtp || otpCode.length < 6}
          className={PRIMARY_BTN_CLS}
        >
          {isVerifyingOtp ? "Verifying…" : "Verify & Continue"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleSendOtp}
          disabled={isSendingOtp}
          className="w-full text-sm text-zinc-600 dark:text-zinc-400 underline"
        >
          {isSendingOtp ? "Resending…" : "Resend code"}
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
          Step 3 of 3 — Payment
        </Text>
      )}
      <Heading level={2} className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {step === "processing" ? "Processing your order…" : "Choose Payment Method"}
      </Heading>
      {step === "processing" ? (
        <Div className="h-20 animate-pulse rounded-lg bg-zinc-100 dark:bg-slate-800" />
      ) : (
        <Stack gap="md">
          {actionError && (
            <Text className="text-sm text-red-600">{actionError}</Text>
          )}
          <Button
            type="button"
            onClick={handlePayOnline}
            disabled={isProcessingPayment || cartIsEmpty}
            className={PRIMARY_BTN_CLS}
          >
            Pay Online (Razorpay)
          </Button>
          <Button
            type="button"
            onClick={handlePlaceCodOrder}
            disabled={isProcessingPayment || cartIsEmpty}
            className="w-full border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-slate-700"
          >
            Cash on Delivery
          </Button>
          {adminBypassEnabled && (
            <Div className="mt-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
              <Text className="mb-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Admin Test Mode
              </Text>
              <Button
                type="button"
                onClick={handleAdminBypass}
                disabled={isProcessingPayment || cartIsEmpty}
                className="w-full border border-amber-400 dark:border-amber-600 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-sm"
              >
                No Payment — Admin Bypass Order
              </Button>
              <Text className="mt-1.5 text-xs text-amber-600 dark:text-amber-500">
                Creates a real order record. No money charged.
              </Text>
            </Div>
          )}
        </Stack>
      )}
    </Div>
  );
}

function renderOrderSummary({
  selectedAddress,
  formattedTotal,
  step,
  addressesLoading,
  actionError,
  handleAdvanceToVerification,
}: {
  selectedAddress: Address | null;
  formattedTotal: string;
  step: CheckoutStep;
  addressesLoading: boolean;
  actionError: string;
  handleAdvanceToVerification: () => void;
}) {
  return (
    <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <Heading level={3} className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Order Summary
      </Heading>
      {selectedAddress && (
        <Div className="mb-3 rounded-lg bg-zinc-50 dark:bg-slate-800 p-3">
          <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">
            Shipping to
          </Text>
          <Text className="text-sm text-zinc-900 dark:text-zinc-100">
            {selectedAddress.fullName}
          </Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            {selectedAddress.addressLine1}, {selectedAddress.city}
          </Text>
        </Div>
      )}
      <Div className="flex justify-between items-center border-t border-zinc-200 dark:border-slate-700 pt-3">
        <Text className="font-semibold text-zinc-900 dark:text-zinc-100">Total</Text>
        <Text className="font-semibold text-zinc-900 dark:text-zinc-100">{formattedTotal}</Text>
      </Div>
      {step === "address" && (
        <Button
          type="button"
          onClick={handleAdvanceToVerification}
          disabled={!selectedAddress || addressesLoading}
          className="mt-4 w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Continue to Verification
        </Button>
      )}
      {actionError && step === "address" && (
        <Text className="mt-2 text-sm text-red-600">{actionError}</Text>
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

  const subtotal = cartData?.subtotal ?? 0;
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

  const handleSendOtp = useCallback(async () => {
    if (!selectedAddress) return;
    setIsSendingOtp(true);
    setActionError("");
    try {
      const result = await sendConsentOtpAction(selectedAddress.id);
      setMaskedEmail(result.maskedEmail);
      setStep("otp");
      showToast("Verification code sent to your email.", "success");
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
      showToast("Identity verified. Choose a payment method.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid code. Please try again.";
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
      router.push(firstOrderId ? `/checkout/success?orderId=${firstOrderId}` : "/checkout/success");
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
      router.push(firstCodOrderId ? `/checkout/success?orderId=${firstCodOrderId}` : "/checkout/success");
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
      showToast("Admin bypass order placed (test). No real payment charged.", "success");
      router.push(firstOrderId ? `/checkout/success?orderId=${firstOrderId}` : "/checkout/success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Admin bypass failed. Please retry.";
      setActionError(msg);
      showToast(msg, "error");
      setStep(step === "processing" ? "payment" : step);
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedAddress, router, showToast, step]);

  // --- Redirect unauthenticated users ----------------------------------------

  if (!authLoading && !user) {
    router.push(`${String(ROUTES.AUTH.LOGIN)}?returnTo=${String(ROUTES.USER.CHECKOUT)}`);
    return null;
  }

  // --- Render -----------------------------------------------------------------

  const stepIndex =
    step === "address"
      ? 0
      : step === "otp-consent" || step === "otp"
        ? 1
        : 2;

  const formattedTotal = subtotal.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {renderAddressDrawer({ addAddressDrawerOpen, setAddAddressDrawerOpen, handleAddressFormSubmit, isCreatingAddress })}
      <CheckoutView
        labels={{ title: "Checkout" }}
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
          return renderPaymentStep({ step, actionError, isProcessingPayment, cartIsEmpty, adminBypassEnabled, handlePayOnline, handlePlaceCodOrder, handleAdminBypass });
        }}
        renderOrderSummary={() => renderOrderSummary({ selectedAddress, formattedTotal, step, addressesLoading, actionError, handleAdvanceToVerification })}
      />
    </Div>
  );
}
