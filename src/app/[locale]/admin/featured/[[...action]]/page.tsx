"use client";

import React, { useState } from "react";
import { useAdminListingData, toRecordArray, toStringValue, toRelativeDate } from "@mohasinac/appkit";
import { AdminListingScaffold } from "@mohasinac/appkit";
import { ADMIN_ENDPOINTS } from "@mohasinac/appkit";

interface ProductsResponse {
  items?: unknown[];
  total?: number;
}

export default function Page() {
  const [q, setQ] = useState("");

  const { rows, total, isLoading, errorMessage } = useAdminListingData<
    ProductsResponse,
    { id: string; primary: string; secondary: string; status: string; updatedAt: string }
  >({
    queryKey: ["admin", "featured", "listing", q],
    endpoint: ADMIN_ENDPOINTS.PRODUCTS,
    filters: "featured==true",
    q,
    mapRows: (response) =>
      toRecordArray(response.items).map((item: any, index) => ({
        id: toStringValue(item.id, `product-${index}`),
        primary: toStringValue(item.title ?? item.name, "Untitled product"),
        secondary: [
          toStringValue(item.sellerName ?? item.storeName, "Unknown seller"),
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

  return (
    <AdminListingScaffold
      title="Featured Products"
      subtitle="Products marked as featured — shown in the Featured tab on the Promotions page"
      rows={rows}
      total={total}
      isLoading={isLoading}
      errorMessage={errorMessage}
      searchValue={q}
      onSearch={setQ}
      searchPlaceholder="Search featured products by name or seller…"
      actionLabel="+ Add Product"
      actionHref="/admin/products/new"
      columns={[
        { key: "primary", label: "Product" },
        { key: "secondary", label: "Seller · Price" },
        { key: "status", label: "Status" },
        { key: "updatedAt", label: "Updated" },
      ]}
      getRowHref={(row) => `/admin/products/${row.id}/edit`}
    />
  );
}
