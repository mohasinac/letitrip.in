"use client";

/**
 * createAdminListQuery
 *
 * Factory that eliminates the repeated URLSearchParams-building + useQuery
 * boilerplate across admin list hooks. Each hook only needs to declare:
 * - queryKey prefix
 * - endpoint to call (GET)
 * - (optionally) how to map the API result to a different shape
 *
 * @example
 * ```ts
 * export function useAdminBids(sieveParams: string) {
 *   return createAdminListQuery<{ bids: BidDocument[]; meta: AdminListMeta }>({
 *     queryKey: ["admin", "bids"],
 *     sieveParams,
 *     endpoint: "/api/admin/bids",
 *   });
 * }
 * ```
 */

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";

interface CreateAdminListQueryOptions<TApiResult, TResult = TApiResult> {
  queryKey: string[];
  endpoint: string;
  sieveParams: string;
  transform?: (result: TApiResult) => TResult;
  defaultPageSize?: number;
}

/** Standard meta shape used by most admin list hooks. */
export interface AdminListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Extracts the standard 4-field meta from a sieve result. */
export function extractBasicMeta(result: {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}): AdminListMeta {
  return {
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  };
}

export function createAdminListQuery<TApiResult, TResult = TApiResult>(
  options: CreateAdminListQueryOptions<TApiResult, TResult>,
): UseQueryResult<TResult> {
  const {
    queryKey,
    endpoint,
    sieveParams,
    transform,
    defaultPageSize = 50,
  } = options;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<TResult>({
    queryKey: [...queryKey, sieveParams],
    queryFn: async () => {
      const sp = new URLSearchParams(sieveParams);
      if (!sp.has("pageSize")) sp.set("pageSize", String(defaultPageSize));
      const result = await apiClient.get<TApiResult>(
        `${endpoint}?${sp.toString()}`,
      );
      return transform ? transform(result) : (result as unknown as TResult);
    },
  });
}
