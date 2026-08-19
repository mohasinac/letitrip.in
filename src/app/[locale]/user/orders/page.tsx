"use client";
import {
  sortBy,
  UserOrdersView,
  useOrders,
  useUrlTable,
  OrdersList,
  ROUTES,
  Div,
  Stack,
  Button,
  ACTIONS,
} from "@mohasinac/appkit/client";
import { ListingToolbar, PaginatedSelect } from "@mohasinac/appkit/ui";
import { useRouter, Link } from "@/i18n/navigation";

const CANCELLABLE_STATUSES = new Set(["pending", "confirmed", "processing"]);
const TRACKABLE_STATUSES = new Set(["shipped"]);

const SORT_OPTIONS = [
  { value: sortBy("createdAt", "DESC"),  label: "Newest first" },
  { value: sortBy("createdAt", "ASC"),   label: "Oldest first" },
  { value: sortBy("totalPrice", "DESC"), label: "Highest total" },
  { value: sortBy("totalPrice", "ASC"),  label: "Lowest total" },
];

const STATUS_OPTIONS = [
  { value: "pending",           label: "Pending" },
  { value: "processing",        label: "Processing" },
  { value: "shipped",           label: "Shipped" },
  { value: "delivered",         label: "Delivered" },
  { value: "cancelled",         label: "Cancelled" },
  { value: "refunded",          label: "Refunded" },
  { value: "return_requested",  label: "Return requested" },
];

export default function Page() {
  const table = useUrlTable({ defaults: { pageSize: "12", sort: "-createdAt" } });
  const page = table.getNumber("page", 1);
  const search = table.get("q") ?? "";
  const status = table.get("status") ?? "";

  const { orders, total, totalPages, isLoading } = useOrders({
    page,
    perPage: 12,
    sort: table.get("sort") || undefined,
    orderStatus: (status || undefined) as any,
  });
  const router = useRouter();

  const filterCount = (status ? 1 : 0) + (search ? 1 : 0);

  return (
    <UserOrdersView
      labels={{ title: "My Orders" }}
      total={total}
      isLoading={isLoading}
      renderTable={() => (
        <Stack gap="md">
          <ListingToolbar
            searchValue={search}
            searchPlaceholder="Search by order id…"
            onSearchChange={(v) => table.set("q", v)}
            sortValue={table.get("sort") ?? "-createdAt"}
            sortOptions={SORT_OPTIONS}
            onSortChange={(v) => table.set("sort", v)}
            hideViewToggle
            filterCount={filterCount}
            hasActiveState={filterCount > 0}
            onResetAll={() => table.clear()}
          />
          <Div>
            <PaginatedSelect
              value={status || null}
              onChange={(v) => table.set("status", v ?? "")}
              options={STATUS_OPTIONS}
              placeholder="All statuses"
              ariaLabel="Filter by order status"
              className="min-w-[180px]"
            />
          </Div>
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
            renderActions={(order) => (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href={ROUTES.USER.ORDER_DETAIL(order.id)}>
                    {ACTIONS.USER["view-order"].label}
                  </Link>
                </Button>
                {TRACKABLE_STATUSES.has(order.orderStatus) && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={ROUTES.USER.ORDER_TRACK(order.id)}>
                      {ACTIONS.USER["track-order"].label}
                    </Link>
                  </Button>
                )}
                {CANCELLABLE_STATUSES.has(order.orderStatus) && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={ROUTES.USER.ORDER_CANCEL(order.id)}>
                      {ACTIONS.USER["cancel-order"].label}
                    </Link>
                  </Button>
                )}
              </>
            )}
          />
        </Stack>
      )}
    />
  );
}
