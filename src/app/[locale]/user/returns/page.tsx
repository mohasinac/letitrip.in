"use client";
import {
  UserReturnsView,
  useOrders,
  OrdersList,
  ROUTES,
} from "@mohasinac/appkit/client";
import { useRouter } from "next/navigation";

export default function Page() {
  const { orders, total, totalPages, isLoading } = useOrders({
    orderStatus: "return_requested",
    perPage: 20,
  });
  const router = useRouter();

  return (
    <UserReturnsView
      labels={{ title: "Returns & Refunds" }}
      total={total}
      isLoading={isLoading}
      renderTable={() => (
        <OrdersList
          orders={orders}
          isLoading={isLoading}
          totalPages={totalPages}
          onOrderClick={(order) =>
            router.push(String(ROUTES.USER.ORDER_DETAIL(order.id)))
          }
          emptyLabel="You have no return or refund requests."
        />
      )}
    />
  );
}
