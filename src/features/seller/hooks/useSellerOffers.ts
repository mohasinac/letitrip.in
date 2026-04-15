"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { apiClient } from "@mohasinac/appkit/http";
import { API_ENDPOINTS } from "@/constants";
import { respondToOfferAction } from "@/actions";
import type { OfferDocument } from "@/db/schema";
import type { RespondToOfferInput } from "@/actions";

// ─── Seller: list incoming offers ──────────────────────────────────────────

export function useSellerOffers() {
  const { user, loading } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<OfferDocument[]>({
    queryKey: ["seller-offers"],
    queryFn: async () => {
      const res = await apiClient.get<{ items: OfferDocument[] }>(
        API_ENDPOINTS.OFFERS.SELLER_LIST,
      );
      return res.items ?? [];
    },
    enabled: !loading && !!user,
    staleTime: 30_000,
  });

  return {
    offers: data ?? [],
    isLoading: loading || isLoading,
    error,
    refetch,
  };
}

// ─── Seller: respond (accept / decline / counter) ─────────────────────────

export function useRespondToOffer(
  onSuccess?: (offer: OfferDocument) => void,
  onError?: (err: { message?: string }) => void,
) {
  const queryClient = useQueryClient();
  return useMutation<OfferDocument, Error, RespondToOfferInput>({
    mutationFn: respondToOfferAction,
    onSuccess: (offer) => {
      queryClient.invalidateQueries({ queryKey: ["seller-offers"] });
      onSuccess?.(offer);
    },
    onError,
  });
}

