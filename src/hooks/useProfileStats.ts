import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";

export interface ProfileStats {
  orderCount: number;
  addressCount: number;
  isLoading: boolean;
}

/**
 * Fetches profile statistics (order count + address count) for the
 * currently authenticated user.
 */
export function useProfileStats(enabled: boolean): ProfileStats {
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["user-orders-count"],
    queryFn: () =>
      apiClient.get<{ orders: unknown[]; total: number }>("/api/user/orders"),
    enabled,
  });

  const { data: addressesData, isLoading: addressesLoading } = useQuery({
    queryKey: ["user-addresses-count"],
    queryFn: () => apiClient.get<unknown[]>("/api/user/addresses"),
    enabled,
  });

  return {
    orderCount: ordersData?.total ?? 0,
    addressCount: Array.isArray(addressesData) ? addressesData.length : 0,
    isLoading: ordersLoading || addressesLoading,
  };
}
