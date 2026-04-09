"use client";

/**
 * useStoreAddresses
 *
 * TanStack Query hooks for store address CRUD.
 * Used by the SellerStoreView store addresses section.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import { API_ENDPOINTS } from "@/constants";
import {
  createStoreAddressAction,
  updateStoreAddressAction,
  deleteStoreAddressAction,
} from "@/actions";
import type { StoreAddressDocument } from "@/db/schema";
import type { StoreAddressInput } from "@/actions";

export function useStoreAddresses(options?: { enabled?: boolean }) {
  return useQuery<StoreAddressDocument[]>({
    queryKey: ["store-addresses"],
    queryFn: () =>
      apiClient.get<StoreAddressDocument[]>(
        API_ENDPOINTS.SELLER.STORE_ADDRESSES,
      ),
    enabled: options?.enabled,
  });
}

export function useCreateStoreAddress(options?: {
  onSuccess?: (data: StoreAddressDocument) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation<StoreAddressDocument, Error, StoreAddressInput>({
    mutationFn: (data) => createStoreAddressAction(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["store-addresses"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export function useUpdateStoreAddress(options?: {
  onSuccess?: (data: StoreAddressDocument) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation<
    StoreAddressDocument,
    Error,
    { addressId: string; data: Partial<StoreAddressInput> }
  >({
    mutationFn: ({ addressId, data }) =>
      updateStoreAddressAction(addressId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["store-addresses"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export function useDeleteStoreAddress(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (addressId) => deleteStoreAddressAction(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-addresses"] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}
