/**
 * CouponTableColumns
 * Path: src/components/admin/coupons/CouponTableColumns.tsx
 *
 * Column definitions for the admin Coupons DataTable.
 */

import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type { CouponDocument } from "@/db/schema";

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
          <span className="font-mono font-bold text-sm tracking-wider">
            {coupon.code}
          </span>
        ),
      },
      {
        key: "name",
        header: LABELS.NAME_LABEL,
        sortable: true,
        width: "20%",
        render: (coupon: CouponDocument) => (
          <div>
            <p className="font-medium text-sm truncate max-w-[150px]">
              {coupon.name}
            </p>
            <p
              className={`text-xs ${themed.textSecondary} truncate max-w-[150px]`}
            >
              {coupon.description}
            </p>
          </div>
        ),
      },
      {
        key: "type",
        header: LABELS.TYPE_LABEL,
        sortable: true,
        width: "14%",
        render: (coupon: CouponDocument) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              TYPE_STYLES[coupon.type] ??
              `${themed.bgSecondary} ${themed.textSecondary}`
            }`}
          >
            {coupon.type.replace("_", " ")}
          </span>
        ),
      },
      {
        key: "discount",
        header: "Discount",
        width: "12%",
        render: (coupon: CouponDocument) => {
          const { type, discount } = coupon;
          if (type === "percentage")
            return <span className="font-semibold">{discount.value}%</span>;
          if (type === "fixed")
            return (
              <span className="font-semibold">
                ₹{discount.value.toLocaleString("en-IN")}
              </span>
            );
          if (type === "free_shipping")
            return <span className="font-semibold">Free shipping</span>;
          return <span className="font-semibold">BXGY</span>;
        },
      },
      {
        key: "usage",
        header: "Usage",
        width: "12%",
        render: (coupon: CouponDocument) => (
          <span className={`text-sm ${themed.textSecondary}`}>
            {coupon.usage.currentUsage}
            {coupon.usage.totalLimit
              ? ` / ${coupon.usage.totalLimit}`
              : " uses"}
          </span>
        ),
      },
      {
        key: "validity",
        header: "Status",
        width: "9%",
        render: (coupon: CouponDocument) => {
          const isActive = coupon.validity.isActive;
          const isExpired =
            coupon.validity.endDate &&
            new Date(coupon.validity.endDate) < new Date();
          return (
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                isExpired
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  : isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : `${themed.bgSecondary} ${themed.textSecondary}`
              }`}
            >
              {isExpired ? "Expired" : isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: UI_LABELS.TABLE.ACTIONS,
        width: "18%",
        render: (coupon: CouponDocument) => (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(coupon)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
            >
              {UI_LABELS.ACTIONS.EDIT}
            </button>
            <button
              onClick={() => onDelete(coupon)}
              className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium"
            >
              {UI_LABELS.ACTIONS.DELETE}
            </button>
          </div>
        ),
      },
    ],
  };
}
