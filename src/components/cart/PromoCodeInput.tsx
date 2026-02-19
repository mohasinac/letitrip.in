"use client";

import { useState } from "react";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";

const { themed, input } = THEME_CONSTANTS;

/**
 * PromoCodeInput - Stub component
 *
 * TODO (Task 1.7 / Phase 2): Wire to coupon validation API
 * `POST /api/coupons/validate` with code → returns discount amount
 */
interface PromoCodeInputProps {
  onApply?: (code: string) => void;
  disabled?: boolean;
}

export function PromoCodeInput({
  onApply,
  disabled = false,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");

  const handleApply = () => {
    if (!code.trim()) return;
    // TODO: Call coupon validation API
    onApply?.(code.trim());
  };

  return (
    <div>
      <label
        className={`block text-xs font-medium mb-1.5 ${themed.textSecondary}`}
      >
        {UI_LABELS.CART.PROMO_CODE}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={UI_LABELS.CART.PROMO_PLACEHOLDER}
          disabled={disabled}
          className={`flex-1 text-sm ${input.base} ${themed.bgPrimary} ${themed.textPrimary}`}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
        <button
          onClick={handleApply}
          disabled={disabled || !code.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          {UI_LABELS.CART.PROMO_APPLY}
        </button>
      </div>
    </div>
  );
}
