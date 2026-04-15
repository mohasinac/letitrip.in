"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { apiClient } from "@mohasinac/appkit/http";
import { API_ENDPOINTS } from "@/constants";
import {
  makeOfferAction,
  acceptCounterOfferAction,
  counterOfferByBuyerAction,
  withdrawOfferAction,
} from "@/actions";
import type { OfferDocument } from "@/db/schema";
import type { MakeOfferInput, BuyerCounterInput } from "@/actions";

// ─── Buyer: list own offers ────────────────────────────────────────────────

export function useUserOffers() {
  const { user, loading } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<OfferDocument[]>({
    queryKey: ["user-offers"],
    queryFn: async () => {
      const res = await apiClient.get<{ items: OfferDocument[] }>(
        API_ENDPOINTS.OFFERS.BUYER_LIST,
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

// ─── Buyer: submit new offer ───────────────────────────────────────────────

export function useMakeOffer(
  onSuccess?: (offer: OfferDocument) => void,
  onError?: (err: { message?: string }) => void,
) {
  return useMutation<OfferDocument, Error, MakeOfferInput>({
    mutationFn: makeOfferAction,
    onSuccess,
    onError,
  });
}

// ─── Buyer: accept counter ─────────────────────────────────────────────────

export function useAcceptCounter(
  onSuccess?: () => void,
  onError?: (err: { message?: string }) => void,
) {
  return useMutation<OfferDocument, Error, { offerId: string }>({
    mutationFn: acceptCounterOfferAction,
    onSuccess,
    onError,
  });
}

// ─── Buyer: counter back against seller's counter ────────────────────────

export function useCounterOfferByBuyer(
  onSuccess?: (offer: OfferDocument) => void,
  onError?: (err: { message?: string }) => void,
) {
  return useMutation<OfferDocument, Error, BuyerCounterInput>({
    mutationFn: counterOfferByBuyerAction,
    onSuccess,
    onError,
  });
}

// ─── Buyer: withdraw offer ─────────────────────────────────────────────────

export function useWithdrawOffer(
  onSuccess?: () => void,
  onError?: (err: { message?: string }) => void,
) {
  return useMutation<void, Error, { offerId: string }>({
    mutationFn: withdrawOfferAction,
    onSuccess,
    onError,
  });
}

