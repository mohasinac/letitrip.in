"use client";

import { useMutation } from "@tanstack/react-query";
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
  return useMutation<void, Error, void>({
    mutationFn: () => authService.logout(),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
