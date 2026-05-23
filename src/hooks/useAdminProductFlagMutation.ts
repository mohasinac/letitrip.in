"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ADMIN_ENDPOINTS } from "@mohasinac/appkit/client";

/**
 * Shared mutation hook for admin "remove from {deals|featured}" bulk actions
 * on the admin/deals and admin/featured pages. Centralises the apiClient
 * call (which lir/no-apiclient-outside-services blocks in page components)
 * and the query-invalidation step.
 */
export function useAdminProductFlagMutation(
  field: "isPromoted" | "featured",
  queryKey: readonly unknown[],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(ADMIN_ENDPOINTS.PRODUCT_BY_ID(id), { [field]: false });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...queryKey] });
    },
  });
}
