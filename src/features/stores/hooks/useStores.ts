"use client";

import { useMemo } from "react";
import { useUrlTable } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import type { StoreListItem } from "../types";

interface FirebaseSieveResult {
  items: StoreListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

interface UseStoresOptions {
  initialData?: FirebaseSieveResult;
}

/**
 * Paginated, searchable list of all seller stores.
 * All filter/sort/page state lives in URL params via useUrlTable.
 */
export function useStores(options?: UseStoresOptions) {
  const table = useUrlTable({
    defaults: { pageSize: "24", sorts: "-createdAt" },
  });

  const params = useMemo(() => {
    const sp = new URLSearchParams();
    const q = table.get("q");
    if (q) sp.set("q", q);
    const sorts = table.get("sorts");
    if (sorts) sp.set("sorts", sorts);
    const page = table.get("page");
    if (page) sp.set("page", page);
    const pageSize = table.get("pageSize");
    if (pageSize) sp.set("pageSize", pageSize);
    return sp.toString();
  }, [table]);

  const query = useQuery<FirebaseSieveResult>({
    queryKey: ["stores", "list", params],
    queryFn: () =>
      apiClient.get<FirebaseSieveResult>(
        `/api/stores${params ? `?${params}` : ""}`,
      ) as Promise<FirebaseSieveResult>,
    initialData: options?.initialData,
  });

  return { query, table };
}

