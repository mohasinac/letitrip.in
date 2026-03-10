"use client";

/**
 * useAlgoliaSync
 *
 * Wraps Algolia index rebuild operations as mutation hooks.
 * Used by AdminSiteView to trigger server-side index syncs.
 * Algolia operations call external services — they go through API routes,
 * not Server Actions.
 */

import { useMutation } from "@tanstack/react-query";
import { adminService } from "@/services";

export interface AlgoliaSyncResult {
  indexed?: number;
}

/**
 * Trigger full product index rebuild in Algolia.
 */
export function useAlgoliaSyncProducts() {
  return useMutation<AlgoliaSyncResult, Error, void>({
    mutationFn: () => adminService.algoliaSync(),
  });
}

/**
 * Trigger static pages / categories / blog / events index rebuild in Algolia.
 */
export function useAlgoliaSyncPages() {
  return useMutation<AlgoliaSyncResult, Error, void>({
    mutationFn: () => adminService.algoliaSyncPages(),
  });
}
