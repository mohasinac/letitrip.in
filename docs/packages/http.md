# `@lir/http` Package

**Package:** `packages/http/`  
**Alias:** `@lir/http`  
**Purpose:** Type-safe HTTP client wrapping the `fetch` API with automatic retry, auth header injection, error normalization, and request/response interceptors.

---

## Overview

All service functions in `src/services/` call `apiClient` from this package — never `fetch()` directly. This centralizes auth token injection, timeout handling, retry logic, and error formatting in one place.

---

## Types

```ts
interface ApiClientOptions {
  baseUrl?: string; // defaults to window.location.origin in browser
  timeout?: number; // request timeout ms (default: 10000)
  retries?: number; // max retries on 5xx/network errors (default: 2)
  retryDelay?: number; // base delay ms between retries (default: 500)
  headers?: Record<string, string>; // default headers on all requests
  getAuthToken?: () => Promise<string | null>; // async token provider
}

interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown; // auto JSON-serialized
  params?: Record<string, string | number | boolean>; // query params
  signal?: AbortSignal; // for cancellation
  timeout?: number; // per-request override
  retries?: number; // per-request override
  skipAuth?: boolean; // omit Authorization header
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}
```

---

## `ApiClientError`

Thrown for non-2xx responses. Always extends `Error`.

```ts
class ApiClientError extends Error {
  status: number; // HTTP status code
  code?: string; // application error code from response body
  data?: unknown; // parsed response body
  isNetworkError: boolean; // true for fetch/timeout failures
  isRetryable: boolean; // true for 429, 502, 503, 504
}
```

---

## `ApiClient` Class

**File:** `packages/http/src/ApiClient.ts`

```ts
import { ApiClient } from "@lir/http";

const client = new ApiClient({
  baseUrl: "https://letitrip.in",
  timeout: 15000,
  retries: 3,
  getAuthToken: () => auth.currentUser?.getIdToken() ?? null,
});
```

### Methods

| Method                   | Signature                | Description                      |
| ------------------------ | ------------------------ | -------------------------------- |
| `get<T>`                 | `(path, config?)`        | GET request                      |
| `post<T>`                | `(path, body?, config?)` | POST request                     |
| `put<T>`                 | `(path, body?, config?)` | PUT request                      |
| `patch<T>`               | `(path, body?, config?)` | PATCH request                    |
| `delete<T>`              | `(path, config?)`        | DELETE request                   |
| `request<T>`             | `(path, config)`         | Full config override             |
| `addRequestInterceptor`  | `(fn)`                   | Modify request before send       |
| `addResponseInterceptor` | `(fn)`                   | Transform response after receive |
| `setDefaultHeader`       | `(key, value)`           | Add persistent header            |
| `removeDefaultHeader`    | `(key)`                  | Remove persistent header         |

All methods return `Promise<T>` (unwrapped data) and throw `ApiClientError` on failure.

---

## `apiClient` Singleton

**File:** `packages/http/src/index.ts`

Pre-configured singleton exported for use across the app.

```ts
import { apiClient } from "@lir/http";
// or via re-export:
import { apiClient } from "@/lib/apiClient";
```

The singleton is configured with:

- `getAuthToken` → calls `firebase.auth().currentUser?.getIdToken()`
- Retry: 2 attempts on network errors and 5xx responses
- Timeout: 10 seconds
- Auto-attaches `X-Requested-With: XMLHttpRequest` header

### Service Usage Pattern

```ts
// src/services/product.service.ts
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants";

export const productService = {
  async getProduct(id: string) {
    return apiClient.get<Product>(API_ENDPOINTS.products.detail(id));
  },
  async listProducts(params: ProductListParams) {
    return apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.products.list,
      { params },
    );
  },
};
```

---

## Error Handling

Catch `ApiClientError` in hooks and surface errors via `useMessage()`:

```ts
import { ApiClientError } from "@lir/http";

try {
  await apiClient.post("/api/cart/add", { productId });
} catch (err) {
  if (err instanceof ApiClientError) {
    if (err.status === 409) showError("Item already in cart");
    else if (err.isNetworkError) showError("Network error, please retry");
    else showError(err.message);
  }
}
```

---

## SSR Safety

On the server (Next.js RSC / API routes), `apiClient` detects the absence of `window` and skips Firebase Auth token injection. Server code calls repositories directly via the Firebase Admin SDK — it does not go through `apiClient`.
