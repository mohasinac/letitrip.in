"use client";

import { useQuery } from "@tanstack/react-query";
import { listAdminBidsAction } from "@/actions";
import type { BidDocument } from "@/db/schema";

interface BidsMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * useAdminBids
 * Accepts a pre-built sieve params string (from `table.buildSieveParams(...)`)
 * and fetches the paginated bids list via `adminService.listBids()`.
 */
export function useAdminBids(sieveParams: string) {
  return useQuery<{ bids: BidDocument[]; meta: BidsMeta }>({
    queryKey: ["admin", "bids", sieveParams],
    queryFn: async () => {
      const sp = new URLSearchParams(sieveParams);
      const result = await listAdminBidsAction({
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
      return {
        bids: result.items,
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
        },
      };
    },
  });
}
