"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services";
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
    queryFn: () => adminService.listBids(sieveParams),
  });
}
