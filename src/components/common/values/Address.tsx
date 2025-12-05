/**
 * @fileoverview React Component
 * @module src/components/common/values/Address
 * @description This file contains the Address component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * AddressData interface
 * 
 * @interface
 * @description Defines the structure and contract for AddressData
 */
interface AddressData {
  /** Line1 */
  line1: string;
  /** Line2 */
  line2?: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Pincode */
  pincode: string;
  /** Country */
  country?: string;
}

/**
 * AddressProps interface
 * 
 * @interface
 * @description Defines the structure and contract for AddressProps
 */
interface AddressProps {
  /** Address */
  address: AddressData;
  /** Format */
  format?: "single-line" | "multi-line" | "compact";
  /** Show Icon */
  showIcon?: boolean;
  /** Class Name */
  className?: string;
}

/**
 * Function: Address
 */
/**
 * Performs address operation
 *
 * @returns {any} The address result
 *
 * @example
 * Address();
 */

/**
 * Performs address operation
 *
 * @returns {any} The address result
 *
 * @example
 * Address();
 */

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
