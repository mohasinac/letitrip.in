/**
 * useCheckoutState Hook
 * Manages multi-step checkout form state
 *
 * Purpose: Centralize checkout-specific state management
 * Replaces: Multiple useState calls in checkout page
 *
 * @example
 * const checkout = useCheckoutState();
 * checkout.setCurrentStep('payment');
 * checkout.setShippingAddress(address);
 */

import type { AddressFE } from "@/types/frontend/address.types";
import { useCallback, useState } from "react";

export type CheckoutStep = "address" | "payment" | "review";

export interface UseCheckoutStateReturn {
  // Step management
  currentStep: CheckoutStep;
  setCurrentStep: (step: CheckoutStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  stepProgress: number;

  // Address
  shippingAddressId: string;
  setShippingAddressId: (id: string) => void;
  shippingAddress: AddressFE | null;
  setShippingAddress: (address: AddressFE | null) => void;
  billingAddressId: string;
  setBillingAddressId: (id: string) => void;
  useSameAddress: boolean;
  setUseSameAddress: (use: boolean) => void;

  // Payment
  paymentMethod: "razorpay" | "paypal" | "cod";
  setPaymentMethod: (method: "razorpay" | "paypal" | "cod") => void;
  currency: "INR" | "USD" | "EUR" | "GBP";
  setCurrency: (currency: "INR" | "USD" | "EUR" | "GBP") => void;

  // Notes and metadata
  notes: string;
  setNotes: (notes: string) => void;

  // Processing
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  validationErrors: Record<string, string>;
  setValidationErrors: (errors: Record<string, string>) => void;

  // Coupons
  shopCoupons: Record<string, { code: string; discountAmount: number }>;
  setShopCoupons: (
    coupons: Record<string, { code: string; discountAmount: number }>
  ) => void;
  applyCoupon: (shopId: string, code: string, discountAmount: number) => void;
  removeCoupon: (shopId: string) => void;

  // Gateways
  availableGateways: string[];
  setAvailableGateways: (gateways: string[]) => void;
  loadingGateways: boolean;
  setLoadingGateways: (loading: boolean) => void;

  // International
  isInternational: boolean;
  setIsInternational: (international: boolean) => void;

  // Reset
  reset: () => void;
}

const CHECKOUT_STEPS: CheckoutStep[] = ["address", "payment", "review"];

export function useCheckoutState(): UseCheckoutStateReturn {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [shippingAddressId, setShippingAddressId] = useState("");
  const [shippingAddress, setShippingAddress] = useState<AddressFE | null>(
    null
  );
  const [billingAddressId, setBillingAddressId] = useState("");
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<
    "razorpay" | "paypal" | "cod"
  >("razorpay");
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP">(
    "INR"
  );
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [shopCoupons, setShopCoupons] = useState<
    Record<string, { code: string; discountAmount: number }>
  >({});
  const [availableGateways, setAvailableGateways] = useState<string[]>([
    "razorpay",
    "cod",
  ]);
  const [loadingGateways, setLoadingGateways] = useState(false);
  const [isInternational, setIsInternational] = useState(false);

  const currentStepIndex = CHECKOUT_STEPS.indexOf(currentStep);
  const isLastStep = currentStepIndex === CHECKOUT_STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const stepProgress = ((currentStepIndex + 1) / CHECKOUT_STEPS.length) * 100;

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      setCurrentStep(CHECKOUT_STEPS[currentStepIndex + 1]);
    }
  }, [currentStepIndex, isLastStep]);

  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(CHECKOUT_STEPS[currentStepIndex - 1]);
    }
  }, [currentStepIndex, isFirstStep]);

  const applyCoupon = useCallback(
    (shopId: string, code: string, discountAmount: number) => {
      setShopCoupons((prev) => ({
        ...prev,
        [shopId]: { code, discountAmount },
      }));
    },
    []
  );

  const removeCoupon = useCallback((shopId: string) => {
    setShopCoupons((prev) => {
      const newCoupons = { ...prev };
      delete newCoupons[shopId];
      return newCoupons;
    });
  }, []);

  const reset = useCallback(() => {
    setCurrentStep("address");
    setShippingAddressId("");
    setShippingAddress(null);
    setBillingAddressId("");
    setUseSameAddress(true);
    setPaymentMethod("razorpay");
    setCurrency("INR");
    setNotes("");
    setProcessing(false);
    setError(null);
    setValidationErrors({});
    setShopCoupons({});
    setAvailableGateways(["razorpay", "cod"]);
    setLoadingGateways(false);
    setIsInternational(false);
  }, []);

  return {
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    isLastStep,
    isFirstStep,
    stepProgress,

    shippingAddressId,
    setShippingAddressId,
    shippingAddress,
    setShippingAddress,
    billingAddressId,
    setBillingAddressId,
    useSameAddress,
    setUseSameAddress,

    paymentMethod,
    setPaymentMethod,
    currency,
    setCurrency,

    notes,
    setNotes,

    processing,
    setProcessing,
    error,
    setError,
    validationErrors,
    setValidationErrors,

    shopCoupons,
    setShopCoupons,
    applyCoupon,
    removeCoupon,

    availableGateways,
    setAvailableGateways,
    loadingGateways,
    setLoadingGateways,

    isInternational,
    setIsInternational,

    reset,
  };
}
