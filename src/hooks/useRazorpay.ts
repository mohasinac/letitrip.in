"use client";

/**
 * useRazorpay Hook
 *
 * Loads the Razorpay checkout.js script and provides a function to open
 * the Razorpay payment modal.
 *
 * Usage:
 * ```tsx
 * const { openRazorpay, isLoading } = useRazorpay();
 *
 * await openRazorpay({
 *   key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
 *   amount: 50000, // paise
 *   currency: "INR",
 *   order_id: "order_xxxxx",
 *   name: "LetItRip",
 *   description: "Order Payment",
 *   prefill: { name, email },
 *   theme: { color: "#6366f1" },
 *   handler: (response) => { ... }
 * });
 * ```
 */

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpayPaymentResponse) => void;
}

interface RazorpayInstance {
  open(): void;
  close(): void;
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

function isScriptLoaded(): boolean {
  return (
    typeof window !== "undefined" && typeof window.Razorpay !== "undefined"
  );
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(!isScriptLoaded());
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (isScriptLoaded()) {
      setIsLoading(false);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`,
    );

    if (existing) {
      existing.addEventListener("load", () => setIsLoading(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => setIsLoading(false);
    script.onerror = () => setIsLoading(false); // Still let UI proceed
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Don't remove script on cleanup — it may be used elsewhere
    };
  }, []);

  const openRazorpay = (
    options: RazorpayOptions,
  ): Promise<RazorpayPaymentResponse> => {
    return new Promise((resolve, reject) => {
      if (!isScriptLoaded()) {
        reject(new Error("Razorpay script not loaded"));
        return;
      }

      const rzp = new window.Razorpay({
        ...options,
        handler: (response) => {
          resolve(response);
          options.handler?.(response);
        },
        modal: {
          ondismiss: () => {
            reject(new Error("Payment cancelled by user"));
            options.modal?.ondismiss?.();
          },
        },
      });

      rzp.open();
    });
  };

  return { openRazorpay, isLoading };
}
