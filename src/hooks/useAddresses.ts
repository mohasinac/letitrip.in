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
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

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
    queryFn: () => apiClient.get(API_ENDPOINTS.USER.ADDRESSES.LIST),
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
    queryFn: () => apiClient.get(API_ENDPOINTS.USER.ADDRESSES.GET_BY_ID(id)),
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
  onError?: (error: any) => void;
}) {
  return useApiMutation<Address, AddressFormData>({
    mutationFn: (data) =>
      apiClient.post(API_ENDPOINTS.USER.ADDRESSES.CREATE, data),
    onSuccess: options?.onSuccess,
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
    onError?: (error: any) => void;
  },
) {
  return useApiMutation<Address, AddressFormData>({
    mutationFn: (data) =>
      apiClient.patch(API_ENDPOINTS.USER.ADDRESSES.UPDATE(id), data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook to delete an address
 */
export function useDeleteAddress(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, { id: string }>({
    mutationFn: (data) =>
      apiClient.delete(API_ENDPOINTS.USER.ADDRESSES.DELETE(data.id)),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook to set an address as default
 */
export function useSetDefaultAddress(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, SetDefaultAddressData>({
    mutationFn: (data) =>
      apiClient.post(API_ENDPOINTS.USER.ADDRESSES.SET_DEFAULT(data.addressId)),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
