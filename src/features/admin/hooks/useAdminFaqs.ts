"use client";

import { useMutation } from "@tanstack/react-query";
import {
  adminCreateFaqAction,
  adminUpdateFaqAction,
  adminDeleteFaqAction,
} from "@/actions";
import { createAdminListQuery } from "./createAdminListQuery";
import type { FAQ } from "../components";

interface FAQsListResponse {
  items: FAQ[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

export function useAdminFaqs(paramsString: string) {
  const query = createAdminListQuery<FAQsListResponse>({
    queryKey: ["faqs", "list"],
    sieveParams: paramsString,
    endpoint: "/api/faqs",
  });

  const createMutation = useMutation<unknown, Error, unknown>({
    mutationFn: (data) =>
      adminCreateFaqAction(data as Parameters<typeof adminCreateFaqAction>[0]),
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) =>
      adminUpdateFaqAction(
        id,
        data as Parameters<typeof adminUpdateFaqAction>[1],
      ),
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id) => adminDeleteFaqAction(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
