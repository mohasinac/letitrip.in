import { useQuery } from "@tanstack/react-query";
import { orderService, addressService } from "@/services";

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
  const { data: ordersData, isLoading: ordersLoading } = useQuery<{
    data: { total: number };
  }>({
    queryKey: ["user-orders-count"],
    queryFn: () => orderService.list(),
    enabled,
  });

  const { data: addressesData, isLoading: addressesLoading } = useQuery<{
    data: unknown[];
  }>({
    queryKey: ["user-addresses-count"],
    queryFn: () => addressService.list(),
    enabled,
  });

  return {
    orderCount: ordersData?.data?.total ?? 0,
    addressCount: Array.isArray(addressesData?.data)
      ? addressesData.data.length
      : 0,
    isLoading: ordersLoading || addressesLoading,
  };
}
