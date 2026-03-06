"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { adminService } from "@/services";
import type { AdminProduct } from "../components";

interface ProductListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * useAdminProducts
 * Accepts a pre-built sieve params string and fetches the admin products list.
 * Exposes create, update, and delete mutations.
 */
export function useAdminProducts(sieveParams: string) {
  const query = useApiQuery<{
    products: AdminProduct[];
    meta: ProductListMeta;
  }>({
    queryKey: ["admin", "products", sieveParams],
    queryFn: () => adminService.listAdminProducts(sieveParams),
  });

  const createMutation = useApiMutation<unknown, unknown>({
    mutationFn: (data) => adminService.createAdminProduct(data),
  });

  const updateMutation = useApiMutation<unknown, { id: string; data: unknown }>(
    {
      mutationFn: ({ id, data }) => adminService.updateAdminProduct(id, data),
    },
  );

  const deleteMutation = useApiMutation<unknown, string>({
    mutationFn: (id) => adminService.deleteAdminProduct(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
