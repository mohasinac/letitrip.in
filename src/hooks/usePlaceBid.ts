"use client";

import { useApiMutation } from "./useApiMutation";
import { bidService } from "@/services";
import type { BidDocument } from "@/db/schema";

interface PlaceBidPayload {
  productId: string;
  bidAmount: number;
}

/**
 * usePlaceBid
 *
 * Mutation hook for placing a bid on an auction product.
 * Wraps bidService.create() to keep client components free of @/services imports (Rule 20).
 *
 * @example
 * const { mutateAsync, isLoading } = usePlaceBid();
 * const bid = await mutateAsync({ productId, bidAmount: amount });
 */
export function usePlaceBid() {
  return useApiMutation<BidDocument, PlaceBidPayload>({
    mutationFn: (data) => bidService.create(data) as Promise<BidDocument>,
  });
}
