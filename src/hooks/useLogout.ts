"use client";

import { useApiMutation } from "./useApiMutation";
import { authService } from "@/services";

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
  return useApiMutation<void, void>({
    mutationFn: () => authService.logout(),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
