/**
 * @fileoverview React Component
 * @module src/components/common/values/OrderId
 * @description This file contains the OrderId component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Order ID Display Component
 *
 * Displays order IDs in a consistent format with optional copy functionality.
 *
 * @example
 * <OrderId value="abc123xyz" />                    // #ORD-ABC123XY
 * <OrderId value="abc123xyz" copyable />           // With copy button
 * <OrderId value="abc123xyz" format="full" />      // Full ID shown
 */

"use client";

import { logError } from "@/lib/firebase-error-logger";
import { formatOrderId } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * OrderIdProps interface
 * 
 * @interface
 * @description Defines the structure and contract for OrderIdProps
 */
interface OrderIdProps {
  /** Value */
  value: string;
  /** Copyable */
  copyable?: boolean;
  /** Format */
  format?: "short" | "full";
  /** Class Name */
  className?: string;
}

/**
 * Function: Order Id
 */
/**
 * Performs order id operation
 *
 * @returns {any} The orderid result
 *
 * @example
 * OrderId();
 */

/**
 * Performs order id operation
 *
 * @returns {any} The orderid result
 *
 * @example
 * OrderId();
 */

export function OrderId({
  value,
  copyable = false,
  format = "short",
  className,
}: OrderIdProps) {
  const [copied, setCopied] = useState(false);

  const displayValue = format === "full" ? value : formatOrderId(value);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "OrderId.handleCopy",
        /** Metadata */
        metadata: { orderId: value },
      });
    }
  };

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <code className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-900 dark:text-white">
        {displayValue}
      </code>

      {copyable && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      )}
    </span>
  );
}
