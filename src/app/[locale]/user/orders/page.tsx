"use client";
import {
  UserOrdersView,
  useOrders,
  useUrlTable,
  OrdersList,
  ROUTES,
  Div,
  Stack,
} from "@mohasinac/appkit/client";
import { ListingToolbar } from "@mohasinac/appkit/ui";
import { useRouter } from "@/i18n/navigation";

const SORT_OPTIONS = [
  { value: "-createdAt",   label: "Newest first" },
  { value: "createdAt",    label: "Oldest first" },
  { value: "-totalAmount", label: "Highest total" },
  { value: "totalAmount",  label: "Lowest total" },
];

const STATUS_OPTIONS = [
  { value: "",                  label: "All statuses" },
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
            {/* eslint-disable-next-line lir/no-raw-html-elements -- short status filter; <Select> wrapper drops this UX */}
            <select
              value={status}
              onChange={(e) => table.set("status", e.target.value)}
              className="rounded-md border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-3 py-1.5 text-sm text-[var(--appkit-color-text)]"
              aria-label="Filter by order status"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
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
          />
        </Stack>
      )}
    />
  );
}
