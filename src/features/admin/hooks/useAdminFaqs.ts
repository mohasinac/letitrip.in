"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { faqService } from "@/services";
import {
  adminCreateFaqAction,
  adminUpdateFaqAction,
  adminDeleteFaqAction,
} from "@/actions";
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
  const query = useQuery<FAQsListResponse | FAQ[]>({
    queryKey: ["faqs", "list", paramsString],
    queryFn: () => faqService.list(paramsString),
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
