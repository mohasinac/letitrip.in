"use client";

import React from "react";
import { useRouter } from "@/i18n/navigation";
import { ROUTES, type JsonArray } from "@mohasinac/appkit/client";
import {
  toRecordArray,
  toStringValue,
  toRelativeDate,
  DataListingView,
  ADMIN_ENDPOINTS,
  sortBy,
  ADMIN_BULK_ACTIONS,
  ROW_ACTION_META,
} from "@mohasinac/appkit/client";
import type {
  AdminListingScaffoldRow,
  ListingViewConfig,
  BulkActionItem,
} from "@mohasinac/appkit/client";
import { useAdminProductFlagMutation } from "@/hooks";

interface ProductsResponse {
  items?: JsonArray;
  total?: number;
}

const SORT_OPTIONS = [
  { label: "Newest first", value: sortBy("createdAt", "DESC") },
  { label: "Oldest first", value: sortBy("createdAt", "ASC") },
  { label: "Name A→Z", value: sortBy("title", "ASC") },
  { label: "Name Z→A", value: sortBy("title", "DESC") },
  { label: "Price low→high", value: sortBy("price", "ASC") },
  { label: "Price high→low", value: sortBy("price", "DESC") },
];

const QUERY_KEY = ["admin", "deals", "listing"] as const;

export default function Page() {
  const router = useRouter();
  const removeFromDealsMutation = useAdminProductFlagMutation("isPromoted", QUERY_KEY);

  const config: ListingViewConfig<ProductsResponse, AdminListingScaffoldRow> = {
    portal: "admin",
    title: "Deals (Promoted Products)",
    searchPlaceholder: "Search deals by name or seller…",
    emptyLabel: "No deals found",
    filterKeys: [],
    defaultSort: sortBy("createdAt", "DESC"),
    queryKey: [...QUERY_KEY],
    endpoint: ADMIN_ENDPOINTS.PRODUCTS,
    sortOptions: SORT_OPTIONS,
    mapRows: (response) =>
      toRecordArray(response.items).map((item, index) => ({
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
    buildFilters: () => "isPromoted==true",
    getRowHref: (row) => String(ROUTES.ADMIN.PRODUCTS_EDIT(row.id)),
    primaryAction: {
      label: "+ Add Product",
      onClick: () => router.push(String(ROUTES.ADMIN.PRODUCTS_NEW)),
    },
    // Rule #7: bulk-action array sourced from the ADMIN_BULK_ACTIONS preset.
    buildBulkActions: (selection): BulkActionItem[] =>
      ADMIN_BULK_ACTIONS.deals.map((id) => ({
        id,
        label: `${ROW_ACTION_META[id].label} from Deals`,
        variant: "danger" as const,
        onClick: async () => {
          await Promise.all(
            selection.selectedIds.map((sid) => removeFromDealsMutation.mutateAsync(sid)),
          );
          selection.clearSelection();
        },
      })),
  };

  return <DataListingView config={config} />;
}
