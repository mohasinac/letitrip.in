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

function PageInner() {
  const router = useRouter();
  const removeFromDealsMutation = useAdminProductFlagMutation("isPromoted", QUERY_KEY);

  const config: ListingViewConfig<ProductsResponse, AdminListingScaffoldRow> = {
    portal: "admin",
    title: "Deals (Promoted Products)",
    search: {
      placeholder: "Search deals by name, brand or tag…",
      // 🛑 "or seller" was unkeepable — `buildProductSearchTxt` carries no
      // store name or id. See AdminPrizeDrawsView for the same correction.
      fields: ["title", "description", "brand", "categoryNames", "tags", "features"],
    },
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
    rowHrefTemplate: String(ROUTES.ADMIN.PRODUCTS_EDIT("{id}")),
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

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function Page() {
  return (
    <React.Suspense>
      <PageInner />
    </React.Suspense>
  );
}
