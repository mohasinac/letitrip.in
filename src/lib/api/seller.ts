import { auth } from "@/lib/database/config";

/**
 * Utility function to make authenticated API calls to seller endpoints
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
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
  formData: FormData,
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
  try {
    const response = await fetchWithAuth(url, { method: "GET" });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }
    return response.json();
  } catch (error: any) {
    // If it's an authentication error, return a structured error response
    if (error.message?.includes("not authenticated")) {
      return { success: false, error: "Authentication required" } as T;
    }
    throw error;
  }
}

/**
 * Helper function for POST requests
 */
export async function apiPost<T>(url: string, data: any): Promise<T> {
  try {
    const response = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    const jsonResponse = await response.json();
    
    // Return the response regardless of status - let caller handle errors
    if (!response.ok) {
      return { success: false, error: jsonResponse.error || jsonResponse.message || "Request failed" } as T;
    }
    
    return jsonResponse;
  } catch (error: any) {
    // If it's an authentication error, return a structured error response
    if (error.message?.includes("not authenticated")) {
      return { success: false, error: "Authentication required" } as T;
    }
    // Return structured error for any other errors
    return { success: false, error: error.message || "Request failed" } as T;
  }
}

/**
 * Helper function for PUT requests
 */
export async function apiPut<T>(url: string, data: any): Promise<T> {
  try {
    const response = await fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    
    const jsonResponse = await response.json();
    
    // Return the response regardless of status - let caller handle errors
    if (!response.ok) {
      return { success: false, error: jsonResponse.error || jsonResponse.message || "Request failed" } as T;
    }
    
    return jsonResponse;
  } catch (error: any) {
    // If it's an authentication error, return a structured error response
    if (error.message?.includes("not authenticated")) {
      return { success: false, error: "Authentication required" } as T;
    }
    // Return structured error for any other errors
    return { success: false, error: error.message || "Request failed" } as T;
  }
}

/**
 * Helper function for DELETE requests
 */
export async function apiDelete<T>(url: string): Promise<T> {
  try {
    const response = await fetchWithAuth(url, { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }
    return response.json();
  } catch (error: any) {
    // If it's an authentication error, return a structured error response
    if (error.message?.includes("not authenticated")) {
      return { success: false, error: "Authentication required" } as T;
    }
    throw error;
  }
}
