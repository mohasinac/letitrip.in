"use client";
import {
  UserOrdersView,
  useOrders,
  useUrlTable,
  OrdersList,
  ROUTES,
} from "@mohasinac/appkit";
import { useRouter } from "next/navigation";

export default function Page() {
  const table = useUrlTable({ defaults: { pageSize: "12", sort: "-createdAt" } });
  const page = table.getNumber("page", 1);
  const { orders, total, totalPages, isLoading } = useOrders({
    page,
    perPage: 12,
    sort: table.get("sort") || undefined,
    orderStatus: (table.get("status") as any) || undefined,
  });
  const router = useRouter();

  return (
    <UserOrdersView
      labels={{ title: "My Orders" }}
      total={total}
      isLoading={isLoading}
      renderTable={() => (
        <OrdersList
          orders={orders}
          isLoading={isLoading}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={(p) => table.setPage(p)}
          onOrderClick={(order) =>
            router.push(String(ROUTES.USER.ORDER_DETAIL(order.id)))
          }
          emptyLabel="You haven't placed any orders yet."
        />
      )}
    />
  );
}
