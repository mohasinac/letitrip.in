/**
 * OrderTrackingView
 *
 * Renders the full order tracking UI: header, tracking number card, and
 * visual timeline. Consumed by /user/orders/[id]/track/page.tsx.
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button, Caption, Card, Heading, Span, Text } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatDate, formatRelativeTime } from "@/utils";
import type { OrderDocument, OrderStatus } from "@/db/schema";

const { themed, spacing, flex } = THEME_CONSTANTS;

// --- Types --------------------------------------------------------------------

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

// --- Timeline Builder ---------------------------------------------------------

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
      state: "completed",
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

    const statusIdx = order.status === "cancelled" ? 1 : 2;
    for (let i = 1; i <= steps.length - 1; i++) {
      if (i < statusIdx) {
        steps[i].state = "completed";
      } else if (i === steps.length - 1) {
        steps[i].state = "skipped";
      } else {
        steps[i].state = "skipped";
      }
    }
    steps[steps.length - 1].state = "active";
    return steps;
  }

  const statusOrder: Array<OrderStatus | "placed"> = [
    "placed",
    "confirmed",
    "shipped",
    "delivered",
  ];
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

// --- Step Icon ----------------------------------------------------------------

function StepIcon({ state }: { state: TimelineStepState }) {
  if (state === "completed") {
    return (
      <div
        className={`w-10 h-10 rounded-full bg-green-500 ${flex.center} flex-shrink-0 shadow-md`}
      >
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
      <div
        className={`w-10 h-10 rounded-full bg-blue-500 ${flex.center} flex-shrink-0 shadow-md ring-4 ring-blue-100 dark:ring-blue-900/40`}
      >
        <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
      </div>
    );
  }
  if (state === "skipped") {
    return (
      <div
        className={`w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 ${flex.center} flex-shrink-0`}
      >
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
  return (
    <div
      className={`w-10 h-10 rounded-full bg-zinc-100 dark:bg-slate-800 border-2 ${themed.border} ${flex.center} flex-shrink-0`}
    >
      <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
    </div>
  );
}

// --- Timeline Connector -------------------------------------------------------

function Connector({ state }: { state: TimelineStepState }) {
  const isActive = state === "completed";
  return (
    <div
      className={`w-0.5 h-12 ml-5 ${
        isActive ? "bg-green-400" : "bg-zinc-200 dark:bg-slate-700"
      }`}
    />
  );
}

// --- Props --------------------------------------------------------------------

interface OrderTrackingViewProps {
  order: OrderDocument;
  orderId: string;
}

// --- Main Component -----------------------------------------------------------

export function OrderTrackingView({ order, orderId }: OrderTrackingViewProps) {
  const router = useRouter();
  const tOrders = useTranslations("orders");
  const [copied, setCopied] = useState(false);

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

  const handleCopyTracking = useCallback(() => {
    if (!order.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [order.trackingNumber]);

  const steps = buildTimeline(order, timelineLabels);

  return (
    <div className={`container mx-auto px-4 py-8 max-w-2xl ${spacing.stack}`}>
      {/* Back button */}
      <Button
        variant="secondary"
        onClick={() => router.push(ROUTES.USER.ORDER_DETAIL(orderId))}
        className="w-fit"
      >
        ? {tOrders("trackBack")}
      </Button>

      {/* Header */}
      <div>
        <Heading level={1}>{tOrders("trackTitle")}</Heading>
        <Text size="sm" variant="secondary" className="mt-1">
          {tOrders("orderNumber")} #{order.id.slice(0, 8).toUpperCase()}
          {" — "}
          {tOrders("placedOn")} {formatDate(order.orderDate)}
        </Text>
      </div>

      {/* Tracking number */}
      {order.trackingNumber && (
        <Card className={THEME_CONSTANTS.spacing.cardPadding}>
          <div className={`${flex.between} flex-wrap gap-3`}>
            <div>
              <Caption className="uppercase tracking-wider font-semibold">
                {tOrders("trackingNumberLabel")}
              </Caption>
              <Text weight="semibold" size="lg" className="mt-1 font-mono">
                {order.trackingNumber}
              </Text>
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
        <Heading level={2} className="mb-6">
          {tOrders("trackSubtitle")}
        </Heading>
        <div className="relative">
          {steps.map((step, idx) => (
            <div key={step.key}>
              <div className="flex items-start gap-4">
                <StepIcon state={step.state} />
                <div className="flex-1 min-w-0 pb-2">
                  <div className={`${flex.between} gap-2 flex-wrap`}>
                    <Text
                      weight="semibold"
                      size="sm"
                      variant={
                        step.state === "pending" ? "secondary" : "primary"
                      }
                      className="leading-tight"
                    >
                      {step.label}
                    </Text>
                    {step.date && (
                      <Span className={`text-xs ${themed.textSecondary}`}>
                        {formatDate(step.date)}
                        {" — "}
                        {formatRelativeTime(step.date)}
                      </Span>
                    )}
                  </div>
                  <Text
                    size="sm"
                    variant={step.state === "pending" ? "muted" : "secondary"}
                    className="mt-0.5"
                  >
                    {step.description}
                  </Text>
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
