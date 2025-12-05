/**
 * @fileoverview React Component
 * @module src/components/common/PaymentLogo
 * @description This file contains the PaymentLogo component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import OptimizedImage from "@/components/common/OptimizedImage";
import { logError } from "@/lib/firebase-error-logger";
import { getPaymentLogo } from "@/lib/payment-logos";
import { useEffect, useState } from "react";

/**
 * PaymentLogoProps interface
 * 
 * @interface
 * @description Defines the structure and contract for PaymentLogoProps
 */
interface PaymentLogoProps {
  /** Payment Id */
  paymentId: string;
  /** Name */
  name: string;
  /** Class Name */
  className?: string;
  /** Show Name */
  showName?: boolean;
}

/**
 * Function: Payment Logo
 */
/**
 * Performs payment logo operation
 *
 * @returns {any} The paymentlogo result
 *
 * @example
 * PaymentLogo();
 */

/**
 * Performs payment logo operation
 *
 * @returns {any} The paymentlogo result
 *
 * @example
 * PaymentLogo();
 */

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

    /**
     * Performs async operation
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    /**
     * Performs async operation
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

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
          /** Component */
          component: "PaymentLogo.useEffect",
          /** Metadata */
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
