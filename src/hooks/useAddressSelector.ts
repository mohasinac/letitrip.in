"use client";

import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { addressService } from "@/services";
import { createAddressAction } from "@/actions";
import type { AddressFormData } from "./useAddresses";

interface SavedAddress {
  id: string;
  label: string;
  city: string;
  fullName?: string;
  state?: string;
}

interface AddressesApiResponse {
  success?: boolean;
  data?: SavedAddress[];
  items?: SavedAddress[];
}

interface CreateAddressApiResponse {
  success: boolean;
  data?: SavedAddress;
}

/**
 * useAddressSelector
 *
 * Bundles the address list query and create-address mutation for
 * AddressSelectorCreate. Uses queryKey ["user-addresses"] to stay consistent
 * with the existing cache used by that component.
 *
 * @example
 * const { addresses, isLoading, refetch, createAddress, isSaving } = useAddressSelector({
 *   onCreated: (id) => onChange(id),
 *   onCreateError: () => showError('Failed'),
 * });
 */
export function useAddressSelector(options?: {
  onCreated?: (id: string) => void;
  onCreateError?: () => void;
}) {
  const {
    data: raw,
    isLoading,
    refetch,
  } = useQuery<AddressesApiResponse>({
    queryKey: ["user-addresses"],
    queryFn: () => addressService.list(),
  });

  const addresses: SavedAddress[] = raw?.data ?? raw?.items ?? [];

  const { mutate: createAddress, isPending: isSaving } = useMutation<
    CreateAddressApiResponse,
    Error,
    AddressFormData
  >({
    mutationFn: async (data) => {
      const result = await createAddressAction({
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
