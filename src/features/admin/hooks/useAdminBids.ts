"use client";

import { createAdminListQuery } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { BidDocument } from "@/db/schema";

export function useAdminBids(sieveParams: string) {
  return createAdminListQuery<{ bids: BidDocument[]; meta: AdminListMeta }>({
    queryKey: ["admin", "bids"],
    sieveParams,
    endpoint: "/api/admin/bids",
  });
}
