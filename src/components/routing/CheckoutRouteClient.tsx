"use client";

import { useCallback, useState } from "react";
import {
  Button,
  CheckoutAddressStep,
  CheckoutView,
  Div,
  Heading,
  Input,
  Stack,
  Text,
  useAddresses,
  useAuth,
  useCartQuery,
} from "@mohasinac/appkit/client";
import type { Address } from "@mohasinac/appkit/client";
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

type CheckoutStep = "address" | "otp" | "payment" | "processing";

// --- Component ---------------------------------------------------------------

export function CheckoutRouteClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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
    (addressId: string, address: Address) => {
      setSelectedAddress(address);
    },
    [],
  );

  const handleProceedToOtp = useCallback(async () => {
    if (!selectedAddress) return;
    setIsSendingOtp(true);
    setActionError("");
    try {
      const result = await sendConsentOtpAction(selectedAddress.id);
      setMaskedEmail(result.maskedEmail);
      setStep("otp");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to send OTP",
      );
    } finally {
      setIsSendingOtp(false);
    }
  }, [selectedAddress]);

  const handleVerifyOtp = useCallback(async () => {
    if (!selectedAddress || !otpCode) return;
    setIsVerifyingOtp(true);
    setOtpError("");
    try {
      await verifyConsentOtpAction(selectedAddress.id, otpCode);
      setStep("payment");
    } catch (err) {
      setOtpError(
        err instanceof Error ? err.message : "Invalid OTP. Please try again.",
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [selectedAddress, otpCode]);

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

      router.push("/checkout/success");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Payment failed. Please retry.",
      );
      setStep("payment");
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedAddress, user, subtotal, router]);

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
      router.push("/checkout/success");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Order failed. Please retry.",
      );
      setStep("payment");
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedAddress, router]);

  // --- Redirect unauthenticated users ----------------------------------------

  if (!authLoading && !user) {
    router.push("/login?returnTo=/checkout");
    return null;
  }

  // --- Render -----------------------------------------------------------------

  const stepIndex =
    step === "address" ? 0 : step === "otp" ? 1 : step === "payment" ? 2 : 2;

  return (
    <CheckoutView
      labels={{ title: "Checkout" }}
      totalSteps={3}
      activeStep={stepIndex}
      renderStepIndicator={(activeStep, totalSteps) => (
        <Text className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Step {activeStep + 1} of {totalSteps}:{" "}
          {activeStep === 0
            ? "Shipping Address"
            : activeStep === 1
              ? "Verify Identity"
              : "Payment"}
        </Text>
      )}
      renderStep={() => {
        // Address step
        if (step === "address") {
          return (
            <CheckoutAddressStep
              labels={{ title: "Select Shipping Address" }}
              addresses={addresses ?? []}
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
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                  No saved addresses. Please add one in your profile.
                </Text>
              )}
            />
          );
        }

        // OTP step
        if (step === "otp") {
          return (
            <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <Heading level={2} className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Verify Your Identity
              </Heading>
              <Text className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                A verification code has been sent to {maskedEmail}. Enter it
                below to continue.
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
                  className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {isVerifyingOtp ? "Verifying…" : "Verify Code"}
                </Button>
                <Button
                  type="button"
                  onClick={handleProceedToOtp}
                  disabled={isSendingOtp}
                  className="w-full text-sm text-zinc-600 dark:text-zinc-400 underline"
                >
                  {isSendingOtp ? "Resending…" : "Resend code"}
                </Button>
              </Stack>
            </Div>
          );
        }

        // Payment step / processing
        return (
          <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <Heading level={2} className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {step === "processing" ? "Processing…" : "Choose Payment Method"}
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
                  className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
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
              </Stack>
            )}
          </Div>
        );
      }}
      renderOrderSummary={() => (
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
            <Text className="font-semibold text-zinc-900 dark:text-zinc-100">
              Total
            </Text>
            <Text className="font-semibold text-zinc-900 dark:text-zinc-100">
              &#x20B9;{subtotal.toFixed(2)}
            </Text>
          </Div>
          {step === "address" && (
            <Button
              type="button"
              onClick={handleProceedToOtp}
              disabled={!selectedAddress || isSendingOtp || addressesLoading}
              className="mt-4 w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {isSendingOtp ? "Sending OTP…" : "Continue"}
            </Button>
          )}
          {actionError && step === "address" && (
            <Text className="mt-2 text-sm text-red-600">{actionError}</Text>
          )}
        </Div>
      )}
    />
  );
}
