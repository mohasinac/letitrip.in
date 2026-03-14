"use client";

import { useMutation } from "@tanstack/react-query";
import {
  listAdminProductsAction,
  adminCreateProductAction,
  adminUpdateProductAction,
  adminDeleteProductAction,
} from "@/actions";
import { createAdminListQuery, extractBasicMeta } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { AdminProduct } from "../components";

export function useAdminProducts(sieveParams: string) {
  const query = createAdminListQuery<
    unknown,
    { products: AdminProduct[]; meta: AdminListMeta }
  >({
    queryKey: ["admin", "products"],
    sieveParams,
    action: listAdminProductsAction,
    transform: (result) => ({
      products: result.items as unknown as AdminProduct[],
      meta: extractBasicMeta(result),
    }),
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
