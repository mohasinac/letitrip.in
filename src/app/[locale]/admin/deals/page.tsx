"use client";

import React, { useState } from "react";
import { ROUTES } from "@mohasinac/appkit/client";
import {
  useAdminListingData,
  toRecordArray,
  toStringValue,
  toRelativeDate,
  AdminListingScaffold,
  DataTable,
  useBulkSelection,
  useUrlTable,
  ADMIN_ENDPOINTS,
  Select,
} from "@mohasinac/appkit/client";
import type { BulkActionItem } from "@mohasinac/appkit/client";

interface ProductsResponse {
  items?: unknown[];
  total?: number;
}

type RowShape = {
  id: string;
  primary: string;
  secondary: string;
  status: string;
  updatedAt: string;
};

const DEFAULT_SORT = "-createdAt";
const SORT_OPTIONS = [
  { label: "Newest first", value: "-createdAt" },
  { label: "Oldest first", value: "createdAt" },
  { label: "Name A→Z", value: "title" },
  { label: "Name Z→A", value: "-title" },
  { label: "Price low→high", value: "price" },
  { label: "Price high→low", value: "-price" },
];
const COLUMNS = [
  { key: "primary", header: "Product" },
  { key: "secondary", header: "Seller · Price" },
  { key: "status", header: "Status" },
  { key: "updatedAt", header: "Updated" },
];

export default function Page() {
  const [q, setQ] = useState("");
  const table = useUrlTable({ defaults: { sort: DEFAULT_SORT } });
  const sorts = table.get("sort") || DEFAULT_SORT;

  const { rows, isLoading, errorMessage, refetch } = useAdminListingData<ProductsResponse, RowShape>({
    queryKey: ["admin", "deals", "listing", q, sorts],
    endpoint: ADMIN_ENDPOINTS.PRODUCTS,
    filters: "isPromoted==true",
    sorts,
    q,
    mapRows: (response) =>
      toRecordArray(response.items).map((item: any, index) => ({
        id: toStringValue(item.id, `product-${index}`),
        primary: toStringValue(item.title ?? item.name, "Untitled product"),
        secondary: [
          toStringValue(item.storeName, "Unknown store"),
          item.price != null ? `₹${item.price}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
        status: toStringValue(item.status, "Unknown"),
        updatedAt: toRelativeDate(item.updatedAt ?? item.createdAt),
      })),
    getTotal: (response, mappedRows) =>
      typeof response.total === "number" ? response.total : mappedRows.length,
  });

  const selection = useBulkSelection({ items: rows, keyExtractor: (r) => r.id });

  const bulkActionItems: BulkActionItem[] = [
    {
      id: "remove-deals",
      label: "Remove from Deals",
      variant: "danger",
      onClick: async () => {
        await Promise.all(
          selection.selectedIds.map((id) =>
            fetch(ADMIN_ENDPOINTS.PRODUCT_BY_ID(id), {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isPromoted: false }),
            }),
          ),
        );
        selection.clearSelection();
        refetch();
      },
    },
  ];

  return (
    <AdminListingScaffold
      title="Deals (Promoted Products)"
      subtitle="Products flagged as promoted — shown in the Deals tab on the Promotions page"
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      searchValue={q}
      onSearch={setQ}
      searchPlaceholder="Search deals by name or seller…"
      actionLabel="+ Add Product"
      actionHref={String(ROUTES.ADMIN.PRODUCTS_NEW)}
      selectedCount={selection.selectedCount}
      bulkActionItems={bulkActionItems}
      sortSlot={
        <Select
          value={sorts}
          onChange={(e) => table.set("sort", e.target.value)}
          aria-label="Sort deals"
          options={SORT_OPTIONS}
        />
      }
    >
      <DataTable
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        emptyLabel="No deals found"
        getRowHref={(row) => String(ROUTES.ADMIN.PRODUCTS_EDIT(row.id))}
        selectedIds={selection.selectedIdSet}
        onToggleSelect={(id, _selected) => selection.toggle(id)}
        onToggleSelectAll={(next) =>
          next
            ? selection.setSelectedIds(rows.map((r) => r.id))
            : selection.clearSelection()
        }
      />
    </AdminListingScaffold>
  );
}
