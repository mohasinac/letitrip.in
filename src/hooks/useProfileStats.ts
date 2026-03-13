import { useQuery } from "@tanstack/react-query";
import { listOrdersAction, listAddressesAction } from "@/actions";

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
    queryFn: () => listOrdersAction(),
    enabled,
  });

  const { data: addressesData, isLoading: addressesLoading } = useQuery({
    queryKey: ["user-addresses-count"],
    queryFn: () => listAddressesAction(),
    enabled,
  });

  return {
    orderCount: Array.isArray(ordersData) ? ordersData.length : 0,
    addressCount: Array.isArray(addressesData) ? addressesData.length : 0,
    isLoading: ordersLoading || addressesLoading,
  };
}
