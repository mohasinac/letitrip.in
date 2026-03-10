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

export function useAlgoliaSync() {
  return useMutation<AlgoliaSyncResult, Error, AlgoliaSyncVars>({
    mutationFn: (vars) =>
      apiClient.post<AlgoliaSyncResult>(API_ENDPOINTS.DEMO.ALGOLIA, vars),
  });
}
