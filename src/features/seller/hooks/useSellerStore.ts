"use client";

import { useAuth } from "@/hooks";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import { API_ENDPOINTS } from "@/constants";
import { createStoreAction, updateStoreAction } from "@/actions";
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

  const { data, isLoading, error, refetch } = useQuery<{
    store: StoreDocument | null;
  }>({
    queryKey: ["seller-store"],
    queryFn: () =>
      apiClient.get<{ store: StoreDocument | null }>(
        API_ENDPOINTS.SELLER.STORE,
      ),
    enabled: !authLoading && !!user,
  });

  const { mutateAsync: createStore, isPending: isCreating } = useMutation<
    { store: StoreDocument },
    Error,
    Parameters<typeof createStoreAction>[0]
  >({
    mutationFn: (payload) => createStoreAction(payload),
    onSuccess: () => refetch(),
  });

  const { mutateAsync: updateStore, isPending: isSaving } = useMutation<
    { store: StoreDocument },
    Error,
    Parameters<typeof updateStoreAction>[0]
  >({
    mutationFn: (payload) => updateStoreAction(payload),
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
