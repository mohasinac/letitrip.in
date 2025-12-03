/**
 * Address Display Component
 *
 * Displays addresses in a consistent format.
 *
 * @example
 * <Address address={{ line1: "123 Main St", city: "Mumbai", state: "MH", pincode: "400001" }} />
 * <Address address={...} format="single-line" />
 * <Address address={...} format="multi-line" />
 */

"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { formatAddress } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface AddressData {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

interface AddressProps {
  address: AddressData;
  format?: "single-line" | "multi-line" | "compact";
  showIcon?: boolean;
  className?: string;
}

export function Address({
  address,
  format = "multi-line",
  showIcon = false,
  className,
}: AddressProps) {
  if (format === "single-line") {
    return (
      <span
        className={cn(
          "text-gray-600 dark:text-gray-400 inline-flex items-start gap-2",
          className,
        )}
      >
        {showIcon && <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />}
        <span>{formatAddress(address)}</span>
      </span>
    );
  }

  if (format === "compact") {
    return (
      <span
        className={cn(
          "text-gray-600 dark:text-gray-400 inline-flex items-start gap-2",
          className,
        )}
      >
        {showIcon && <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />}
        <span>
          {address.city}, {address.state} {address.pincode}
        </span>
      </span>
    );
  }

  // Multi-line format (default)
  return (
    <address
      className={cn("not-italic text-gray-600 dark:text-gray-400", className)}
    >
      <div className="flex items-start gap-2">
        {showIcon && <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />}
        <div>
          <div>{address.line1}</div>
          {address.line2 && <div>{address.line2}</div>}
          <div>
            {address.city}, {address.state} {address.pincode}
          </div>
          {address.country && address.country !== "India" && (
            <div>{address.country}</div>
          )}
        </div>
      </div>
    </address>
  );
}
