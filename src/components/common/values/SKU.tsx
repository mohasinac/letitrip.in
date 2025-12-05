/**
 * @fileoverview React Component
 * @module src/components/common/values/SKU
 * @description This file contains the SKU component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * SKU (Stock Keeping Unit) Display Component
 *
 * Displays product SKU with copy functionality.
 *
 * @example
 * <SKU value="PROD-12345" />                 // SKU: PROD-12345
 * <SKU value="PROD-12345" copyable />        // SKU: PROD-12345 [copy button]
 * <SKU value="PROD-12345" label={false} />   // PROD-12345
 */

"use client";

import { logError } from "@/lib/firebase-error-logger";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * SKUProps interface
 * 
 * @interface
 * @description Defines the structure and contract for SKUProps
 */
interface SKUProps {
  /** Value */
  value: string;
  /** Label */
  label?: boolean;
  /** Copyable */
  copyable?: boolean;
  /** Class Name */
  className?: string;
}

/**
 * Function: S K U
 */
/**
 * Performs s k u operation
 *
 * @returns {any} The sku result
 *
 * @example
 * SKU();
 */

/**
 * Performs s k u operation
 *
 * @returns {any} The sku result
 *
 * @example
 * SKU();
 */

export function SKU({
  value,
  label = true,
  copyable = false,
  className,
}: SKUProps) {
  const [copied, setCopied] = useState(false);

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
    } catch (err) {
      logError(err as Error, {
        /** Component */
        component: "SKU.handleCopy",
        /** Metadata */
        metadata: { sku: value },
      });
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-sm",
        "text-gray-600 dark:text-gray-400",
        className,
      )}
    >
      {label && <span className="text-gray-500 dark:text-gray-500">SKU:</span>}
      <span className="text-gray-900 dark:text-white">{value}</span>

      {copyable && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title={copied ? "Copied!" : "Copy SKU"}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </span>
  );
}

export default SKU;
