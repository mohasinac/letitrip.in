"use client";

import { createAdminListQuery } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { BidDocument } from "@/db/schema";

export function useAdminBids(sieveParams: string) {
  return createAdminListQuery<
    {
      items: BidDocument[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    },
    { bids: BidDocument[]; meta: AdminListMeta }
  >({
    queryKey: ["admin", "bids"],
    sieveParams,
    endpoint: "/api/admin/bids",
    transform: (result) => ({
      bids: result.items,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    }),
  });
}

