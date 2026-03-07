/**
 * UserOrdersView
 *
 * Extracted from src/app/[locale]/user/orders/page.tsx
 * Lists the current user's orders with status filter tabs, search, sort,
 * and pagination — all URL-driven via useUrlTable.
 * Uses the unified ListingLayout shell.
 */

"use client";

import { Suspense, useMemo } from "react";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth, useUrlTable } from "@/hooks";
import { useUserOrders } from "../hooks";
import {
  ActiveFilterChips,
  Button,
  Card,
  DataTable,
  EmptyState,
  Heading,
  ListingLayout,
  Search,
  SortDropdown,
  Spinner,
  StatusBadge,
  TablePagination,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";

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

const ORDER_SORT_OPTIONS_KEYS = [
  { value: "-orderDate", key: "sortNewest" },
  { value: "orderDate", key: "sortOldest" },
  { value: "-totalPrice", key: "sortHighest" },
  { value: "totalPrice", key: "sortLowest" },
] as const;

function UserOrdersContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const table = useUrlTable({ defaults: { pageSize: "10" } });
  const tOrders = useTranslations("orders");
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");
  const statusFilter = table.get("status");
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", 10);
  const search = table.get("q");
  const sortParam = table.get("sorts") || "-orderDate";

  const STATUS_TABS = [
    { key: "", label: tOrders("tabAll") },
    { key: "pending", label: tOrders("tabPending") },
    { key: "confirmed", label: tOrders("tabConfirmed") },
    { key: "shipped", label: tOrders("tabShipped") },
    { key: "delivered", label: tOrders("tabDelivered") },
    { key: "cancelled", label: tOrders("tabCancelled") },
  ];

  const ordersParams = useMemo(() => {
    const p = new URLSearchParams();
    if (statusFilter) p.set("status", statusFilter);
    if (search) p.set("q", search);
    if (sortParam) p.set("sorts", sortParam);
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    return p.toString();
  }, [statusFilter, search, sortParam, page, pageSize]);

  const {
    orders,
    totalPages,
    total: totalOrders,
    isLoading,
  } = useUserOrders(ordersParams);

  const sortOptions = useMemo(
    () =>
      ORDER_SORT_OPTIONS_KEYS.map((o) => ({
        value: o.value,
        label: tOrders(o.key),
      })),
    [tOrders],
  );

  const activeFilters = useMemo<ActiveFilter[]>(
    () =>
      statusFilter
        ? [
            {
              key: "status",
              label: tOrders("tabAll"),
              value:
                STATUS_TABS.find((t) => t.key === statusFilter)?.label ??
                statusFilter,
            },
          ]
        : [],
    [statusFilter, tOrders],
  );

  if (loading) {
    return (
      <div className={`${THEME_CONSTANTS.flex.center} min-h-screen`}>
        <Spinner size="lg" label={tLoading("default")} />
      </div>
    );
  }

  if (!user) {
    router.push(ROUTES.AUTH.LOGIN);
    return null;
  }

  return (
    <ListingLayout
      headerSlot={
        <div>
          <Heading level={3}>{tOrders("title")}</Heading>
          <Text variant="secondary" className="mt-1">
            {totalOrders > 0
              ? tOrders("subtitleWithCount", { count: totalOrders })
              : tOrders("subtitle")}
          </Text>
        </div>
      }
      statusTabsSlot={
        <Tabs
          variant="line"
          value={statusFilter}
          onChange={(v) => table.set("status", v)}
        >
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
      searchSlot={
        <Search
          value={search}
          onChange={(v) => table.set("q", v)}
          placeholder={tOrders("searchPlaceholder")}
          onClear={() => table.set("q", "")}
        />
      }
      sortSlot={
        <SortDropdown
          value={sortParam}
          onChange={(v) => table.set("sorts", v)}
          options={sortOptions}
        />
      }
      paginationSlot={
        totalPages > 1 ? (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            total={totalOrders}
            onPageChange={table.setPage}
            isLoading={isLoading}
          />
        ) : undefined
      }
      activeFiltersSlot={
        activeFilters.length > 0 ? (
          <ActiveFilterChips
            filters={activeFilters}
            onRemove={(key) => table.set(key, "")}
            onClearAll={() => table.set("status", "")}
          />
        ) : undefined
      }
      loading={isLoading}
    >
      <DataTable
        data={orders}
        keyExtractor={(o) => o.id ?? ""}
        loading={isLoading}
        columns={[
          { key: "productTitle", header: tOrders("colProduct") },
          {
            key: "id",
            header: tOrders("orderNumber"),
            render: (o) => (
              <Text size="sm" className="font-mono">
                #{(o.id ?? "").slice(0, 8).toUpperCase()}
              </Text>
            ),
          },
          {
            key: "status",
            header: tOrders("tabAll"),
            render: (o) => (
              <StatusBadge
                status={STATUS_MAP[o.status] ?? "pending"}
                label={o.status.charAt(0).toUpperCase() + o.status.slice(1)}
              />
            ),
          },
          {
            key: "totalPrice",
            header: tOrders("sortHighest"),
            render: (o) => (
              <Text weight="semibold">
                {formatCurrency(o.totalPrice, o.currency)}
              </Text>
            ),
          },
        ]}
        defaultViewMode="list"
        emptyState={
          <EmptyState
            icon={<ShoppingBag className="w-16 h-16" />}
            title={tOrders("noOrders")}
            description={tOrders("emptySubtitle")}
            actionLabel={tActions("browseProducts")}
            onAction={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
          />
        }
        mobileCardRender={(order) => (
          <Card className={THEME_CONSTANTS.spacing.cardPadding}>
            <div
              className={`flex flex-col md:flex-row md:items-center md:justify-between ${THEME_CONSTANTS.spacing.gap.md}`}
            >
              <div className={THEME_CONSTANTS.spacing.stackSmall}>
                <Heading level={6}>{order.productTitle}</Heading>
                <Text className={THEME_CONSTANTS.typography.caption}>
                  {tOrders("orderNumber")} #
                  {(order.id ?? "").slice(0, 8).toUpperCase()}
                </Text>
                <Text className={THEME_CONSTANTS.typography.caption}>
                  {tOrders("placedOn")} {formatDate(order.orderDate)}
                </Text>
              </div>
              <div
                className={`flex items-center flex-wrap ${THEME_CONSTANTS.spacing.gap.md}`}
              >
                <Text className="font-semibold">
                  {formatCurrency(order.totalPrice, order.currency)}
                </Text>
                <StatusBadge
                  status={STATUS_MAP[order.status] ?? "pending"}
                  label={
                    order.status.charAt(0).toUpperCase() + order.status.slice(1)
                  }
                />
                {order.status === "delivered" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `${ROUTES.PUBLIC.PRODUCT_DETAIL(order.productId)}#write-review`,
                      )
                    }
                  >
                    {tOrders("writeReview")}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    router.push(ROUTES.USER.ORDER_DETAIL(order.id ?? ""))
                  }
                >
                  {tOrders("viewOrder")}
                </Button>
              </div>
            </div>
          </Card>
        )}
      />
    </ListingLayout>
  );
}

export function UserOrdersView() {
  return (
    <Suspense>
      <UserOrdersContent />
    </Suspense>
  );
}
