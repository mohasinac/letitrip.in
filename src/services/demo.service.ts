import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export interface SeedCollectionStatus {
  name: string;
  seedCount: number;
  existingCount: number;
}

export interface SeedOperationResult {
  message: string;
  details: {
    created?: number;
    updated?: number;
    deleted?: number;
    skipped?: number;
    errors?: number;
    collections?: string[];
  };
}

/**
 * Demo / dev-only service.
 * Seeds the database via the demo seed API route.
 */
export const demoService = {
  seed: (payload: unknown) =>
    apiClient.post<SeedOperationResult>(API_ENDPOINTS.DEMO.SEED, payload),
  getSeedStatus: () =>
    apiClient.get<{ collections: SeedCollectionStatus[] }>(
      API_ENDPOINTS.DEMO.SEED_STATUS,
    ),
};
