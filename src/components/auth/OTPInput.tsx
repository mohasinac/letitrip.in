/**
 * @fileoverview React Component
 * @module src/components/auth/OTPInput
 * @description This file contains the OTPInput component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { ChangeEvent, ClipboardEvent, KeyboardEvent, useRef } from "react";

/**
 * OTPInputProps interface
 * 
 * @interface
 * @description Defines the structure and contract for OTPInputProps
 */
interface OTPInputProps {
  /** Length */
  length?: number;
  /** Value */
  value: string;
  /** On Change */
  onChange: (value: string) => void;
  /** Disabled */
  disabled?: boolean;
  /** Error */
  error?: boolean;
  /** Auto Focus */
  autoFocus?: boolean;
}

/**
 * OTP Input Component
 *
 * 6-digit OTP input with auto-focus and paste support
 *
 * Features:
 * - Auto-focus next input on digit entry
 * - Auto-focus previous input on backspace
 * - Paste support (pastes all 6 digits at once)
 * - Keyboard navigation
 * - Error state styling
 * - Dark mode support
 */
/**
 * Performs o t p input operation
 *
 * @returns {any} The otpinput result
 *
 * @example
 * OTPInput();
 */

/**
 * Performs o t p input operation
 *
 * @returns {any} The otpinput result
 *
 * @example
 * OTPInput();
 */

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = false,
}: OTPInputProps) {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Ensure value is padded to length
  const paddedValue = value.padEnd(length, " ");

  /**
   * Handles change event
   *
   * @param {number} index - The index
   * @param {string} digit - The digit
   *
   * @returns {string} The handlechange result
   */

  /**
   * Handles change event
   *
   * @param {number} index - The index
   * @param {string} digit - The digit
   *
   * @returns {string} The handlechange result
   */

  const handleChange = (index: number, digit: string) => {
    // Only allow digits
    if (digit && !/^\d$/.test(digit)) {
      return;
    }

    const newValue = paddedValue.split("");
    newValue[index] = digit;
    const finalValue = newValue.join("").trim();

    onChange(finalValue);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handles key down event
   *
   * @param {number} index - The index
   * @param {KeyboardEvent<HTMLInputElement>} e - The e
   *
   * @returns {number} The handlekeydown result
   */

  /**
   * Handles key down event
   *
   * @param {number} index - The index
   * @param {KeyboardEvent<HTMLInputElement>} e - The e
   *
   * @returns {number} The handlekeydown result
   */

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Backspace: clear current and move to previous
    if (e.key === "Backspace") {
      if (!paddedValue[index] || paddedValue[index] === " ") {
        // Current is empty, move to previous
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Clear current
        handleChange(index, "");
      }
    }

    // Left arrow: move to previous
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Right arrow: move to next
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handles paste event
   *
   * @param {ClipboardEvent<HTMLInputElement>} e - The e
   *
   * @returns {any} The handlepaste result
   */

  /**
   * Handles paste event
   *
   * @param {ClipboardEvent<HTMLInputElement>} e - The e
   *
   * @returns {any} The handlepaste result
   */

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");

    // Extract only digits
    const digits = pastedData.replace(/\D/g, "").slice(0, length);

    if (digits.length > 0) {
      onChange(digits);

      // Focus the last filled input or the next empty one
      const nextIndex = Math.min(digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  /**
   * Handles input change event
   *
   * @param {number} index - The index
   * @param {ChangeEvent<HTMLInputElement>} e - The e
   *
   * @returns {number} The handleinputchange result
   */

  /**
   * Handles input change event
   *
   * @returns {number} The handleinputchange result
   */

  const handleInputChange = (
    /** Index */
    index: number,
    /** E */
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const digit = e.target.value.slice(-1); // Get only the last character
    handleChange(index, digit);
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={paddedValue[index] === " " ? "" : paddedValue[index]}
          onChange={(e) => handleInputChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          className={`
            w-12 h-14 text-center text-2xl font-semibold
            border-2 rounded-lg
            transition-all duration-200
            /** Focus */
            focus:outline-none focus:ring-2
            ${
              error
                ? "border-red-500 text-red-600 dark:border-red-500 dark:text-red-400 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
            }
            ${
              disabled
                ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                : "bg-white dark:bg-gray-900"
            }
            /** Hover */
            hover:border-gray-400 dark:hover:border-gray-500
          `}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  );
}
