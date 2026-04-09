"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import {
  adminCreateFaqAction,
  adminUpdateFaqAction,
  adminDeleteFaqAction,
} from "@/actions";
import type { FAQDocument } from "@/db/schema";

interface FAQsListResponse {
  items: FAQDocument[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

export function useAdminFaqs(paramsString: string) {
  const query = useQuery<FAQsListResponse>({
    queryKey: ["admin", "faqs", paramsString],
    queryFn: () =>
      apiClient.get<FAQsListResponse>(
        `/api/admin/faqs${paramsString ? `?${paramsString}` : ""}`,
      ),
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
