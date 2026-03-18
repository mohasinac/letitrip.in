"use client";

import { useMutation } from "@tanstack/react-query";
import {
  algoliaSyncAction,
  algoliaSyncProductsAction,
  algoliaSyncPagesAction,
  algoliaSyncCategoriesAction,
  algoliaSyncStoresAction,
} from "@/actions";
import type { AlgoliaSyncResult, AlgoliaSyncVars } from "@/actions";

export type { AlgoliaSyncResult, AlgoliaSyncVars };
export type AlgoliaSyncTarget = "products" | "pages" | "categories" | "stores";
export type AlgoliaSyncAction = "sync" | "clear";

/** Generic sync/clear mutation used by AlgoliaDashboardView. */
export function useAlgoliaSync() {
  return useMutation<AlgoliaSyncResult, Error, AlgoliaSyncVars>({
    mutationFn: (vars) => algoliaSyncAction(vars),
  });
}

/** Trigger full product index rebuild in Algolia. Used by AdminSiteView. */
export function useAlgoliaSyncProducts() {
  return useMutation<AlgoliaSyncResult, Error, void>({
    mutationFn: () => algoliaSyncProductsAction(),
  });
}

/** Trigger static pages/categories/blog/events index rebuild. Used by AdminSiteView. */
export function useAlgoliaSyncPages() {
  return useMutation<AlgoliaSyncResult, Error, void>({
    mutationFn: () => algoliaSyncPagesAction(),
  });
}

/** Trigger full category index rebuild in Algolia. */
export function useAlgoliaSyncCategories() {
  return useMutation<AlgoliaSyncResult, Error, void>({
    mutationFn: () => algoliaSyncCategoriesAction(),
  });
}

/** Trigger full store index rebuild in Algolia. */
export function useAlgoliaSyncStores() {
  return useMutation<AlgoliaSyncResult, Error, void>({
    mutationFn: () => algoliaSyncStoresAction(),
  });
}
