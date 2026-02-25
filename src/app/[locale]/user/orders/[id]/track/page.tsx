/**
 * Order Tracking Page
 *
 * Route: /user/orders/[id]/track
 * Displays a visual timeline of the order's progress through fulfilment stages.
 */

"use client";

import { useCallback, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useApiQuery } from "@/hooks";
import { Card, Spinner, Button, EmptyState } from "@/components";
import { ROUTES, THEME_CONSTANTS, API_ENDPOINTS } from "@/constants";
import { formatDate, formatRelativeTime } from "@/utils";
import { apiClient } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import type { OrderDocument, OrderStatus } from "@/db/schema";

const { themed, typography, spacing } = THEME_CONSTANTS;

// ─── Timeline Step Definition ────────────────────────────────────────────────

type TimelineStepState = "completed" | "active" | "pending" | "skipped";

interface TimelineStep {
  key: OrderStatus | "placed";
  label: string;
  description: string;
  date?: Date;
  state: TimelineStepState;
}

interface TimelineLabels {
  stepPlaced: string;
  stepPlacedDesc: string;
  stepConfirmed: string;
  stepConfirmedDesc: string;
  stepShipped: string;
  stepShippedDesc: string;
  stepDelivered: string;
  stepDeliveredDesc: string;
  stepCancelled: string;
  stepCancelledDesc: string;
  stepReturned: string;
  stepReturnedDesc: string;
}

function buildTimeline(
  order: OrderDocument,
  labels: TimelineLabels,
): TimelineStep[] {
  const isCancelled =
    order.status === "cancelled" || order.status === "returned";

  const steps: TimelineStep[] = [
    {
      key: "placed",
      label: labels.stepPlaced,
      description: labels.stepPlacedDesc,
      date: order.orderDate,
      state: "completed", // Always completed if order exists
    },
    {
      key: "confirmed",
      label: labels.stepConfirmed,
      description: labels.stepConfirmedDesc,
      state: "pending",
    },
    {
      key: "shipped",
      label: labels.stepShipped,
      description: labels.stepShippedDesc,
      date: order.shippingDate,
      state: "pending",
    },
    {
      key: "delivered",
      label: labels.stepDelivered,
      description: labels.stepDeliveredDesc,
      date: order.deliveryDate,
      state: "pending",
    },
  ];

  // If cancelled / returned, replace delivered with the terminal state
  if (isCancelled) {
    const terminalKey: OrderStatus =
      order.status === "returned" ? "returned" : "cancelled";
    steps[3] = {
      key: terminalKey,
      label:
        terminalKey === "returned" ? labels.stepReturned : labels.stepCancelled,
      description:
        terminalKey === "returned"
          ? labels.stepReturnedDesc
          : labels.stepCancelledDesc,
      date: order.cancellationDate,
      state: "skipped",
    };
  }

  // Determine state of each step based on current order status
  const statusOrder: Array<OrderStatus | "placed"> = [
    "placed",
    "confirmed",
    "shipped",
    "delivered",
  ];
  if (isCancelled) {
    // Mark confirmed/shipped as skipped if cancelled before they occur
    const statusIdx = order.status === "cancelled" ? 1 : 2;
    for (let i = 1; i <= steps.length - 1; i++) {
      if (i < statusIdx) {
        steps[i].state = "completed";
      } else if (i === steps.length - 1) {
        steps[i].state = "skipped"; // terminal cancelled/returned step
      } else {
        steps[i].state = "skipped";
      }
    }
    steps[steps.length - 1].state = "active"; // Show the terminal step
    return steps;
  }

  const currentIdx = statusOrder.indexOf(
    order.status as OrderStatus | "placed",
  );
  for (let i = 0; i < steps.length; i++) {
    if (i < currentIdx) {
      steps[i].state = "completed";
    } else if (i === currentIdx) {
      steps[i].state = order.status === "delivered" ? "completed" : "active";
    } else {
      steps[i].state = "pending";
    }
  }

  return steps;
}

// ─── Step Icon ───────────────────────────────────────────────────────────────

function StepIcon({ state }: { state: TimelineStepState }) {
  if (state === "completed") {
    return (
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md ring-4 ring-blue-100 dark:ring-blue-900/40">
        <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
      </div>
    );
  }
  if (state === "skipped") {
    return (
      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    );
  }
  // Pending
  return (
    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
      <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
    </div>
  );
}

// ─── Timeline Connector ───────────────────────────────────────────────────────

function Connector({ state }: { state: TimelineStepState }) {
  const isActive = state === "completed";
  return (
    <div
      className={`w-0.5 h-12 ml-5 ${
        isActive ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"
      }`}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrderTrackPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const [copied, setCopied] = useState(false);
  const tOrders = useTranslations("orders");

  const timelineLabels: TimelineLabels = {
    stepPlaced: tOrders("stepPlaced"),
    stepPlacedDesc: tOrders("stepPlacedDesc"),
    stepConfirmed: tOrders("stepConfirmed"),
    stepConfirmedDesc: tOrders("stepConfirmedDesc"),
    stepShipped: tOrders("stepShipped"),
    stepShippedDesc: tOrders("stepShippedDesc"),
    stepDelivered: tOrders("stepDelivered"),
    stepDeliveredDesc: tOrders("stepDeliveredDesc"),
    stepCancelled: tOrders("stepCancelled"),
    stepCancelledDesc: tOrders("stepCancelledDesc"),
    stepReturned: tOrders("stepReturned"),
    stepReturnedDesc: tOrders("stepReturnedDesc"),
  };

  const { data, isLoading, error } = useApiQuery<{ data: OrderDocument }>({
    queryKey: ["order-track", orderId],
    queryFn: () => apiClient.get(API_ENDPOINTS.ORDERS.GET_BY_ID(orderId)),
    enabled: !!user && !authLoading && !!orderId,
    cacheTTL: 30000,
  });

  const order = data?.data ?? null;

  const handleCopyTracking = useCallback(() => {
    if (!order?.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [order?.trackingNumber]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    router.push(ROUTES.AUTH.LOGIN);
    return null;
  }

  if (error || !order) {
    return (
      <div className={`container mx-auto px-4 py-8 max-w-2xl ${spacing.stack}`}>
        <Button
          variant="secondary"
          onClick={() => router.push(ROUTES.USER.ORDERS)}
          className="w-fit"
        >
          ← {tOrders("backToOrders")}
        </Button>
        <EmptyState
          title={tOrders("orderNotFound")}
          description={tOrders("orderNotFoundMessage")}
          actionLabel={tOrders("viewAllOrders")}
          onAction={() => router.push(ROUTES.USER.ORDERS)}
        />
      </div>
    );
  }

  const steps = buildTimeline(order, timelineLabels);

  return (
    <div className={`container mx-auto px-4 py-8 max-w-2xl ${spacing.stack}`}>
      {/* Back button */}
      <Button
        variant="secondary"
        onClick={() => router.push(ROUTES.USER.ORDER_DETAIL(orderId))}
        className="w-fit"
      >
        ← {tOrders("trackBack")}
      </Button>

      {/* Header */}
      <div>
        <h1 className={`${typography.h2} ${themed.textPrimary}`}>
          {tOrders("trackTitle")}
        </h1>
        <p className={`mt-1 text-sm ${themed.textSecondary}`}>
          {tOrders("orderNumber")} #{order.id.slice(0, 8).toUpperCase()}
          {" · "}
          {tOrders("placedOn")} {formatDate(order.orderDate)}
        </p>
      </div>

      {/* Tracking number */}
      {order.trackingNumber && (
        <Card className={THEME_CONSTANTS.spacing.cardPadding}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${themed.textSecondary}`}
              >
                {tOrders("trackingNumberLabel")}
              </p>
              <p
                className={`mt-1 font-mono font-semibold text-lg ${themed.textPrimary}`}
              >
                {order.trackingNumber}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleCopyTracking}>
              {copied
                ? tOrders("trackingNumberCopied")
                : tOrders("trackingNumberCopy")}
            </Button>
          </div>
        </Card>
      )}

      {/* Timeline */}
      <Card className={THEME_CONSTANTS.spacing.cardPadding}>
        <h2 className={`${typography.h4} ${themed.textPrimary} mb-6`}>
          {tOrders("trackSubtitle")}
        </h2>

        <div className="relative">
          {steps.map((step, idx) => (
            <div key={step.key}>
              <div className="flex items-start gap-4">
                <StepIcon state={step.state} />
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p
                      className={`font-semibold text-sm leading-tight ${
                        step.state === "pending"
                          ? themed.textSecondary
                          : themed.textPrimary
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <span className={`text-xs ${themed.textSecondary}`}>
                        {formatDate(step.date)}
                        {" · "}
                        {formatRelativeTime(step.date)}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm mt-0.5 ${
                      step.state === "pending"
                        ? "text-gray-400 dark:text-gray-600"
                        : themed.textSecondary
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && <Connector state={step.state} />}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick link to order detail */}
      <div className="text-center">
        <Button
          variant="primary"
          onClick={() => router.push(ROUTES.USER.ORDER_DETAIL(orderId))}
        >
          {tOrders("viewOrder")}
        </Button>
      </div>
    </div>
  );
}
