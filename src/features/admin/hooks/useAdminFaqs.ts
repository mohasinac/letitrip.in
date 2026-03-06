"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { faqService } from "@/services";
import type { FAQ } from "../components";

interface FAQsListResponse {
  items: FAQ[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

/**
 * useAdminFaqs
 * Accepts a pre-built URLSearchParams string and fetches the FAQs list.
 * Exposes create, update, and delete mutations.
 */
export function useAdminFaqs(paramsString: string) {
  const query = useApiQuery<FAQsListResponse | FAQ[]>({
    queryKey: ["faqs", "list", paramsString],
    queryFn: () => faqService.list(paramsString),
  });

  const createMutation = useApiMutation<unknown, unknown>({
    mutationFn: (data) => faqService.create(data),
  });

  const updateMutation = useApiMutation<unknown, { id: string; data: unknown }>(
    {
      mutationFn: ({ id, data }) => faqService.update(id, data),
    },
  );

  const deleteMutation = useApiMutation<unknown, string>({
    mutationFn: (id) => faqService.delete(id),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
