/**
 * Client-Side Error Redirect Utility
 *
 * Handles redirects to appropriate error pages based on API response status codes.
 * Use this in client components when handling API errors.
 *
 * @example
 * ```tsx
 * import { redirectOnError } from '@/lib/errors/client-redirect';
 *
 * try {
 *   const response = await fetch('/api/protected');
 *   if (!response.ok) {
 *     redirectOnError(response.status);
 *   }
 * } catch (error) {
 *   redirectOnError(500);
 * }
 * ```
 */

"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";

/**
 * Redirect to appropriate error page based on status code
 */
export function redirectOnError(
  statusCode: number,
  router?: ReturnType<typeof useRouter>,
): void {
  // If router not provided, use window.location for immediate redirect
  if (!router) {
    switch (statusCode) {
      case 401:
      case 403:
        window.location.href = ROUTES.ERRORS.UNAUTHORIZED;
        break;
      case 404:
        window.location.href = ROUTES.ERRORS.NOT_FOUND;
        break;
      default:
        // For 500 and other errors, let the error.tsx handle it
        // by reloading the page or showing error UI
        console.error(`Error ${statusCode} occurred`);
    }
    return;
  }

  // Use Next.js router for navigation (preserves app state)
  switch (statusCode) {
    case 401:
    case 403:
      router.push(ROUTES.ERRORS.UNAUTHORIZED);
      break;
    case 404:
      router.push(ROUTES.ERRORS.NOT_FOUND);
      break;
    default:
      // For 500 and other errors, let error.tsx boundary catch it
      console.error(`Error ${statusCode} occurred`);
  }
}

/**
 * Hook for error redirection
 */
export function useErrorRedirect() {
  const router = useRouter();

  const handleError = (statusCode: number) => {
    redirectOnError(statusCode, router);
  };

  return { redirectOnError: handleError };
}

/**
 * Check response and redirect if error status
 */
export async function checkResponseOrRedirect(
  response: Response,
  router?: ReturnType<typeof useRouter>,
): Promise<boolean> {
  if (!response.ok) {
    redirectOnError(response.status, router);
    return false;
  }
  return true;
}
