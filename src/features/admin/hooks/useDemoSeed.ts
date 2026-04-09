"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import { API_ENDPOINTS } from "@/constants";
import { demoSeedAction } from "@/actions";
import type { SeedCollectionName, SeedOperationResult } from "@/actions";

export type { SeedCollectionName, SeedOperationResult };

export interface SeedCollectionStatus {
  name: string;
  seedCount: number;
  existingCount: number;
}

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
      apiClient.get(API_ENDPOINTS.DEMO.SEED_STATUS) as Promise<{
        collections: SeedCollectionStatus[];
      }>,
    staleTime: 0, // always fresh
  });

  const seedMutation = useMutation<
    SeedOperationResult,
    Error,
    { action: "load" | "delete"; collections?: SeedCollectionName[] }
  >({
    mutationFn: (vars) => demoSeedAction(vars),
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
