"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { createStoreAddressAction } from "@/actions";
import { apiClient } from "@mohasinac/appkit/http";
import type { AddressFormData } from "./useAddresses";

interface SavedAddress {
  id: string;
  label: string;
  city: string;
  fullName?: string;
  state?: string;
}

interface CreateAddressApiResponse {
  success: boolean;
  data?: SavedAddress;
}

/**
 * useStoreAddressSelector
 *
 * Bundles the store address list query and create-store-address mutation
 * for StoreAddressSelectorCreate. Mirrors useAddressSelector but
 * fetches store addresses instead of user addresses.
 */
export function useStoreAddressSelector(options?: {
  onCreated?: (id: string) => void;
  onCreateError?: () => void;
}) {
  const { data, isLoading, refetch } = useQuery<SavedAddress[]>({
    queryKey: ["store-addresses"],
    queryFn: () => apiClient.get<SavedAddress[]>("/api/seller/store/addresses"),
  });

  const addresses: SavedAddress[] = data ?? [];

  const { mutate: createAddress, isPending: isSaving } = useMutation<
    CreateAddressApiResponse,
    Error,
    AddressFormData
  >({
    mutationFn: async (data) => {
      const result = await createStoreAddressAction({
        ...data,
        isDefault: data.isDefault ?? false,
      });
      return {
        success: true,
        data: { id: result.id },
      } as CreateAddressApiResponse;
    },
    onSuccess: (res) => {
      refetch();
      if (res.data?.id) options?.onCreated?.(res.data.id);
    },
    onError: options?.onCreateError,
  });

  return { addresses, isLoading, refetch, createAddress, isSaving };
}
