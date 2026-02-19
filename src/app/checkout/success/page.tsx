"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, ROUTES, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { Spinner, Badge } from "@/components";
import type { OrderDocument } from "@/db/schema";

const { themed, spacing, typography, borderRadius } = THEME_CONSTANTS;

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const {
    data: orderData,
    isLoading,
    error,
  } = useApiQuery<{ data: OrderDocument }>({
    queryKey: ["order", orderId ?? ""],
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.ORDERS.GET_BY_ID(orderId!));
      if (!res.ok) throw new Error("Failed to fetch order");
      return res.json();
    },
    enabled: !!orderId,
  });

  const order = orderData?.data;

  useEffect(() => {
    if (!orderId) {
      router.replace(ROUTES.PUBLIC.PRODUCTS);
    }
  }, [orderId, router]);

  if (!orderId) return null;

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${themed.bgPrimary}`}
      >
        <Spinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${themed.bgPrimary} ${spacing.padding.lg}`}
      >
        <div
          className={`${themed.bgSecondary} ${borderRadius.xl} ${spacing.padding.lg} max-w-md w-full text-center ${spacing.stack}`}
        >
          <div className="text-5xl mb-2">✅</div>
          <h1 className={`${typography.h2} ${themed.textPrimary}`}>
            {UI_LABELS.ACTIONS.CONFIRM} — Order Placed!
          </h1>
          <p className={themed.textSecondary}>
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
          <p className={`text-sm ${themed.textSecondary}`}>
            A confirmation email is on its way to you.
          </p>
          <div className={`flex flex-col sm:flex-row gap-3 pt-2`}>
            <Link
              href={ROUTES.USER.ORDERS}
              className="flex-1 text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              {UI_LABELS.USER.ORDERS.TITLE}
            </Link>
            <Link
              href={ROUTES.PUBLIC.PRODUCTS}
              className={`flex-1 text-center px-4 py-2 ${themed.bgPrimary} border ${themed.border} ${themed.textPrimary} rounded-lg font-medium hover:opacity-80 transition-opacity`}
            >
              {UI_LABELS.ACTIONS.SEARCH}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(
      amount,
    );

  const orderStatusVariant = (
    s: OrderDocument["status"],
  ): React.ComponentProps<typeof Badge>["variant"] => {
    const map: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
      pending: "pending",
      confirmed: "success",
      processing: "info",
      shipped: "info",
      delivered: "active",
      cancelled: "danger",
    };
    return map[s] ?? "default";
  };

  const paymentStatusVariant = (
    s: OrderDocument["paymentStatus"],
  ): React.ComponentProps<typeof Badge>["variant"] => {
    const map: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
      pending: "pending",
      paid: "success",
      failed: "danger",
      refunded: "warning",
    };
    return map[s] ?? "default";
  };

  return (
    <div className={`min-h-screen ${themed.bgPrimary} py-12 px-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Success header */}
        <div
          className={`${themed.bgSecondary} ${borderRadius.xl} p-8 text-center ${spacing.stack} mb-6`}
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className={`${typography.h2} ${themed.textPrimary}`}>
            Order Confirmed!
          </h1>
          <p className={themed.textSecondary}>
            Thank you for your purchase. Your order has been placed
            successfully.
          </p>
          <p className={`text-sm ${themed.textSecondary}`}>
            A confirmation email has been sent to your registered email address.
          </p>
        </div>

        {/* Order details */}
        <div
          className={`${themed.bgSecondary} ${borderRadius.xl} p-6 ${spacing.stack} mb-6`}
        >
          <h2 className={`${typography.h4} ${themed.textPrimary}`}>
            Order Details
          </h2>

          <div className="flex items-start justify-between gap-4">
            <div className={spacing.stack}>
              <p
                className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary}`}
              >
                Order ID
              </p>
              <p
                className={`font-mono text-sm font-semibold ${themed.textPrimary}`}
              >
                {order.id}
              </p>
            </div>
            <Badge
              variant={orderStatusVariant(order.status)}
              className="capitalize"
            >
              {order.status}
            </Badge>
          </div>

          {/* Product */}
          <div
            className={`flex gap-4 p-4 ${themed.bgPrimary} ${borderRadius.xl} border ${themed.border}`}
          >
            <div className="flex-1 min-w-0">
              <p className={`font-semibold ${themed.textPrimary} truncate`}>
                {order.productTitle}
              </p>
              <p className={`text-sm ${themed.textSecondary}`}>
                Qty: {order.quantity} ×{" "}
                {formatCurrency(order.unitPrice, order.currency)}
              </p>
            </div>
            <p className={`font-bold ${themed.textPrimary} shrink-0`}>
              {formatCurrency(order.totalPrice, order.currency)}
            </p>
          </div>

          {/* Payment & shipping info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`p-4 ${themed.bgPrimary} ${borderRadius.xl} border ${themed.border} ${spacing.stack}`}
            >
              <p
                className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary}`}
              >
                Payment Method
              </p>
              <p className={`font-medium capitalize ${themed.textPrimary}`}>
                {order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>
              <Badge
                variant={paymentStatusVariant(order.paymentStatus)}
                className="capitalize"
              >
                {order.paymentStatus}
              </Badge>
            </div>
            <div
              className={`p-4 ${themed.bgPrimary} ${borderRadius.xl} border ${themed.border} ${spacing.stack}`}
            >
              <p
                className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary}`}
              >
                Shipping To
              </p>
              <p className={`text-sm ${themed.textPrimary}`}>
                {order.shippingAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={ROUTES.USER.ORDER_DETAIL(order.id)}
            className="flex-1 text-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            View Order Details
          </Link>
          <Link
            href={ROUTES.USER.ORDERS}
            className={`flex-1 text-center px-6 py-3 ${themed.bgSecondary} border ${themed.border} ${themed.textPrimary} rounded-lg font-medium hover:opacity-80 transition-opacity`}
          >
            {UI_LABELS.USER.ORDERS.TITLE}
          </Link>
          <Link
            href={ROUTES.PUBLIC.PRODUCTS}
            className={`flex-1 text-center px-6 py-3 ${themed.bgSecondary} border ${themed.border} ${themed.textPrimary} rounded-lg font-medium hover:opacity-80 transition-opacity`}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
