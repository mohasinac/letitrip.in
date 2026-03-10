/**
 * Order Tracking Page
 *
 * Route: /user/orders/[id]/track
 * Thin orchestration: auth-gated by UserLayout — fetch order → <OrderTrackingView>
 */

"use client";

import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { Button, EmptyState, Spinner } from "@/components";
import { OrderTrackingView, useOrderDetail } from "@/features/user";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";

export default function OrderTrackPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
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
