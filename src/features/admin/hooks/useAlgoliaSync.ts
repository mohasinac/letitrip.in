"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export type AlgoliaSyncTarget = "products" | "pages";
export type AlgoliaSyncAction = "sync" | "clear";

export interface AlgoliaSyncResult {
  indexed?: number;
  deleted?: number;
  total?: number;
  cleared?: boolean;
  error?: string;
}

export interface AlgoliaSyncVars {
  action: AlgoliaSyncAction;
  target: AlgoliaSyncTarget;
}

/** Generic sync/clear mutation used by AlgoliaDashboardView. */
export function useAlgoliaSync() {
  return useMutation<AlgoliaSyncResult, Error, AlgoliaSyncVars>({
    mutationFn: (vars) =>
      apiClient.post(
        API_ENDPOINTS.DEMO.ALGOLIA,
        vars,
      ) as Promise<AlgoliaSyncResult>,
  });
}

/** Trigger full product index rebuild in Algolia. Used by AdminSiteView. */
export function useAlgoliaSyncProducts() {
  return useMutation<AlgoliaSyncResult, Error, void>({
    mutationFn: () => apiClient.post(API_ENDPOINTS.ADMIN.ALGOLIA_SYNC),
  });
}

/** Trigger static pages/categories/blog/events index rebuild. Used by AdminSiteView. */
export function useAlgoliaSyncPages() {
  return useMutation<AlgoliaSyncResult, Error, void>({
    mutationFn: () => apiClient.post(API_ENDPOINTS.ADMIN.ALGOLIA_SYNC_PAGES),
  });
}
