"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import { API_ENDPOINTS } from "@/constants";

/**
 * useLogout
 *
 * Mutation hook that calls the backend logout endpoint to clear the session
 * cookie and revoke tokens.
 *
 * @example
 * const { mutateAsync: logout, isLoading } = useLogout();
 * await logout();
 */
export function useLogout(options?: {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}) {
  return useMutation<void, Error, void>({
    mutationFn: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
