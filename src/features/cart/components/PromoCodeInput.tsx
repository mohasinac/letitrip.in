"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { Button, Input, Label, Span, Text } from "@/components";
import { useCouponValidate } from "@/hooks";
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
  const t = useTranslations("cart");
  const mutation = useCouponValidate();
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
      const res = (await mutation.mutateAsync({
        code: trimmed,
        orderTotal: subtotal,
      })) as CouponValidateResponse;
      if (res.valid) {
        setAppliedCode(trimmed);
        setDiscountAmount(res.discountAmount);
        setCode("");
        onApply?.(res.discountAmount, trimmed);
      } else {
        setErrorMsg(res.error ?? t("promoInvalid"));
      }
    } catch {
      setErrorMsg(t("promoInvalid"));
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
        <Label
          className={`block text-xs font-medium mb-1.5 ${themed.textSecondary}`}
        >
          {t("promoCode")}
        </Label>
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
            <Span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {appliedCode}
            </Span>
            <Span className="text-xs text-emerald-600 dark:text-emerald-500 ml-auto">
              -{formatCurrency(discountAmount)}
            </Span>
          </div>
          <Button
            onClick={handleRemove}
            className="text-xs text-zinc-500 hover:text-red-500 transition-colors"
          >
            {t("promoRemove")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label
        className={`block text-xs font-medium mb-1.5 ${themed.textSecondary}`}
      >
        {t("promoCode")}
      </Label>
      <div className="flex gap-2">
        <Input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setErrorMsg(null);
          }}
          placeholder={t("promoPlaceholder")}
          disabled={disabled || loading}
          className="flex-1 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
        <Button
          variant="primary"
          onClick={handleApply}
          disabled={disabled || loading || !code.trim()}
          className="px-4 py-2 text-sm font-medium"
        >
          {loading ? "…" : t("promoApply")}
        </Button>
      </div>
      {errorMsg && (
        <Text size="xs" variant="error" className="mt-1.5">
          {errorMsg}
        </Text>
      )}
    </div>
  );
}
