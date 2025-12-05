/**
 * @fileoverview React Component
 * @module src/components/common/values/PhoneNumber
 * @description This file contains the PhoneNumber component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Phone Number Display Component
 *
 * Displays phone numbers in Indian format with optional click-to-call.
 *
 * @example
 * <PhoneNumber value="9876543210" />           // +91 98765 43210
 * <PhoneNumber value="+919876543210" clickable /> // Clickable tel: link
 */

"use client";

import React from "react";
import { Phone } from "lucide-react";
import { formatPhoneNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * PhoneNumberProps interface
 * 
 * @interface
 * @description Defines the structure and contract for PhoneNumberProps
 */
interface PhoneNumberProps {
  /** Value */
  value: string;
  /** Clickable */
  clickable?: boolean;
  /** Show Icon */
  showIcon?: boolean;
  /** Class Name */
  className?: string;
}

/**
 * Function: Phone Number
 */
/**
 * Performs phone number operation
 *
 * @returns {any} The phonenumber result
 *
 * @example
 * PhoneNumber();
 */

/**
 * Performs phone number operation
 *
 * @returns {any} The phonenumber result
 *
 * @example
 * PhoneNumber();
 */

export function PhoneNumber({
  value,
  clickable = false,
  showIcon = false,
  className,
}: PhoneNumberProps) {
  const formatted = formatPhoneNumber(value);

  // Clean number for tel: link
  const cleanNumber = value.replace(/\D/g, "");
  const telNumber = cleanNumber.startsWith("91")
    ? `+${cleanNumber}`
    : `+91${cleanNumber}`;

  /**
   * Performs content operation
   *
   * @returns {any} The content result
   */

  /**
   * Performs content operation
   *
   * @returns {any} The content result
   */

  const content = (
    <>
      {showIcon && <Phone className="w-4 h-4 mr-1.5 inline-block" />}
      {formatted}
    </>
  );

  if (clickable) {
    return (
      <a
        href={`tel:${telNumber}`}
        className={cn(
          "text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center",
          className,
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      className={cn(
        "text-gray-900 dark:text-white inline-flex items-center",
        className,
      )}
    >
      {content}
    </span>
  );
}
