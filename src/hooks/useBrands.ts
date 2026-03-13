"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listBrandCategoriesAction } from "@/actions";
import type { CategoryDocument } from "@/db/schema";

/**
 * useBrands
 * Fetches all brand categories (isBrand = true) for filter dropdowns.
 * Returns mapped { value, label } options ready for FilterFacetSection.
 */
export function useBrands() {
  const { data, isLoading } = useQuery<CategoryDocument[]>({
    queryKey: ["categories", "brands", "all"],
    queryFn: () => listBrandCategoriesAction(100),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const brands = useMemo(() => data ?? [], [data]);

  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.id, label: b.name })),
    [brands],
  );

  return { brands, brandOptions, isLoading };
}
