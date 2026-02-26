/**
 * Order Tracking Page
 *
 * Route: /user/orders/[id]/track
 * Thin orchestration: auth + data fetch → <OrderTrackingView>
 */

"use client";

import { useRouter, useParams } from "next/navigation";
import { useAuth, useApiQuery } from "@/hooks";
import { Spinner, Button, EmptyState, OrderTrackingView } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { orderService } from "@/services";
import { useTranslations } from "next-intl";
import type { OrderDocument } from "@/db/schema";

export default function OrderTrackPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const tOrders = useTranslations("orders");

  const { data, isLoading, error } = useApiQuery<{ data: OrderDocument }>({
    queryKey: ["order-track", orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: !!user && !authLoading && !!orderId,
    cacheTTL: 30000,
  });

  const order = data?.data ?? null;

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
