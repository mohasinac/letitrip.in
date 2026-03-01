"use client";

import { useAuth } from "@/hooks";
import { useOrderDetail } from "../hooks";
import {
  Card,
  Heading,
  Text,
  Button,
  StatusBadge,
  Spinner,
  EmptyState,
} from "@/components";
import { useRouter, useParams } from "next/navigation";
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

  const { order, isLoading, error } = useOrderDetail(orderId);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label={tLoading("default")} />
      </div>
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
              className="w-24 h-24 mx-auto text-gray-400"
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

  return (
    <div className={THEME_CONSTANTS.spacing.stack}>
      <Button
        variant="secondary"
        onClick={() => router.push(ROUTES.USER.ORDERS)}
        className="w-fit"
      >
        ← {tOrders("backToOrders")}
      </Button>

      {/* Order Header */}
      <Card className={THEME_CONSTANTS.spacing.cardPadding}>
        <div
          className={`flex flex-col md:flex-row md:items-center md:justify-between ${THEME_CONSTANTS.spacing.gap.md}`}
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
            className={`flex items-center ${THEME_CONSTANTS.spacing.inline}`}
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
          </div>
        </div>
      </Card>

      {/* Order Items */}
      <Card className={THEME_CONSTANTS.spacing.cardPadding}>
        <Heading level={5} className="mb-4">
          {tOrders("orderItems")}
        </Heading>
        <div className={`flex ${THEME_CONSTANTS.spacing.gap.md} pb-4`}>
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
        className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 ${THEME_CONSTANTS.spacing.gap.lg}`}
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
