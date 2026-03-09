"use client";

/**
 * useAlgoliaSync
 *
 * Wraps Algolia index rebuild operations as mutation hooks.
 * Used by AdminSiteView to trigger server-side index syncs.
 * Algolia operations call external services — they go through API routes,
 * not Server Actions.
 */

import { useApiMutation } from "./useApiMutation";
import { adminService } from "@/services";

export interface AlgoliaSyncResult {
  indexed?: number;
}

/**
 * Trigger full product index rebuild in Algolia.
 */
export function useAlgoliaSyncProducts() {
  return useApiMutation<AlgoliaSyncResult, void>({
    mutationFn: () => adminService.algoliaSync(),
  });
}

/**
 * Trigger static pages / categories / blog / events index rebuild in Algolia.
 */
export function useAlgoliaSyncPages() {
  return useApiMutation<AlgoliaSyncResult, void>({
    mutationFn: () => adminService.algoliaSyncPages(),
  });
}
