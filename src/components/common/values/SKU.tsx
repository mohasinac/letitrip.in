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

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SKUProps {
  value: string;
  label?: boolean;
  copyable?: boolean;
  className?: string;
}

export function SKU({
  value,
  label = true,
  copyable = false,
  className,
}: SKUProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy SKU:", err);
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-sm",
        "text-gray-600 dark:text-gray-400",
        className
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
