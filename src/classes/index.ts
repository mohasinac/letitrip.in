/**
 * Classes Barrel Export — re-exports from @mohasinac/core
 *
 * All implementations now live in packages/core/src/.
 *
 * apiClient re-exported here for backward-compat callers that import from @/classes.
 * Prefer importing from @mohasinac/http directly in new code.
 */
export * from "@mohasinac/core";
export { apiClient, ApiClient, ApiClientError } from "@mohasinac/http";
