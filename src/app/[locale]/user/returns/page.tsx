"use client";
import {
  sortBy,
  UserReturnsView,
  useOrders,
  useUrlTable,
  OrdersList,
  ROUTES,
  Stack,
} from "@mohasinac/appkit/client";
import { ListingToolbar } from "@mohasinac/appkit/ui";
import { useRouter } from "@/i18n/navigation";

const SORT_OPTIONS = [
  { value: sortBy("updatedAt", "DESC"), label: "Recently updated" },
  { value: sortBy("createdAt", "DESC"), label: "Newest" },
  { value: sortBy("createdAt", "ASC"),  label: "Oldest" },
];

export default function Page() {
  const table = useUrlTable({ defaults: { pageSize: "12", sort: "-updatedAt" } });
  const page = table.getNumber("page", 1);
  const search = table.get("q") ?? "";

  const { orders, total, totalPages, isLoading } = useOrders({
    page,
    perPage: 12,
    sort: table.get("sort") || undefined,
    orderStatus: "return_requested",
  });
  const router = useRouter();

  return (
    <UserReturnsView
      labels={{ title: "Returns & Refunds" }}
      total={total}
      isLoading={isLoading}
      renderTable={() => (
        <Stack gap="md">
          <ListingToolbar
            searchValue={search}
            searchPlaceholder="Search by order id…"
            onSearchChange={(v) => table.set("q", v)}
            sortValue={table.get("sort") ?? "-updatedAt"}
            sortOptions={SORT_OPTIONS}
            onSortChange={(v) => table.set("sort", v)}
            hideViewToggle
            hasActiveState={!!search}
            onResetAll={() => table.clear()}
          />
          <OrdersList
            orders={orders}
            isLoading={isLoading}
            totalPages={totalPages}
            currentPage={page}
            onPageChange={(p) => table.setPage(p)}
            onOrderClick={(order) =>
              router.push(String(ROUTES.USER.ORDER_DETAIL(order.id)))
            }
            emptyLabel="You have no return or refund requests."
          />
        </Stack>
      )}
    />
  );
}
