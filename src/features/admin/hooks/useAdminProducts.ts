"use client";

import { useMutation } from "@tanstack/react-query";
import {
  adminCreateProductAction,
  adminUpdateProductAction,
  adminDeleteProductAction,
} from "@/actions";
import { createAdminListQuery } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { AdminProduct } from "../components";

export function useAdminProducts(sieveParams: string) {
  const query = createAdminListQuery<
    {
      items: AdminProduct[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    },
    { products: AdminProduct[]; meta: AdminListMeta }
  >({
    queryKey: ["admin", "products"],
    sieveParams,
    endpoint: "/api/admin/products",
    transform: (result) => ({
      products: result.items,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
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

