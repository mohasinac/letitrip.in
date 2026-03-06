/**
 * CouponForm
 * Path: src/components/admin/coupons/CouponForm.tsx
 *
 * Create/edit form for admin coupon management.
 */

"use client";

import { useState, useEffect } from "react";
import { Input, Select, Textarea, Toggle } from "@/components";
import { UI_LABELS } from "@/constants";
import type { CouponDocument } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.COUPONS;

const COUPON_TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage Discount" },
  { value: "fixed", label: "Fixed Amount Discount" },
  { value: "free_shipping", label: "Free Shipping" },
  { value: "buy_x_get_y", label: "Buy X Get Y" },
];

export interface CouponFormState {
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";
  discountValue: number;
  maxDiscount: string;
  minPurchase: string;
  totalLimit: string;
  perUserLimit: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  firstTimeUserOnly: boolean;
}

function toDateInputValue(d?: Date | string): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
}

export function couponToFormState(
  coupon?: Partial<CouponDocument>,
): CouponFormState {
  return {
    code: coupon?.code ?? "",
    name: coupon?.name ?? "",
    description: coupon?.description ?? "",
    type: coupon?.type ?? "percentage",
    discountValue: coupon?.discount?.value ?? 0,
    maxDiscount: coupon?.discount?.maxDiscount?.toString() ?? "",
    minPurchase: coupon?.discount?.minPurchase?.toString() ?? "",
    totalLimit: coupon?.usage?.totalLimit?.toString() ?? "",
    perUserLimit: coupon?.usage?.perUserLimit?.toString() ?? "",
    startDate: toDateInputValue(coupon?.validity?.startDate),
    endDate: toDateInputValue(coupon?.validity?.endDate),
    isActive: coupon?.validity?.isActive ?? false,
    firstTimeUserOnly: coupon?.restrictions?.firstTimeUserOnly ?? false,
  };
}

export function formStateToCouponPayload(form: CouponFormState) {
  return {
    code: form.code.toUpperCase(),
    name: form.name,
    description: form.description,
    type: form.type,
    discount: {
      value: Number(form.discountValue),
      ...(form.maxDiscount ? { maxDiscount: Number(form.maxDiscount) } : {}),
      ...(form.minPurchase ? { minPurchase: Number(form.minPurchase) } : {}),
    },
    usage: {
      currentUsage: 0,
      ...(form.totalLimit ? { totalLimit: Number(form.totalLimit) } : {}),
      ...(form.perUserLimit ? { perUserLimit: Number(form.perUserLimit) } : {}),
    },
    validity: {
      isActive: form.isActive,
      startDate: form.startDate
        ? new Date(form.startDate).toISOString()
        : new Date().toISOString(),
      ...(form.endDate
        ? { endDate: new Date(form.endDate).toISOString() }
        : {}),
    },
    restrictions: {
      firstTimeUserOnly: form.firstTimeUserOnly,
      combineWithSellerCoupons: false,
    },
  };
}

interface CouponFormProps {
  initialData?: Partial<CouponDocument>;
  onChange: (state: CouponFormState) => void;
  isEdit?: boolean;
}

export function CouponForm({ initialData, onChange, isEdit }: CouponFormProps) {
  const [form, setForm] = useState<CouponFormState>(
    couponToFormState(initialData),
  );

  useEffect(() => {
    setForm(couponToFormState(initialData));
  }, [initialData?.id]);

  const update = (
    field: keyof CouponFormState,
    value: string | boolean | number,
  ) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <Input
        label={LABELS.CODE_LABEL}
        value={form.code}
        onChange={(e) => update("code", e.target.value.toUpperCase())}
        placeholder="e.g. SAVE10"
        disabled={isEdit}
      />

      <Input
        label={LABELS.NAME_LABEL}
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        placeholder="Summer Sale Discount"
      />

      <Textarea
        label={LABELS.DESCRIPTION_LABEL}
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        placeholder="Short description of this coupon"
        rows={2}
      />

      <Select
        label={LABELS.TYPE_LABEL}
        value={form.type}
        onChange={(e) => update("type", (e.target as HTMLSelectElement).value)}
        options={COUPON_TYPE_OPTIONS}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={
            form.type === "percentage"
              ? "Discount %"
              : form.type === "fixed"
                ? "Discount ₹"
                : "Discount Value"
          }
          type="number"
          value={form.discountValue.toString()}
          onChange={(e) => update("discountValue", e.target.value)}
          placeholder="10"
        />
        <Input
          label={LABELS.MAX_DISCOUNT_LABEL}
          type="number"
          value={form.maxDiscount}
          onChange={(e) => update("maxDiscount", e.target.value)}
          placeholder="500"
        />
      </div>

      <Input
        label={LABELS.MIN_PURCHASE_LABEL}
        type="number"
        value={form.minPurchase}
        onChange={(e) => update("minPurchase", e.target.value)}
        placeholder="999"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={LABELS.TOTAL_LIMIT_LABEL}
          type="number"
          value={form.totalLimit}
          onChange={(e) => update("totalLimit", e.target.value)}
          placeholder="100"
        />
        <Input
          label={LABELS.PER_USER_LIMIT_LABEL}
          type="number"
          value={form.perUserLimit}
          onChange={(e) => update("perUserLimit", e.target.value)}
          placeholder="1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={LABELS.START_DATE_LABEL}
          type="date"
          value={form.startDate}
          onChange={(e) => update("startDate", e.target.value)}
        />
        <Input
          label={LABELS.END_DATE_LABEL}
          type="date"
          value={form.endDate}
          onChange={(e) => update("endDate", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Toggle
          label={LABELS.IS_ACTIVE_LABEL}
          checked={form.isActive}
          onChange={(checked) => update("isActive", checked)}
        />
        <Toggle
          label={LABELS.FIRST_TIME_ONLY_LABEL}
          checked={form.firstTimeUserOnly}
          onChange={(checked) => update("firstTimeUserOnly", checked)}
        />
      </div>
    </div>
  );
}
