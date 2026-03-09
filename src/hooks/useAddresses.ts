/**
 * User Addresses Hooks
 *
 * Custom hooks for user address operations using the centralized API client.
 * Replaces the stub implementations removed in task 1.29.
 *
 * @example
 * ```tsx
 * const { data: addresses, isLoading } = useAddresses();
 * const { mutate: createAddress } = useCreateAddress({
 *   onSuccess: () => toast.success('Address added!')
 * });
 * const { mutate: deleteAddress } = useDeleteAddress({
 *   onSuccess: () => toast.success('Address deleted!')
 * });
 * ```
 */

import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/actions";
import { addressService } from "@/services";

// ============================================================================
// Types
// ============================================================================

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface AddressFormData {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

interface SetDefaultAddressData {
  addressId: string;
}

// ============================================================================
// Address Hooks
// ============================================================================

/**
 * Hook to fetch all user addresses
 */
export function useAddresses(options?: {
  enabled?: boolean;
  onSuccess?: (data: Address[]) => void;
  onError?: (error: any) => void;
}) {
  return useApiQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: () => addressService.list(),
    enabled: options?.enabled,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook to fetch a single address by ID
 */
export function useAddress(
  id: string,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: Address) => void;
    onError?: (error: any) => void;
  },
) {
  return useApiQuery<Address>({
    queryKey: ["address", id],
    queryFn: () => addressService.getById(id),
    enabled: options?.enabled !== false && !!id,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook to create a new address
 */
export function useCreateAddress(options?: {
  onSuccess?: (data: Address) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useApiMutation<Address, AddressFormData>({
    mutationFn: (data) =>
      createAddressAction({
        ...data,
        isDefault: data.isDefault ?? false,
      }) as Promise<Address>,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Hook to update an existing address
 */
export function useUpdateAddress(
  id: string,
  options?: {
    onSuccess?: (data: Address) => void;
    onError?: (error: Error) => void;
  },
) {
  const queryClient = useQueryClient();
  return useApiMutation<Address, AddressFormData>({
    mutationFn: (data) => updateAddressAction(id, data) as Promise<Address>,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["address", id] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Hook to delete an address
 */
export function useDeleteAddress(options?: {
  onSuccess?: (data: void) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useApiMutation<void, { id: string }>({
    mutationFn: (data) => deleteAddressAction(data.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Hook to set an address as default
 */
export function useSetDefaultAddress(options?: {
  onSuccess?: (data: Address) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useApiMutation<Address, SetDefaultAddressData>({
    mutationFn: (data) =>
      setDefaultAddressAction(data.addressId) as Promise<Address>,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}
