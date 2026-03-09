"use client";

import { useApiMutation } from "./useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
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
 * Invalidates bid list and auction detail queries on success so the UI
 * reflects the new highest bid and RipCoin balance without a manual reload.
 *
 * @example
 * const { mutateAsync, isLoading } = usePlaceBid();
 * const bid = await mutateAsync({ productId, bidAmount: amount });
 */
export function usePlaceBid() {
  const queryClient = useQueryClient();

  return useApiMutation<BidDocument, PlaceBidPayload>({
    mutationFn: (data) => bidService.create(data) as Promise<BidDocument>,
    onSuccess: async (_, { productId }) => {
      // Refresh bid list and auction product detail so current bid + bid count update
      await queryClient.invalidateQueries({ queryKey: ["bids", productId] });
      await queryClient.invalidateQueries({ queryKey: ["auction", productId] });
      await queryClient.invalidateQueries({ queryKey: ["ripcoins"] });
    },
  });
}
