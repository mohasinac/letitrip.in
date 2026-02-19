"use client";

import { useState } from "react";
import { UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS } from "@/constants";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/utils";

const { themed, input } = THEME_CONSTANTS;

interface CouponValidateResponse {
  valid: boolean;
  discountAmount: number;
  error?: string;
}

interface PromoCodeInputProps {
  /** Order subtotal — sent to the API to calculate discount */
  subtotal?: number;
  /** Called when a coupon is successfully validated */
  onApply?: (discountAmount: number, code: string) => void;
  /** Called when the applied coupon is removed */
  onRemove?: () => void;
  disabled?: boolean;
}

export function PromoCodeInput({
  subtotal = 0,
  onApply,
  onRemove,
  disabled = false,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.post<CouponValidateResponse>(
        API_ENDPOINTS.COUPONS.VALIDATE,
        { code: trimmed, orderTotal: subtotal },
      );
      if (res.valid) {
        setAppliedCode(trimmed);
        setDiscountAmount(res.discountAmount);
        setCode("");
        onApply?.(res.discountAmount, trimmed);
      } else {
        setErrorMsg(res.error ?? UI_LABELS.CART.PROMO_INVALID);
      }
    } catch {
      setErrorMsg(UI_LABELS.CART.PROMO_INVALID);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedCode(null);
    setDiscountAmount(0);
    setErrorMsg(null);
    setCode("");
    onRemove?.();
  };

  if (appliedCode) {
    return (
      <div>
        <label
          className={`block text-xs font-medium mb-1.5 ${themed.textSecondary}`}
        >
          {UI_LABELS.CART.PROMO_CODE}
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20">
            <svg
              className="w-4 h-4 text-emerald-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {appliedCode}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-500 ml-auto">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
          <button
            onClick={handleRemove}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            {UI_LABELS.CART.PROMO_REMOVE}
          </button>
        </div>
      </div>
    );
  }

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
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setErrorMsg(null);
          }}
          placeholder={UI_LABELS.CART.PROMO_PLACEHOLDER}
          disabled={disabled || loading}
          className={`flex-1 text-sm ${input.base} ${themed.bgPrimary} ${themed.textPrimary}`}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
        <button
          onClick={handleApply}
          disabled={disabled || loading || !code.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? "…" : UI_LABELS.CART.PROMO_APPLY}
        </button>
      </div>
      {errorMsg && <p className="mt-1.5 text-xs text-red-500">{errorMsg}</p>}
    </div>
  );
}
