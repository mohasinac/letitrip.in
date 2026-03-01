import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

/**
 * Demo / dev-only service.
 * Seeds the database via the demo seed API route.
 */
export const demoService = {
  seed: (payload: unknown) => apiClient.post(API_ENDPOINTS.DEMO.SEED, payload),
};
