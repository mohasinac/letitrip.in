"use client";

import { Spinner, Button } from "@mohasinac/appkit/ui";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { EmptyState } from "@/components";
import { UserOrderTrackView as AppkitUserOrderTrackView } from "@mohasinac/appkit/features/account";
import { useOrderDetail } from "../hooks/useOrderDetail";
import { OrderTrackingView } from "./OrderTrackingView";
import { ROUTES, THEME_CONSTANTS } from "@/constants";

interface UserOrderTrackViewProps {
  orderId: string;
}

export function UserOrderTrackView({ orderId }: UserOrderTrackViewProps) {
  const router = useRouter();
  const tOrders = useTranslations("orders");
  const { order, isLoading, error } = useOrderDetail(orderId);

  return (
    <AppkitUserOrderTrackView
      isNotFound={!isLoading && (!!error || !order)}
      renderBack={() => (
        <Button
          variant="secondary"
          onClick={() => router.push(ROUTES.USER.ORDERS)}
          className="w-fit"
        >
          â† {tOrders("backToOrders")}
        </Button>
      )}
      renderTracking={() =>
        isLoading ? (
          <div className={`${THEME_CONSTANTS.flex.center} min-h-[400px]`}>
            <Spinner size="lg" />
          </div>
        ) : order ? (
          <OrderTrackingView order={order} orderId={orderId} />
        ) : null
      }
      renderNotFound={() => (
        <EmptyState
          title={tOrders("orderNotFound")}
          description={tOrders("orderNotFoundMessage")}
          actionLabel={tOrders("viewAllOrders")}
          onAction={() => router.push(ROUTES.USER.ORDERS)}
        />
      )}
    />
  );
}

