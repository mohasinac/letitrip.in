"use client";

import React, { useState } from "react";
import { useAdminListingData, toRecordArray, toStringValue, toRelativeDate, AdminListingScaffold, ADMIN_ENDPOINTS } from "@mohasinac/appkit/client";

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
      isLoading={isLoading}
      errorMessage={errorMessage}
      searchValue={q}
      onSearch={setQ}
      searchPlaceholder="Search featured products by name or seller…"
      actionLabel="+ Add Product"
      actionHref="/admin/products/new"
      columns={[
        { key: "primary", header: "Product" },
        { key: "secondary", header: "Seller · Price" },
        { key: "status", header: "Status" },
        { key: "updatedAt", header: "Updated" },
      ]}
      getRowHref={(row) => `/admin/products/${row.id}/edit`}
    />
  );
}
