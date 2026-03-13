"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  listAdminProductsAction,
  adminCreateProductAction,
  adminUpdateProductAction,
  adminDeleteProductAction,
} from "@/actions";
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
  const query = useQuery<{
    products: AdminProduct[];
    meta: ProductListMeta;
  }>({
    queryKey: ["admin", "products", sieveParams],
    queryFn: async () => {
      const sp = new URLSearchParams(sieveParams);
      const result = await listAdminProductsAction({
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
      return {
        products: result.items as unknown as AdminProduct[],
        meta: {
          page: result.page,
          limit: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        },
      };
    },
  });

  const createMutation = useMutation<unknown, Error, unknown>({
    mutationFn: (data) =>
      adminCreateProductAction(
        data as Parameters<typeof adminCreateProductAction>[0],
      ),
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) =>
      adminUpdateProductAction(
        id,
        data as Parameters<typeof adminUpdateProductAction>[1],
      ),
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id) => adminDeleteProductAction(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
