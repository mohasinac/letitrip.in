"use client";

import { Check, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { cancelOrderAction } from "@/actions";
import { useAuth, useMessage } from "@/hooks";
import { useOrderDetail } from "../hooks";
import {
  Card,
  Heading,
  Text,
  Button,
  StatusBadge,
  Row,
  Spinner,
  EmptyState,
} from "@/components";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import { useTranslations } from "next-intl";

const STATUS_MAP: Record<
  string,
  "pending" | "info" | "active" | "success" | "danger"
> = {
  pending: "pending",
  confirmed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
  returned: "danger",
};

const PAYMENT_STATUS_MAP: Record<
  string,
  "pending" | "info" | "active" | "success" | "danger"
> = {
  pending: "pending",
  paid: "success",
  failed: "danger",
  refunded: "info",
};

export function OrderDetailView() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const tOrders = useTranslations("orders");
  const tLoading = useTranslations("loading");

  const { showSuccess, showError } = useMessage();
  const { order, isLoading, error, refetch } = useOrderDetail(orderId);

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrderAction(orderId),
    onSuccess: () => {
      showSuccess(tOrders("orderCancelled"));
      void refetch();
    },
    onError: () => showError(tOrders("cancelFailed")),
  });

  if (loading || isLoading) {
    return (
      <Row justify="center" gap="none" className="min-h-screen">
        <Spinner size="lg" label={tLoading("default")} />
      </Row>
    );
  }

  if (!user) {
    router.push(ROUTES.AUTH.LOGIN);
    return null;
  }

  if (error || !order) {
    return (
      <div className={THEME_CONSTANTS.spacing.stack}>
        <Button
          variant="secondary"
          onClick={() => router.push(ROUTES.USER.ORDERS)}
          className="w-fit"
        >
          ← {tOrders("backToOrders")}
        </Button>

        <EmptyState
          icon={
            <svg
              className="w-24 h-24 mx-auto text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
          title={tOrders("orderNotFound")}
          description={tOrders("orderNotFoundMessage")}
          actionLabel={tOrders("viewAllOrders")}
          onAction={() => router.push(ROUTES.USER.ORDERS)}
        />
      </div>
    );
  }

  const STEPS = [
    { key: "pending", label: tOrders("stepPlaced") },
    { key: "confirmed", label: tOrders("stepConfirmed") },
    { key: "shipped", label: tOrders("stepShipped") },
    { key: "delivered", label: tOrders("stepDelivered") },
  ];
  const STEP_INDEX: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    shipped: 2,
    delivered: 3,
  };
  const isCancelled =
    order.status === "cancelled" || order.status === "returned";
  const currentStep = STEP_INDEX[order.status] ?? -1;
  const canCancel = order.status === "pending" || order.status === "confirmed";

  return (
    <div className={THEME_CONSTANTS.spacing.stack}>
      <Button
        variant="secondary"
        onClick={() => router.push(ROUTES.USER.ORDERS)}
        className="w-fit"
      >
        ← {tOrders("backToOrders")}
      </Button>

      {/* Status Stepper */}
      <Card className="p-4 md:p-6">
        {isCancelled ? (
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <X className="w-4 h-4" strokeWidth={2} />
            </div>
            <Text weight="semibold" className="capitalize">
              {tOrders("statusLabel")} {order.status}
            </Text>
          </div>
        ) : (
          <div className="flex items-center gap-0">
            {STEPS.map((step, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div
                  key={step.key}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isDone
                          ? "bg-primary-700 text-white"
                          : isCurrent
                            ? "bg-primary-700 text-white ring-4 ring-primary-700/20"
                            : "bg-zinc-200 dark:bg-slate-700 text-zinc-400"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <Text
                      size="xs"
                      weight={isCurrent ? "semibold" : "normal"}
                      variant={isDone || isCurrent ? "primary" : "secondary"}
                      className="text-center leading-tight hidden sm:block"
                    >
                      {step.label}
                    </Text>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 transition-colors ${
                        isDone
                          ? "bg-primary-700"
                          : "bg-zinc-200 dark:bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quick actions */}
        {(canCancel || order.trackingNumber) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-slate-700">
            {canCancel && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => cancelMutation.mutate()}
                isLoading={cancelMutation.isPending}
              >
                {tOrders("cancelOrder")}
              </Button>
            )}
            {order.trackingNumber && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(ROUTES.USER.ORDER_TRACK(orderId))}
              >
                {tOrders("trackOrder")}
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Order Header */}
      <Card className={THEME_CONSTANTS.spacing.cardPadding}>
        <div
          className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4`}
        >
          <div>
            <Heading level={4}>
              {tOrders("orderNumber")} #{order.id.slice(0, 8).toUpperCase()}
            </Heading>
            <Text className={`${THEME_CONSTANTS.typography.caption} mt-1`}>
              {tOrders("placedOn")} {formatDate(order.orderDate)}
            </Text>
          </div>
          <div
            className={`flex items-center flex-wrap ${THEME_CONSTANTS.spacing.inline}`}
          >
            <StatusBadge
              status={STATUS_MAP[order.status]}
              label={
                order.status.charAt(0).toUpperCase() + order.status.slice(1)
              }
            />
            {(order.trackingNumber ||
              ["confirmed", "shipped", "delivered"].includes(order.status)) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(ROUTES.USER.ORDER_TRACK(orderId))}
              >
                {tOrders("trackOrder")}
              </Button>
            )}
            {order.status === "delivered" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(
                    `${ROUTES.PUBLIC.PRODUCT_DETAIL(order.productId)}#write-review`,
                  )
                }
              >
                {tOrders("writeReview")}
              </Button>
            )}
            {order.paymentStatus === "paid" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  window.open(`/api/orders/${orderId}/invoice`, "_blank")
                }
              >
                {tOrders("downloadInvoice")}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Order Items */}
      <Card className={THEME_CONSTANTS.spacing.cardPadding}>
        <Heading level={5} className="mb-4">
          {tOrders("orderItems")}
        </Heading>
        <div className={`flex gap-4 pb-4`}>
          <div className="flex-1">
            <Heading level={6}>{order.productTitle}</Heading>
            <Text className={THEME_CONSTANTS.typography.caption}>
              {tOrders("quantity")}: {order.quantity}
            </Text>
            <Text className={THEME_CONSTANTS.typography.caption}>
              {formatCurrency(order.unitPrice, order.currency)}{" "}
              {tOrders("each")}
            </Text>
          </div>
          <div className="text-right">
            <Text className="font-semibold">
              {formatCurrency(order.totalPrice, order.currency)}
            </Text>
          </div>
        </div>

        {/* Order Summary */}
        <div
          className={`mt-6 pt-6 ${THEME_CONSTANTS.themed.border} border-t ${THEME_CONSTANTS.spacing.stackSmall}`}
        >
          <div
            className={`flex justify-between pt-2 ${THEME_CONSTANTS.themed.border} border-t`}
          >
            <Text className="font-semibold text-lg">{tOrders("total")}</Text>
            <Text className="font-semibold text-lg">
              {formatCurrency(order.totalPrice, order.currency)}
            </Text>
          </div>
        </div>
      </Card>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6`}
      >
        {/* Shipping Address */}
        <Card className={THEME_CONSTANTS.spacing.cardPadding}>
          <Heading level={5} className="mb-4">
            {tOrders("shippingAddress")}
          </Heading>
          <div className={THEME_CONSTANTS.spacing.stackSmall}>
            {order.shippingAddress ? (
              <Text>{order.shippingAddress}</Text>
            ) : (
              <Text className={THEME_CONSTANTS.typography.caption}>—</Text>
            )}
          </div>
        </Card>

        {/* Payment Information */}
        <Card className={THEME_CONSTANTS.spacing.cardPadding}>
          <Heading level={5} className="mb-4">
            {tOrders("paymentInfo")}
          </Heading>
          <div className={THEME_CONSTANTS.spacing.stackSmall}>
            <div className="flex justify-between">
              <Text>{tOrders("paymentMethod")}</Text>
              <Text className="font-semibold">
                {order.paymentMethod ?? "—"}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text>{tOrders("paymentStatus")}</Text>
              <StatusBadge
                status={PAYMENT_STATUS_MAP[order.paymentStatus]}
                label={
                  order.paymentStatus.charAt(0).toUpperCase() +
                  order.paymentStatus.slice(1)
                }
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
