# @mohasinac/http — Changelog

## [0.1.0] — 2026-01-01 — Initial extraction

### Added

- **`ApiClient`** — Typed HTTP client class with configurable `baseUrl`, `defaultHeaders`, and `timeout`. Methods: `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `delete<T>`. All return `Promise<T>`.
- **`ApiClientError`** — Error class extending `Error`. Carries `status: number`, `data: unknown`, and `message`.
- **`apiClient`** — Default singleton `ApiClient` instance configured for browser-side API calls.
- **Exports**: `ApiClient`, `ApiClientError`, `apiClient` and their types re-exported from `index.ts`.
