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

interface PhoneNumberProps {
  value: string;
  clickable?: boolean;
  showIcon?: boolean;
  className?: string;
}

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
