"use client";

import { useRouter } from "@/i18n/navigation";
import { Button, EmptyState, Spinner } from "@/components";
import { OrderTrackingView } from "./OrderTrackingView";
import { useOrderDetail } from "../hooks/useOrderDetail";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";

interface UserOrderTrackViewProps {
  orderId: string;
}

export function UserOrderTrackView({ orderId }: UserOrderTrackViewProps) {
  const router = useRouter();
  const tOrders = useTranslations("orders");
  const { order, isLoading, error } = useOrderDetail(orderId);
  const { flex } = THEME_CONSTANTS;

  if (isLoading) {
    return (
      <div className={`${flex.center} min-h-screen`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className={`container mx-auto px-4 py-8 max-w-2xl ${THEME_CONSTANTS.spacing.stack}`}
      >
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

  return <OrderTrackingView order={order} orderId={orderId} />;
}
