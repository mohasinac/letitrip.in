"use client";

/**
 * createAdminListQuery
 *
 * Factory that eliminates the repeated URLSearchParams-parsing + useQuery
 * boilerplate across admin list hooks. Each hook only needs to declare:
 * - queryKey prefix
 * - server action to call
 * - how to map the result to { data, meta }
 *
 * @example
 * ```ts
 * export function useAdminBids(sieveParams: string) {
 *   return createAdminListQuery({
 *     queryKey: ["admin", "bids"],
 *     sieveParams,
 *     action: listAdminBidsAction,
 *     transform: (result) => ({
 *       bids: result.items,
 *       meta: extractBasicMeta(result),
 *     }),
 *   });
 * }
 * ```
 */

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

interface SieveActionParams {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}

interface SieveActionResult<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore?: boolean;
}

interface CreateAdminListQueryOptions<TItem, TResult> {
  queryKey: string[];
  sieveParams: string;
  action: (params: SieveActionParams) => Promise<SieveActionResult<TItem>>;
  transform: (result: SieveActionResult<TItem>) => TResult;
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

/** Parses a sieve params string into the params object expected by server actions. */
function parseSieveParams(
  sieveParams: string,
  defaultPageSize: number,
): SieveActionParams {
  const sp = new URLSearchParams(sieveParams);
  return {
    filters: sp.get("filters") ?? undefined,
    sorts: sp.get("sorts") ?? undefined,
    page: sp.has("page") ? Number(sp.get("page")) : undefined,
    pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : defaultPageSize,
  };
}

export function createAdminListQuery<TItem, TResult>(
  options: CreateAdminListQueryOptions<TItem, TResult>,
): UseQueryResult<TResult> {
  const {
    queryKey,
    sieveParams,
    action,
    transform,
    defaultPageSize = 50,
  } = options;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<TResult>({
    queryKey: [...queryKey, sieveParams],
    queryFn: async () => {
      const params = parseSieveParams(sieveParams, defaultPageSize);
      const result = await action(params);
      return transform(result);
    },
  });
}
