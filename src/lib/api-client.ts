// Thin shim — real implementation in @mohasinac/http
export { ApiClient, ApiClientError, apiClient } from "@mohasinac/http";
export type { RequestConfig, ApiResponse } from "@mohasinac/http";

// Re-export API_ENDPOINTS here for callers that do:
//   import { apiClient, API_ENDPOINTS } from '@/lib/api-client'
export { API_ENDPOINTS } from "@/constants";
