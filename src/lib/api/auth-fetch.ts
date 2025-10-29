/**
 * Fetch helper with automatic auth token inclusion
 */

export async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const headers = {
    ...options?.headers,
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for auth
  });
}

/**
 * Get current authentication token
 */
export async function getAuthToken(): Promise<string | null> {
  // Auth token is in HTTP-only cookie, not accessible from client
  // Use fetchWithAuth which automatically includes cookies
  return null;
}

/**
 * Store auth token
 */
export function setAuthToken(token: string): void {
  // Tokens are now handled by server via HTTP-only cookies
}

/**
 * Clear auth token
 */
export function clearAuthToken(): void {
  // Tokens cleared by server via session deletion
}
