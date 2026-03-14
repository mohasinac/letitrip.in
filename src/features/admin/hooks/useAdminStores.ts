"use client";

import { useMutation } from "@tanstack/react-query";
import { listAdminStoresAction, adminUpdateStoreStatusAction } from "@/actions";
import { createAdminListQuery } from "./createAdminListQuery";

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

export function useAdminStores(sieveParams: string) {
  const query = createAdminListQuery<unknown, StoreListResponse>({
    queryKey: ["admin", "stores"],
    sieveParams,
    action: listAdminStoresAction,
    transform: (result) => ({
      items: result.items as unknown as AdminStoreItem[],
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore ?? false,
    }),
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
