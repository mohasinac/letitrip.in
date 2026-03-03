/**
 * CouponTableColumns
 * Path: src/components/admin/coupons/CouponTableColumns.tsx
 *
 * Column definitions for the admin Coupons DataTable.
 */

import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type { CouponDocument } from "@/db/schema";
import { formatCurrency, isPast } from "@/utils";
import { Button, Span, Text } from "@/components";

const LABELS = UI_LABELS.ADMIN.COUPONS;
const { themed } = THEME_CONSTANTS;

const TYPE_STYLES: Record<string, string> = {
  percentage:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  fixed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  free_shipping:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  buy_x_get_y:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

type CouponAction = (coupon: CouponDocument) => void;

export function getCouponTableColumns(
  onEdit: CouponAction,
  onDelete: CouponAction,
) {
  return {
    columns: [
      {
        key: "code",
        header: LABELS.CODE_LABEL,
        sortable: true,
        width: "15%",
        render: (coupon: CouponDocument) => (
          <Span className="font-mono font-bold text-sm tracking-wider">
            {coupon.code}
          </Span>
        ),
      },
      {
        key: "name",
        header: LABELS.NAME_LABEL,
        sortable: true,
        width: "20%",
        render: (coupon: CouponDocument) => (
          <div>
            <Text weight="medium" size="sm" className="truncate max-w-[150px]">
              {coupon.name}
            </Text>
            <Text
              size="xs"
              variant="secondary"
              className="truncate max-w-[150px]"
            >
              {coupon.description}
            </Text>
          </div>
        ),
      },
      {
        key: "type",
        header: LABELS.TYPE_LABEL,
        sortable: true,
        width: "14%",
        render: (coupon: CouponDocument) => (
          <Span
            className={`px-2 py-1 text-xs font-medium rounded ${
              TYPE_STYLES[coupon.type] ??
              `${themed.bgSecondary} ${themed.textSecondary}`
            }`}
          >
            {coupon.type.replace("_", " ")}
          </Span>
        ),
      },
      {
        key: "discount",
        header: "Discount",
        width: "12%",
        render: (coupon: CouponDocument) => {
          const { type, discount } = coupon;
          if (type === "percentage")
            return <Span className="font-semibold">{discount.value}%</Span>;
          if (type === "fixed")
            return (
              <Span className="font-semibold">
                {formatCurrency(discount.value, "INR", "en-IN")}
              </Span>
            );
          if (type === "free_shipping")
            return <Span className="font-semibold">Free shipping</Span>;
          return <Span className="font-semibold">BXGY</Span>;
        },
      },
      {
        key: "usage",
        header: "Usage",
        width: "12%",
        render: (coupon: CouponDocument) => (
          <Span className={`text-sm ${themed.textSecondary}`}>
            {coupon.usage.currentUsage}
            {coupon.usage.totalLimit
              ? ` / ${coupon.usage.totalLimit}`
              : " uses"}
          </Span>
        ),
      },
      {
        key: "validity",
        header: "Status",
        width: "9%",
        render: (coupon: CouponDocument) => {
          const isActive = coupon.validity.isActive;
          const isExpired =
            coupon.validity.endDate && isPast(coupon.validity.endDate);
          return (
            <Span
              className={`px-2 py-1 text-xs font-medium rounded ${
                isExpired
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  : isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : `${themed.bgSecondary} ${themed.textSecondary}`
              }`}
            >
              {isExpired ? "Expired" : isActive ? "Active" : "Inactive"}
            </Span>
          );
        },
      },
      {
        key: "actions",
        header: UI_LABELS.TABLE.ACTIONS,
        width: "18%",
        render: (coupon: CouponDocument) => (
          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(coupon)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
            >
              {UI_LABELS.ACTIONS.EDIT}
            </Button>
            <Button
              onClick={() => onDelete(coupon)}
              className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium"
            >
              {UI_LABELS.ACTIONS.DELETE}
            </Button>
          </div>
        ),
      },
    ],
  };
}
