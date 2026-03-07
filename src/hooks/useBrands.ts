"use client";

import { useMemo } from "react";
import { useApiQuery } from "./useApiQuery";
import { categoryService } from "@/services";
import type { CategoryDocument } from "@/db/schema";

/**
 * useBrands
 * Fetches all brand categories (isBrand = true) for filter dropdowns.
 * Returns mapped { value, label } options ready for FilterFacetSection.
 */
export function useBrands() {
  const { data, isLoading } = useApiQuery<CategoryDocument[]>({
    queryKey: ["categories", "brands", "all"],
    queryFn: () => categoryService.listBrands(100),
    cacheTTL: 15 * 60 * 1000, // 15 minutes
  });

  const brands = useMemo(() => data ?? [], [data]);

  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.id, label: b.name })),
    [brands],
  );

  return { brands, brandOptions, isLoading };
}
