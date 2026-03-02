"use client";

import { useApiQuery, useApiMutation, useAuth } from "@/hooks";
import { sellerService } from "@/services";
import type { UserDocument } from "@/db/schema";

export interface SellerStoreData {
  uid: string;
  storeSlug: string | null;
  publicProfile: UserDocument["publicProfile"] | null;
}

/**
 * useSellerStore
 * Fetches the authenticated seller's store profile and exposes an update mutation.
 */
export function useSellerStore() {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading, error, refetch } = useApiQuery<SellerStoreData>({
    queryKey: ["seller-store"],
    queryFn: () => sellerService.getStore(),
    enabled: !authLoading && !!user,
  });

  const { mutate: updateStore, isLoading: isSaving } = useApiMutation<
    SellerStoreData,
    unknown
  >({
    mutationFn: (payload) => sellerService.updateStore(payload),
    onSuccess: () => refetch(),
  });

  return {
    data,
    storeSlug: data?.storeSlug ?? null,
    publicProfile: data?.publicProfile ?? null,
    isLoading: authLoading || isLoading,
    isSaving,
    error,
    updateStore,
    refetch,
  };
}
