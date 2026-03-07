"use client";

import { useState, useCallback } from "react";
import { useApiQuery, useApiMutation } from "@/hooks";
import { demoService } from "@/services";
import type { SeedCollectionStatus, SeedOperationResult } from "@/services";

export type SeedCollectionName =
  | "users"
  | "addresses"
  | "categories"
  | "products"
  | "orders"
  | "reviews"
  | "bids"
  | "coupons"
  | "carouselSlides"
  | "homepageSections"
  | "siteSettings"
  | "faqs"
  | "notifications"
  | "payouts"
  | "blogPosts"
  | "events"
  | "eventEntries"
  | "sessions"
  | "carts";

export interface SeedActionResult extends SeedOperationResult {
  success: boolean;
}

export function useDemoSeed() {
  const [lastAction, setLastAction] = useState<"load" | "delete" | null>(null);
  const [actionResult, setActionResult] = useState<SeedActionResult | null>(
    null,
  );

  // GET current counts — re-runs after each successful operation
  const statusQuery = useApiQuery<{ collections: SeedCollectionStatus[] }>({
    queryKey: ["demo", "seed", "status"],
    queryFn: () => demoService.getSeedStatus(),
    cacheTTL: 0, // always fresh
  });

  const seedMutation = useApiMutation<
    SeedOperationResult,
    { action: "load" | "delete"; collections?: SeedCollectionName[] }
  >({
    mutationFn: (vars) => demoService.seed(vars),
    onSuccess: (data, vars) => {
      setLastAction(vars.action);
      setActionResult({ ...data, success: true });
      statusQuery.refetch();
    },
    onError: (err, vars) => {
      setLastAction(vars.action);
      setActionResult({
        success: false,
        message: err.message ?? "Unknown error occurred",
        details: {},
      });
    },
  });

  const run = useCallback(
    (action: "load" | "delete", collections?: SeedCollectionName[]) => {
      setActionResult(null);
      return seedMutation.mutate({ action, collections });
    },
    [seedMutation],
  );

  /** Map of collection name → { seedCount, existingCount } for quick lookup */
  const statusMap: Record<string, SeedCollectionStatus> = {};
  if (statusQuery.data?.collections) {
    for (const col of statusQuery.data.collections) {
      statusMap[col.name] = col;
    }
  }

  return {
    // Status
    statusMap,
    statusLoading: statusQuery.isLoading,
    refetchStatus: statusQuery.refetch,

    // Mutation
    run,
    isLoading: seedMutation.isLoading,
    lastAction,
    actionResult,
    clearResult: () => setActionResult(null),
  };
}
