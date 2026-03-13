"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { listAdminStoresAction, adminUpdateStoreStatusAction } from "@/actions";

export interface AdminStoreItem {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  disabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  storeSlug: string | null;
  storeStatus: "pending" | "approved" | "rejected";
  publicProfile: {
    isPublic?: boolean;
    bio?: string;
    location?: string;
    storeName?: string;
    storeDescription?: string;
    storeCategory?: string;
    storeLogoURL?: string;
    storeBannerURL?: string;
    storeReturnPolicy?: string;
    storeShippingPolicy?: string;
    isVacationMode?: boolean;
  } | null;
  stats: {
    totalOrders: number;
    itemsSold: number;
    reviewsCount: number;
    rating?: number;
  } | null;
}

interface StoreListResponse {
  items: AdminStoreItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * useAdminStores
 * Fetches the paginated seller store list for admin review.
 * Exposes a mutation to approve, reject, or toggle listing rights.
 */
export function useAdminStores(sieveParams: string) {
  const query = useQuery<StoreListResponse>({
    queryKey: ["admin", "stores", sieveParams],
    queryFn: async () => {
      const sp = new URLSearchParams(sieveParams);
      return listAdminStoresAction({
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      }) as unknown as Promise<StoreListResponse>;
    },
  });

  const updateStoreMutation = useMutation<
    unknown,
    Error,
    { uid: string; action: "approve" | "reject" }
  >({
    mutationFn: ({ uid, action }) =>
      adminUpdateStoreStatusAction({ uid, action }),
  });

  return { ...query, updateStoreMutation };
}
