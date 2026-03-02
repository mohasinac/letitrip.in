"use client";

import { useMemo } from "react";
import { useApiQuery, useUrlTable } from "@/hooks";
import { storeService } from "@/services";
import type { StoreListItem } from "../types";

interface FirebaseSieveResult {
  items: StoreListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Paginated, searchable list of all seller stores.
 * All filter/sort/page state lives in URL params via useUrlTable.
 */
export function useStores() {
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

  const query = useApiQuery<FirebaseSieveResult>({
    queryKey: ["stores", "list", params],
    queryFn: () => storeService.listStores(params),
  });

  return { query, table };
}
