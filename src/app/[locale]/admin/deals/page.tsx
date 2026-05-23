"use client";

import React from "react";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/client";
import {
  toRecordArray,
  toStringValue,
  toRelativeDate,
  DataListingView,
  ADMIN_ENDPOINTS,
} from "@mohasinac/appkit/client";
import type {
  AdminListingScaffoldRow,
  ListingViewConfig,
  BulkActionItem,
} from "@mohasinac/appkit/client";
import { useAdminProductFlagMutation } from "@/hooks";

interface ProductsResponse {
  items?: unknown[];
  total?: number;
}

const SORT_OPTIONS = [
  { label: "Newest first", value: "-createdAt" },
  { label: "Oldest first", value: "createdAt" },
  { label: "Name A→Z", value: "title" },
  { label: "Name Z→A", value: "-title" },
  { label: "Price low→high", value: "price" },
  { label: "Price high→low", value: "-price" },
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
    defaultSort: "-createdAt",
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
    buildBulkActions: (selection): BulkActionItem[] => [
      {
        id: "remove-deals",
        label: "Remove from Deals",
        variant: "danger",
        onClick: async () => {
          await Promise.all(
            selection.selectedIds.map((id) => removeFromDealsMutation.mutateAsync(id)),
          );
          selection.clearSelection();
        },
      },
    ],
  };

  return <DataListingView config={config} />;
}
