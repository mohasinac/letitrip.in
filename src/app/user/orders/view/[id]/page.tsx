"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
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
import { THEME_CONSTANTS, ROUTES, UI_LABELS } from "@/constants";
import { formatCurrency } from "@/utils";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
}

const STATUS_MAP: Record<
  string,
  "pending" | "info" | "active" | "success" | "danger"
> = {
  pending: "pending",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

export default function OrderViewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  useEffect(() => {
    // NOTE: /api/user/orders route not yet created — this will remain null until the route is added
    // const { data: orderData } = useApiQuery(API_ENDPOINTS.ORDERS.GET_BY_ID(orderId));
    // setOrder(orderData);
    // For now, show empty state
    setOrder(null);
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label={UI_LABELS.LOADING.DEFAULT} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!order) {
    return (
      <div className={THEME_CONSTANTS.spacing.stack}>
        <Button
          variant="secondary"
          onClick={() => router.push(ROUTES.USER.ORDERS)}
          className="w-fit"
        >
          ← {UI_LABELS.USER.ORDERS.BACK_TO_ORDERS}
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
          title={UI_LABELS.USER.ORDERS.ORDER_NOT_FOUND}
          description={UI_LABELS.USER.ORDERS.ORDER_NOT_FOUND_MESSAGE}
          actionLabel={UI_LABELS.USER.ORDERS.VIEW_ALL_ORDERS}
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
        ← {UI_LABELS.USER.ORDERS.BACK_TO_ORDERS}
      </Button>

      {/* Order Header */}
      <Card className={THEME_CONSTANTS.spacing.cardPadding}>
        <div
          className={`flex flex-col md:flex-row md:items-center md:justify-between ${THEME_CONSTANTS.spacing.gap.md}`}
        >
          <div>
            <Heading level={4}>
              {UI_LABELS.USER.ORDERS.ORDER_NUMBER} #{order.orderNumber}
            </Heading>
            <Text className={`${THEME_CONSTANTS.typography.caption} mt-1`}>
              {UI_LABELS.USER.ORDERS.PLACED_ON} {order.date}
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
            {order.trackingNumber && (
              <Button variant="secondary" size="sm">
                {UI_LABELS.USER.ORDERS.TRACK_ORDER}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Order Items */}
      <Card className={THEME_CONSTANTS.spacing.cardPadding}>
        <Heading level={5} className="mb-4">
          {UI_LABELS.USER.ORDERS.ORDER_ITEMS}
        </Heading>
        <div className={THEME_CONSTANTS.spacing.stack}>
          {order.items.map((item) => (
            <div
              key={item.id}
              className={`flex ${THEME_CONSTANTS.spacing.gap.md} pb-4 ${THEME_CONSTANTS.themed.border} border-b last:border-b-0 last:pb-0`}
            >
              <img
                src={item.image}
                alt={item.name}
                className={`w-20 h-20 object-cover ${THEME_CONSTANTS.borderRadius.md}`}
                loading="lazy"
              />
              <div className="flex-1">
                <Heading level={6}>{item.name}</Heading>
                <Text className={THEME_CONSTANTS.typography.caption}>
                  {UI_LABELS.USER.ORDERS.QUANTITY}: {item.quantity}
                </Text>
              </div>
              <div className="text-right">
                <Text className="font-semibold">
                  {formatCurrency(item.price, "INR")}
                </Text>
                <Text className={THEME_CONSTANTS.typography.caption}>
                  {formatCurrency(item.price / item.quantity, "INR")}{" "}
                  {UI_LABELS.USER.ORDERS.EACH}
                </Text>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div
          className={`mt-6 pt-6 ${THEME_CONSTANTS.themed.border} border-t ${THEME_CONSTANTS.spacing.stackSmall}`}
        >
          <div className="flex justify-between">
            <Text>{UI_LABELS.USER.ORDERS.SUBTOTAL}</Text>
            <Text>{formatCurrency(order.subtotal, "INR")}</Text>
          </div>
          <div className="flex justify-between">
            <Text>{UI_LABELS.USER.ORDERS.SHIPPING}</Text>
            <Text>{formatCurrency(order.shipping, "INR")}</Text>
          </div>
          <div className="flex justify-between">
            <Text>{UI_LABELS.USER.ORDERS.TAX}</Text>
            <Text>{formatCurrency(order.tax, "INR")}</Text>
          </div>
          <div
            className={`flex justify-between pt-2 ${THEME_CONSTANTS.themed.border} border-t`}
          >
            <Text className="font-semibold text-lg">
              {UI_LABELS.USER.ORDERS.TOTAL}
            </Text>
            <Text className="font-semibold text-lg">
              {formatCurrency(order.total, "INR")}
            </Text>
          </div>
        </div>
      </Card>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${THEME_CONSTANTS.spacing.gap.lg}`}
      >
        {/* Shipping Address */}
        <Card className={THEME_CONSTANTS.spacing.cardPadding}>
          <Heading level={5} className="mb-4">
            {UI_LABELS.USER.ORDERS.SHIPPING_ADDRESS}
          </Heading>
          <div className={THEME_CONSTANTS.spacing.stackSmall}>
            <Text className="font-semibold">
              {order.shippingAddress.fullName}
            </Text>
            <Text>{order.shippingAddress.phoneNumber}</Text>
            <Text>{order.shippingAddress.addressLine1}</Text>
            {order.shippingAddress.addressLine2 && (
              <Text>{order.shippingAddress.addressLine2}</Text>
            )}
            <Text>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.pincode}
            </Text>
          </div>
        </Card>

        {/* Payment Information */}
        <Card className={THEME_CONSTANTS.spacing.cardPadding}>
          <Heading level={5} className="mb-4">
            {UI_LABELS.USER.ORDERS.PAYMENT_INFO}
          </Heading>
          <div className={THEME_CONSTANTS.spacing.stackSmall}>
            <div className="flex justify-between">
              <Text>{UI_LABELS.USER.ORDERS.PAYMENT_METHOD}</Text>
              <Text className="font-semibold">{order.paymentMethod}</Text>
            </div>
            <div className="flex justify-between">
              <Text>{UI_LABELS.USER.ORDERS.PAYMENT_STATUS}</Text>
              <StatusBadge
                status="success"
                label={UI_LABELS.USER.ORDERS.PAID}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
