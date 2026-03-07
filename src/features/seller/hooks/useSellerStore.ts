"use client";

import { useApiQuery, useApiMutation, useAuth } from "@/hooks";
import { sellerService } from "@/services";
import type { StoreDocument } from "@/db/schema";

/**
 * useSellerStore
 *
 * Fetches the authenticated seller's StoreDocument and exposes
 * create + update mutations.
 *
 * - `store === null`  → seller has not set up a store yet → show setup form
 * - `store !== null`  → seller has a store → show edit form
 */
export function useSellerStore() {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading, error, refetch } = useApiQuery<{
    store: StoreDocument | null;
  }>({
    queryKey: ["seller-store"],
    queryFn: () => sellerService.getStore(),
    enabled: !authLoading && !!user,
  });

  const { mutate: createStore, isLoading: isCreating } = useApiMutation<
    { store: StoreDocument },
    unknown
  >({
    mutationFn: (payload) => sellerService.createStore(payload),
    onSuccess: () => refetch(),
  });

  const { mutate: updateStore, isLoading: isSaving } = useApiMutation<
    { store: StoreDocument },
    unknown
  >({
    mutationFn: (payload) => sellerService.updateStore(payload),
    onSuccess: () => refetch(),
  });

  const store = data?.store ?? null;

  return {
    store,
    hasStore: store !== null,
    storeSlug: store?.storeSlug ?? null,
    storeStatus: store?.status ?? null,
    isLoading: authLoading || isLoading,
    isCreating,
    isSaving,
    error,
    createStore,
    updateStore,
    refetch,
  };
}
