// API Service - Base HTTP client
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Handle server-side requests (when baseUrl is relative)
    let url = `${this.baseUrl}${endpoint}`;

    // In server-side context, convert to absolute URL
    if (typeof window === "undefined" && !url.startsWith("http")) {
      const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      url = `${host}${url}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        throw new Error(
          `Too many requests. Please try again in ${retryAfter} seconds.`
        );
      }

      // Handle unauthorized
      if (response.status === 401) {
        // Clear local storage but DON'T redirect automatically
        // Let the calling code handle the redirect to avoid loops
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
        }

        // Create error with status code for better handling
        const error = new Error("Unauthorized. Please log in again.") as any;
        error.status = 401;
        error.response = { status: 401 };
        throw error;
      }

      // Handle forbidden
      if (response.status === 403) {
        throw new Error("Access forbidden. You do not have permission.");
      }

      // Handle not found
      if (response.status === 404) {
        throw new Error("Resource not found.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Request failed");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiService = new ApiService();
