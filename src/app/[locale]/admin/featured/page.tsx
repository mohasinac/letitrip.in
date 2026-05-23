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
import { apiClient } from "@mohasinac/appkit/client";

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

export default function Page() {
  const router = useRouter();

  const config: ListingViewConfig<ProductsResponse, AdminListingScaffoldRow> = {
    portal: "admin",
    title: "Featured Products",
    searchPlaceholder: "Search featured products by name or seller…",
    emptyLabel: "No featured products found",
    filterKeys: [],
    defaultSort: "-createdAt",
    queryKey: ["admin", "featured", "listing"],
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
    buildFilters: () => "featured==true",
    getRowHref: (row) => String(ROUTES.ADMIN.PRODUCTS_EDIT(row.id)),
    primaryAction: {
      label: "+ Add Product",
      onClick: () => router.push(String(ROUTES.ADMIN.PRODUCTS_NEW)),
    },
    buildBulkActions: (selection): BulkActionItem[] => [
      {
        id: "remove-featured",
        label: "Remove from Featured",
        variant: "danger",
        onClick: async () => {
          await Promise.all(
            selection.selectedIds.map((id) =>
              apiClient.patch(ADMIN_ENDPOINTS.PRODUCT_BY_ID(id), { featured: false }),
            ),
          );
          selection.clearSelection();
        },
      },
    ],
  };

  return <DataListingView config={config} />;
}
