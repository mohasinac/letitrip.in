"use client";

import { listAdminBidsAction } from "@/actions";
import { createAdminListQuery, extractBasicMeta } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { BidDocument } from "@/db/schema";

export function useAdminBids(sieveParams: string) {
  return createAdminListQuery<
    BidDocument,
    { bids: BidDocument[]; meta: AdminListMeta }
  >({
    queryKey: ["admin", "bids"],
    sieveParams,
    action: listAdminBidsAction,
    transform: (result) => ({
      bids: result.items,
      meta: extractBasicMeta(result),
    }),
  });
}
