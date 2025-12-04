"use client";

import OptimizedImage from "@/components/common/OptimizedImage";
import { logError } from "@/lib/firebase-error-logger";
import { getPaymentLogo } from "@/lib/payment-logos";
import { useEffect, useState } from "react";

interface PaymentLogoProps {
  paymentId: string;
  name: string;
  className?: string;
  showName?: boolean;
}

export function PaymentLogo({
  paymentId,
  name,
  className = "",
  showName = false,
}: PaymentLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadLogo = async () => {
      try {
        setLoading(true);
        const url = await getPaymentLogo(paymentId);
        if (mounted) {
          setLogoUrl(url);
          setError(false);
        }
      } catch (err) {
        logError(err as Error, {
          component: "PaymentLogo.useEffect",
          metadata: { paymentId },
        });
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadLogo();

    return () => {
      mounted = false;
    };
  }, [paymentId]);

  if (loading) {
    return (
      <div
        className={`animate-pulse bg-gray-200 rounded ${className}`}
        style={{ minWidth: "50px", minHeight: "20px" }}
      />
    );
  }

  if (error || !logoUrl) {
    return showName ? (
      <span className={`text-xs text-gray-600 font-medium ${className}`}>
        {name}
      </span>
    ) : null;
  }

  return (
    <OptimizedImage
      src={logoUrl}
      alt={name}
      width={50}
      height={20}
      className={className}
      objectFit="contain"
      onError={() => setError(true)}
    />
  );
}

export default PaymentLogo;
