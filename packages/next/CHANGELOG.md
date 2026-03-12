# @mohasinac/next — Changelog

## [0.1.0] — 2026-01-01 — Initial extraction

### Added

- **`IAuthVerifier`** — Interface for verifying Firebase ID tokens in Next.js API routes. `verify(token: string): Promise<DecodedIdToken>`.
- **`createApiErrorHandler(logger?)`** — Factory that returns a typed error handler for Next.js API route catch blocks. Converts `ApiClientError`, known HTTP errors, and unexpected errors into structured `NextResponse.json` responses with appropriate status codes. Accepts an optional `logger` instance for server-side logging.
- **Exports**: `IAuthVerifier`, `createApiErrorHandler` and their types re-exported from `index.ts`.
