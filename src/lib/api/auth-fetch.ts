/**
 * Fetch helper with automatic auth token inclusion
 */

export async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const token = await getAuthToken();
  
  const headers = {
    ...options?.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  });
}

/**
 * Get current authentication token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    // Try to get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('firebase_token');
      if (token) {
        return token;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Store auth token
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * Clear auth token
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('firebase_token');
  }
}
