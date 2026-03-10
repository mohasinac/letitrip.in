"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  const statusQuery = useQuery<{ collections: SeedCollectionStatus[] }>({
    queryKey: ["demo", "seed", "status"],
    queryFn: () =>
      apiClient.get<{ collections: SeedCollectionStatus[] }>(
        API_ENDPOINTS.DEMO.SEED_STATUS,
      ),
    staleTime: 0, // always fresh
  });

  const seedMutation = useMutation<
    SeedOperationResult,
    Error,
    { action: "load" | "delete"; collections?: SeedCollectionName[] }
  >({
    mutationFn: (vars) =>
      apiClient.post<SeedOperationResult>(API_ENDPOINTS.DEMO.SEED, vars),
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
      return seedMutation.mutateAsync({ action, collections });
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
    isLoading: seedMutation.isPending,
    lastAction,
    actionResult,
    clearResult: () => setActionResult(null),
  };
}
