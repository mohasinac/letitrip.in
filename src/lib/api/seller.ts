import { auth } from "@/lib/database/config";

/**
 * Utility function to make authenticated API calls to seller endpoints
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated. Please log in to continue.");
  }

  const token = await user.getIdToken();

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  
  // Only set Content-Type if not already set and not FormData
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Helper function for file uploads with authentication
 * Automatically adds Firebase auth token to FormData uploads
 */
export async function uploadWithAuth(
  url: string,
  formData: FormData
): Promise<Response> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated. Please log in to continue.");
  }

  const token = await user.getIdToken();

  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

/**
 * Helper function for GET requests
 */
export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, { method: "GET" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }
  return response.json();
}

/**
 * Helper function for POST requests
 */
export async function apiPost<T>(url: string, data: any): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }
  return response.json();
}

/**
 * Helper function for PUT requests
 */
export async function apiPut<T>(url: string, data: any): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }
  return response.json();
}

/**
 * Helper function for DELETE requests
 */
export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, { method: "DELETE" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }
  return response.json();
}
