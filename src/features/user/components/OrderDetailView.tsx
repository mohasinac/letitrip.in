"use client";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useAuth, useMessage } from "@/hooks";
import { useOrderDetail } from "../hooks";
import { cancelOrderAction } from "@/actions";
import { Card, EmptyState } from "@/components";
import {
  Heading, Row, Text, Spinner, StatusBadge, Button, } from "@mohasinac/appkit/ui";
import { OrderDetailView as AppkitOrderDetailView } from "@mohasinac/appkit/features/account";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@mohasinac/appkit/utils";


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

  return (
    <AppkitOrderDetailView
      isNotFound={!!error || !order}
      renderBack={() => (
        <Button
          variant="secondary"
          onClick={() => router.push(ROUTES.USER.ORDERS)}
          className="w-fit"
        >
          ← {tOrders("backToOrders")}
        </Button>
      )}
      renderHeader={() =>
        !order ? null : (
          <Card className={THEME_CONSTANTS.spacing.stack}>
            <div className={THEME_CONSTANTS.flex.between}>
              <div>
                <Heading level={3}>
                  #{order.id.slice(0, 8).toUpperCase()}
                </Heading>
                <Text size="sm" variant="secondary">
                  {formatDate(order.orderDate)}
                </Text>
              </div>
              <StatusBadge status={STATUS_MAP[order.status] ?? "pending"} />
            </div>
          </Card>
        )
      }
      renderItems={() =>
        !order?.items?.length ? null : (
          <Card className={THEME_CONSTANTS.spacing.stack}>
            <Heading level={4}>{tOrders("items")}</Heading>
            {order.items.map((item, i) => (
              <div
                key={i}
                className={`${THEME_CONSTANTS.flex.between} py-2 border-b last:border-0 border-zinc-100 dark:border-slate-800`}
              >
                <Text size="sm">
                  {item.productTitle} × {item.quantity}
                </Text>
                <Text size="sm" weight="medium">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </Text>
              </div>
            ))}
            <div className={`${THEME_CONSTANTS.flex.between} pt-3`}>
              <Text weight="semibold">{tOrders("total")}</Text>
              <Text weight="semibold">{formatCurrency(order.totalPrice)}</Text>
            </div>
          </Card>
        )
      }
      renderAddress={() =>
        !order?.shippingAddress ? null : (
          <Card className={THEME_CONSTANTS.spacing.stack}>
            <Heading level={4}>{tOrders("shippingAddress")}</Heading>
            <Text size="sm">{order.shippingAddress}</Text>
          </Card>
        )
      }
      renderPayment={() =>
        !order ? null : (
          <Card className={THEME_CONSTANTS.spacing.stack}>
            <Heading level={4}>{tOrders("paymentInfo")}</Heading>
            <div className={THEME_CONSTANTS.flex.between}>
              <Text size="sm" variant="secondary">
                {tOrders("paymentStatus")}
              </Text>
              <StatusBadge
                status={
                  PAYMENT_STATUS_MAP[order.paymentStatus ?? "pending"] ??
                  "pending"
                }
              />
            </div>
          </Card>
        )
      }
      renderActions={() =>
        !order ||
        order.status === "delivered" ||
        order.status === "cancelled" ? null : (
          <Button
            variant="danger"
            onClick={() => cancelMutation.mutate()}
            isLoading={cancelMutation.isPending}
          >
            {tOrders("cancelOrder")}
          </Button>
        )
      }
    />
  );
}

