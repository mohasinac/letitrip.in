export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiClientOptions {
  baseURL?: string;
  defaultTimeout?: number;
}

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

function isLocalHost(hostname: string): boolean {
  return LOCAL_HOSTNAMES.has(hostname.toLowerCase());
}

function parseOrigin(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/**
 * Resolve a safe API base URL.
 * In browsers, if NEXT_PUBLIC_APP_URL points to localhost on a non-local host,
 * prefer the current origin to prevent accidental cross-origin localhost calls.
 */
export function resolveApiBaseUrl(
  browserOrigin?: string,
  configuredBaseUrl?: string,
): string {
  const envBase = (
    configuredBaseUrl ??
    process.env.NEXT_PUBLIC_APP_URL ??
    ""
  ).trim();
  const currentOrigin = (browserOrigin ?? "").trim();

  if (!envBase) {
    return currentOrigin;
  }

  if (!currentOrigin) {
    return envBase;
  }

  const envUrl = parseOrigin(envBase);
  const currentUrl = parseOrigin(currentOrigin);

  if (!envUrl || !currentUrl) {
    return currentOrigin || envBase;
  }

  if (isLocalHost(envUrl.hostname) && !isLocalHost(currentUrl.hostname)) {
    return currentOrigin;
  }

  return envBase;
}

export class ApiClient {
  private readonly baseURL: string;
  private readonly defaultTimeout: number;

  constructor(options?: ApiClientOptions) {
    this.baseURL = options?.baseURL ?? "";
    this.defaultTimeout = options?.defaultTimeout ?? 120_000;
  }

  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const origin =
      this.baseURL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    const url = new URL(endpoint, origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }

  private async getHeaders(
    method: string,
    customHeaders?: HeadersInit,
  ): Promise<HeadersInit> {
    const hasBody = !["GET", "HEAD", "DELETE"].includes(method.toUpperCase());
    return {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...customHeaders,
    };
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<T> {
    const {
      params,
      timeout = this.defaultTimeout,
      headers: customHeaders,
      signal: externalSignal,
      ...fetchConfig
    } = config;

    const method = (fetchConfig.method ?? "GET").toUpperCase();
    const url = this.buildURL(endpoint, params);
    const headers = await this.getHeaders(method, customHeaders);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let onAbort: (() => void) | null = null;
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        onAbort = () => controller.abort();
        externalSignal.addEventListener("abort", onAbort);
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        signal: controller.signal,
        credentials: "include",
      });

      clearTimeout(timeoutId);

      const data: ApiResponse<T> = await response.json().catch(() => ({
        success: false,
        error: "Invalid JSON response",
      }));

      if (!response.ok) {
        throw new ApiClientError(
          data.error ??
            data.message ??
            `Request failed with status ${response.status}`,
          response.status,
          data,
        );
      }

      if (!data.success) {
        throw new ApiClientError(
          data.error ?? data.message ?? "Request failed",
          response.status,
          data,
        );
      }

      return data.data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        if (externalSignal?.aborted) throw error;
        throw new ApiClientError("Request timeout", 408);
      }

      if (error instanceof TypeError) {
        throw new ApiClientError(
          "Network error. Please check your connection.",
          0,
        );
      }

      if (error instanceof ApiClientError) throw error;

      throw new ApiClientError(
        error instanceof Error ? error.message : "An unexpected error occurred",
        500,
      );
    } finally {
      if (onAbort) externalSignal?.removeEventListener("abort", onAbort);
    }
  }

  async get<T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data != null ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data != null ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data != null ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = unknown>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  async upload<T = unknown>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig,
  ): Promise<T> {
    const { headers, ...restConfig } = config ?? {};
    const uploadHeaders = await this.getHeaders("POST", headers);
    delete (uploadHeaders as Record<string, string>)["Content-Type"];

    return this.request<T>(endpoint, {
      ...restConfig,
      method: "POST",
      body: formData,
      headers: uploadHeaders,
    });
  }
}

const runtimeOrigin =
  typeof window !== "undefined" ? window.location.origin : "";

export const apiClient = new ApiClient({
  baseURL: resolveApiBaseUrl(runtimeOrigin),
});
